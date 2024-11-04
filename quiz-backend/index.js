const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Routen für die Erstellung von Fragen und Quiz
const quizzesRoute = require('./routes/quizzes');
const questionsRoute = require('./routes/questions');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = 'your_secret_key';

// MongoDB-Verbindung herstellen
const uri = 'mongodb+srv://wi22b002:oZAs1TPTpnaw70Ew@quiz.jsjxs.mongodb.net/?retryWrites=true&w=majority&appName=Quiz';
mongoose.connect(uri).then(async () => {
  console.log('MongoDB erfolgreich verbunden');
}).catch(err => {
  console.error('MongoDB-Verbindung fehlgeschlagen:', err);
});

// Routen einrichten
app.use('/api/questions', questionsRoute);
app.use('/api/quizzes', quizzesRoute);

// Registrierungsroute
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'E-Mail existiert bereits' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      createdQuizzes: [],
      createdAt: new Date()
    });
    await newUser.save();
    res.status(201).json({ message: 'Benutzer erfolgreich erstellt' });
  } catch (error) {
    res.status(500).json({ message: 'Interner Serverfehler', error: error.message });
  }
});

// Login-Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Falsches Passwort' });
    }
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login erfolgreich', token });
  } catch (error) {
    res.status(500).json({ message: 'Interner Serverfehler', error: error.message });
  }
});

// Server starten
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
