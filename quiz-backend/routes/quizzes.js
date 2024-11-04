const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken'); // Middleware für Authentifizierung

// Route, um ein Quiz zu erstellen
router.post('/create', authenticateToken, async (req, res) => {
  const { title, description, questions } = req.body;
  const userId = req.user.userId; // User ID wird aus dem JWT Token gelesen

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User nicht gefunden' });
    }

    const quiz = new Quiz({
      title,
      description,
      questions, // Array von Frage-ObjectIds
      createdBy: user._id,
      createdAt: new Date(),
    });

    await quiz.save();
    res.status(201).json({ message: 'Quiz erfolgreich erstellt', quiz });
  } catch (error) {
    console.error('Fehler beim Erstellen des Quizzes:', error);
    res.status(500).json({ message: 'Fehler beim Erstellen des Quizzes', error: error.message });
  }
});

// Route, um alle vom Benutzer erstellten Quizzes abzurufen
router.get('/my-quizzes', authenticateToken, async (req, res) => {
  const userId = req.user.userId; // User ID wird aus dem JWT Token gelesen

  try {
    const quizzes = await Quiz.find({ createdBy: userId }).populate('createdBy', 'username');
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Fehler beim Abrufen der Quizzes:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Quizzes', error: error.message });
  }
});

// Route, um ein Quiz zu löschen
router.delete('/:quizId', authenticateToken, async (req, res) => {
  const { quizId } = req.params;

  try {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz nicht gefunden' });
    }

    // Sicherstellen, dass der angemeldete Benutzer der Ersteller ist
    if (quiz.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Nicht autorisiert, dieses Quiz zu löschen' });
    }

    await quiz.remove();
    res.status(200).json({ message: 'Quiz erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Quizzes:', error);
    res.status(500).json({ message: 'Fehler beim Löschen des Quizzes', error: error.message });
  }
});

// Route, um ein Quiz zu bearbeiten
router.put('/:quizId', authenticateToken, async (req, res) => {
  const { quizId } = req.params;
  const { title, description, questions } = req.body;

  try {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz nicht gefunden' });
    }

    // Sicherstellen, dass der angemeldete Benutzer der Ersteller ist
    if (quiz.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Nicht autorisiert, dieses Quiz zu bearbeiten' });
    }

    // Aktualisieren der Quiz-Daten
    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    if (Array.isArray(questions)) {
      quiz.questions = questions; // Array von Frage-ObjectIds wird aktualisiert
    }

    await quiz.save();
    res.status(200).json({ message: 'Quiz erfolgreich aktualisiert', quiz });
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Quizzes:', error);
    res.status(500).json({ message: 'Fehler beim Bearbeiten des Quizzes', error: error.message });
  }
});

module.exports = router;
