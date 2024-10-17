const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');  // Importiere das User-Modell
const Question = require('./models/Question');  // Importiere das Question-Modell

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB-Verbindung herstellen
const uri = 'mongodb+srv://wi22b002:oZAs1TPTpnaw70Ew@quiz.jsjxs.mongodb.net/?retryWrites=true&w=majority&appName=Quiz';  // Ersetze <username> und <password> mit deinen tatsächlichen Anmeldedaten
mongoose.connect(uri).then(async () => {
  console.log('MongoDB erfolgreich verbunden');
}).catch(err => {
  console.error('MongoDB-Verbindung fehlgeschlagen:', err);
});

// Route zum Erstellen von Fragen
app.post('/questions/create', async (req, res) => {
  const { text, options, correctAnswer, userId } = req.body;

  try {
    // Konvertiere die userId in eine MongoDB ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Finde den Benutzer mit der konvertierten ObjectId
    const user = await User.findById(userObjectId);
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    const question = new Question({
      text,
      options,
      correctAnswer,
      createdBy: user._id  // Verknüpft die Frage mit dem Benutzer
    });

    await question.save();
    res.status(201).json({ message: 'Frage erfolgreich erstellt', question });
  } catch (error) {
    // Verbesserte Fehlerbehandlung und detailliertes Logging
    console.error('Fehler beim Erstellen der Frage:', error.message);  // Fehlerdetails in der Konsole anzeigen
    res.status(500).json({ message: 'Fehler beim Erstellen der Frage', error: error.message });  // Fehlerdetails an Postman zurückgeben
  }
});

// Server starten
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
