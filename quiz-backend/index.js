const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const os = require('os');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const User = require('./models/User');
const Quiz = require('./models/Quiz');
const Results = require('./routes/results');
const Feedback = require('./routes/feedback');
const quizzesRoute = require('./routes/quizzes');
const questionsRoute = require('./routes/questions');


const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address; // Gibt die lokale IPv4-Adresse zurück
      }
    }
  }
  return 'localhost'; // Fallback, falls keine IP gefunden wird
};



const app = express();
const server = http.createServer(app); // Use http server for Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3001", // Für lokale Entwicklung
      `http://${getLocalIpAddress()}:3001`, // Dynamische IP-Adresse für das Frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const SECRET_KEY = 'your_secret_key';
const PORT = 3000;
const HOST = '0.0.0.0'; // Erlaubt Verbindungen von externen Geräten
// let activeRooms = {}; // Räume für Multiplayer-Quiz

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3001', // Frontend auf localhost
    `http://${getLocalIpAddress()}:3001`, // Zugriff von einer spezifischen IP-Adresse
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body); // Neu hinzugefügt, loggt den Request-Body
  next();
});
app.use(express.json());


// MongoDB connection
const uri = 'mongodb+srv://wi22b002:oZAs1TPTpnaw70Ew@quiz.jsjxs.mongodb.net/?retryWrites=true&w=majority&appName=Quiz';
mongoose
  .connect(uri)
  .then(() => console.log('MongoDB erfolgreich verbunden'))
  .catch(err => console.error('MongoDB-Verbindung fehlgeschlagen:', err));

// Routes
app.use('/uploads', express.static('uploads'));
app.use('/api/questions', questionsRoute);
app.use('/api/quizzes', quizzesRoute);
app.use('/api/results', Results);
app.use('/api/feedback', Feedback);

// User routes
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'E-Mail existiert bereits' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'Benutzer erfolgreich erstellt' });
  } catch (error) {
    res.status(500).json({ message: 'Interner Serverfehler', error: error.message });
  }
});


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Benutzer nicht gefunden' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Ungültiges Passwort' });

    const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });
    res.status(200).json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Interner Serverfehler', error: error.message });
  }
});

// Route, um die lokale IP bereitzustellen
app.get('/api/ip', (req, res) => {
  res.json({ ip: getLocalIpAddress() });
});


app.get('/test', (req, res) => {
  console.log('Test-Endpunkt wurde aufgerufen!');
  res.send('Backend ist erreichbar!');
});

// Neue Route zum Abrufen eines bestimmten Quizzes basierend auf der quizId Singleplayer
app.get('/api/quizzes/singleplayerplay/:quizId', async (req, res) => {
  const { quizId } = req.params;

  if (!quizId || quizId === 'undefined') {
    return res.status(400).json({ message: 'Ungültige Quiz-ID' });
  }

  try {
    const quiz = await Quiz.findById(quizId).populate('questions');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz nicht gefunden' });
    }
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen des Quizzes', error: error.message });
  }
});


// Socket.io integration for real-time multiplayer
let activeRooms = {};

io.on('connection', (socket) => {
  console.log('Ein Benutzer ist verbunden:', socket.id);

  // Raum erstellen
  socket.on('create-room', ({ roomCode, quizId }) => {
    activeRooms[roomCode] = { 
      users: [], 
      currentQuestionIndex: 0, 
      quizId, // Speichere quizId im Raum
      responses: {}, 
      timer: 30 
    };
    socket.join(roomCode);
    console.log(`Raum erstellt: ${roomCode} mit Quiz ${quizId}`);
    io.to(roomCode).emit('room-created', { roomCode, quizId });
  });

  // Raum beitreten
  socket.on('join-room', ({ roomCode, username }) => {
    const room = activeRooms[roomCode];
    if (!room) {
      socket.emit('room-error', 'Raum nicht gefunden');
      return;
    }
    room.users.push({ id: socket.id, username, score: 0 });
    socket.join(roomCode);
    io.to(roomCode).emit('user-joined', { username, users: room.users, quizId: room.quizId });
  });

  // Quiz starten
  socket.on('start-quiz', async (roomCode) => {
    const room = activeRooms[roomCode];
    if (room) {
      const quiz = await Quiz.findById(room.quizId).populate("questions");
      if (!quiz) {
        socket.emit("room-error", "Quiz nicht gefunden");
        return;
      }

      room.questions = quiz.questions;
      room.currentQuestionIndex = 0;
      room.responses = {}; // Antworten zurücksetzen
      room.timer = 30; // Timer starten

      const firstQuestion = room.questions[room.currentQuestionIndex];
      io.to(roomCode).emit("next-question", { question: firstQuestion, timer: room.timer, quizId: room.quizId });

      startQuestionTimer(roomCode);
    }
  });

  // Timer-Funktion
  function startQuestionTimer(roomCode) {
    const room = activeRooms[roomCode];
    if (!room) return;
  
    const timerInterval = setInterval(() => {
      room.timer -= 1;
      io.to(roomCode).emit("timer-update", { timer: room.timer });
  
      if (room.timer <= 0 || Object.keys(room.responses).length === room.users.length) {
        clearInterval(timerInterval);
  
        validateAnswers(room);
  
        if (room.currentQuestionIndex + 1 < room.questions.length) {
          room.currentQuestionIndex++;
          room.timer = 30;
          room.responses = {};
  
          const nextQuestion = room.questions[room.currentQuestionIndex];
          io.to(roomCode).emit("next-question", { question: nextQuestion, timer: room.timer });
  
          startQuestionTimer(roomCode);
        } else {
          io.to(roomCode).emit("quiz-finished", { results: room.users });
          delete activeRooms[roomCode];
        }
      }
    }, 1000);
  }
  // Antworten validieren
  function validateAnswers(room) {
    const currentQuestion = room.questions[room.currentQuestionIndex];
    const correctAnswers = currentQuestion.options.filter((o) => o.isCorrect).map((o) => o.text);
  
    room.users.forEach((user) => {
      const userAnswer = room.responses[user.id] || "Keine Antwort";
      if (correctAnswers.includes(userAnswer)) {
        user.score += 100;
      }
    });
  }

  // Antwort einreichen
  socket.on("submit-answer", ({ roomCode, answer }) => {
    const room = activeRooms[roomCode];
    if (!room) return;
  
    room.responses[socket.id] = answer;
    if (Object.keys(room.responses).length === room.users.length) {
      room.timer = 0;
    }
  });

  // Benutzer trennt Verbindung
  socket.on('disconnect', () => {
    console.log('Ein Benutzer hat die Verbindung getrennt:', socket.id);
    for (const roomCode in activeRooms) {
      activeRooms[roomCode].users = activeRooms[roomCode].users.filter(user => user.id !== socket.id);
      io.to(roomCode).emit('user-left', { userId: socket.id, users: activeRooms[roomCode].users });
    }
  });
});






// Start server
server.listen(PORT, () => {
  console.log(`Server läuft auf http://${getLocalIpAddress()}:${PORT}`);
});
