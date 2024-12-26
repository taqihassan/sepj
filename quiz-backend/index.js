const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Quiz = require('./models/Quiz');
const Results = require('./routes/results');
const Feedback = require('./routes/feedback');
const quizzesRoute = require('./routes/quizzes');
const questionsRoute = require('./routes/questions');

const app = express();
const server = http.createServer(app); // Use http server for Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3001",  // Für lokale Entwicklung auf deinem Rechner
      "http://192.x.x.x:3001" // Ersetze 192.168.x.x mit deiner lokalen IP-Adresse
    ],
    methods: ["GET", "POST"],
  },
});

const SECRET_KEY = 'your_secret_key';
const PORT = 3000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3001",  // Für lokale Entwicklung
    "http://192.x.x.x:3001" // Für Zugriff vom Handy oder anderen Geräten (lokale IP-Adresse)
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
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
  
  console.log("Login-Request erhalten:");
  console.log("Body:", req.body);

  try {
    // Prüfen, ob der Benutzer existiert
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Benutzer nicht gefunden:", email);
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    console.log("Benutzer gefunden:", user);

    // Passwort validieren
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Ungültiges Passwort für Benutzer:", email);
      return res.status(401).json({ message: 'Ungültiges Passwort' });
    }

    console.log("Passwort erfolgreich validiert");

    // JWT-Token erstellen
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
    console.log("JWT-Token erstellt:", token);

    res.status(200).json({
      message: 'Login erfolgreich',
      token,
      userId: user._id,
    });
  } catch (error) {
    console.error("Interner Serverfehler:", error.message);
    res.status(500).json({ message: 'Interner Serverfehler', error: error.message });
  }
});


app.get('/test', (req, res) => {
  console.log('Test-Endpunkt wurde aufgerufen!');
  res.send('Backend ist erreichbar!');
});


// Socket.io integration for real-time multiplayer
let activeRooms = {};

io.on('connection', (socket) => {
  console.log('Ein Benutzer ist verbunden:', socket.id);

  socket.on('create-room', ({ roomCode, quizId }) => {
    activeRooms[roomCode] = { users: [], currentQuestionIndex: 0, quizId };
    socket.join(roomCode);
    console.log(`Raum erstellt: ${roomCode} mit Quiz ${quizId}`);
    io.to(roomCode).emit('room-created', roomCode);
  });

  socket.on('join-room', ({ roomCode, username }) => {
    if (!activeRooms[roomCode]) {
      socket.emit('room-error', 'Raum nicht gefunden');
      return;
    }
    activeRooms[roomCode].users.push({ id: socket.id, username, score: 0 });
    socket.join(roomCode);
    io.to(roomCode).emit('user-joined', { username, users: activeRooms[roomCode].users });
  });

  socket.on('start-quiz', (roomCode) => {
    if (activeRooms[roomCode]) {
      const quizId = activeRooms[roomCode].quizId;
      if (!quizId) {
        socket.emit('room-error', 'Kein Quiz ausgewählt');
        return;
      }
      Quiz.findById(quizId)
        .populate('questions')
        .then(quiz => {
          io.to(roomCode).emit('quiz-started', { quiz });
        })
        .catch(err => {
          console.error('Fehler beim Laden des Quizzes:', err.message);
          socket.emit('room-error', 'Fehler beim Laden des Quizzes');
        });
    }
  });

  socket.on('submit-answer', ({ roomCode, answer }) => {
    if (activeRooms[roomCode]) {
      console.log(`Antwort von Raum ${roomCode}:`, answer);
      io.to(roomCode).emit('answer-received', { userId: socket.id, answer });
    }
  });

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
  console.log(`Server läuft auf Port ${PORT}`);
});
