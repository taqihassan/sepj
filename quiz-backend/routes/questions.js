const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const User = require('../models/User');

// Frage erstellen
router.post('/create', async (req, res) => {
  const { text, options, correctAnswer, userId } = req.body;

  try {
    const user = await User.findById(userId); // Benutzer finden
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    const question = new Question({
      text,
      options,
      correctAnswer,
      createdBy: user._id
    });

    await question.save(); // Frage in MongoDB speichern
    res.status(201).json({ message: 'Frage erfolgreich erstellt', question });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim der Frage', error });
  }
});

module.exports = router;
