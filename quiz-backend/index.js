const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001", // Erlaubt die Verbindung vom Frontend
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Beispiel-Fragen mit den korrekten Antworten
const questions = [
  {
    text: "Was ist die Hauptstadt von Frankreich?",
    options: ["Berlin", "Madrid", "Paris", "Rom"],
    correctAnswer: "Paris"
  },
  {
    text: "Was ist die Hauptstadt von Spanien?",
    options: ["Berlin", "Madrid", "Paris", "Rom"],
    correctAnswer: "Madrid"
  }

];

// Punkte speichern
const players = {};

// Wenn sich ein Client mit dem Socket verbindet
io.on('connection', (socket) => {
  console.log('Ein Spieler hat sich verbunden:', socket.id);

  // Start mit der ersten Frage
  let currentQuestionIndex = 0;
  let playerScore = 0;
  players[socket.id] = playerScore;

  // Sende die erste Frage
  socket.emit('next-question', questions[currentQuestionIndex]);

  // Antwort auf eine Frage empfangen
  socket.on('submit-answer', (answer) => {
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    if (answer === correctAnswer) {
      playerScore += 100; // 100 Punkte für die richtige Antwort
    }

    // Speichere den aktuellen Punktestand
    players[socket.id] = playerScore;

    // Wenn es noch eine nächste Frage gibt, sende sie
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      socket.emit('next-question', questions[currentQuestionIndex]);
    } else {
      // Wenn keine weiteren Fragen übrig sind, sende das Endergebnis
      socket.emit('quiz-end', { score: playerScore });
    }
  });

  // Spieler trennt sich
  socket.on('disconnect', () => {
    console.log('Spieler hat die Verbindung getrennt:', socket.id);
    delete players[socket.id]; // Entferne den Spieler
  });
});

// Server starten
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

