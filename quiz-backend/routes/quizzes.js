const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const authenticateToken = require('../middleware/authenticateToken');

// Route, um ein Quiz zu erstellen
router.post('/create', authenticateToken, async (req, res) => {
  const { title, description, questions, timer } = req.body;
  const userId = req.user.userId;
  try {
    const quiz = new Quiz({
      title,
      description,
      questions,
      timer,
      createdBy: userId,
      createdAt: new Date(),
    });
    await quiz.save();
    res.status(201).json({ message: 'Quiz erfolgreich erstellt', quiz });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Erstellen des Quizzes', error: error.message });
  }
});

// Route, um alle vom Benutzer erstellten Quizzes abzurufen
router.get('/my-quizzes', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const quizzes = await Quiz.find({ createdBy: userId });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen der Quizzes', error: error.message });
  }
});

// Route, um ein Quiz abzurufen (Bearbeitungsansicht)
router.get('/:quizId', authenticateToken, async (req, res) => {
  const { quizId } = req.params;

  if (!quizId || quizId === 'undefined') {
    return res.status(400).json({ message: 'Ungültige Quiz-ID' });
  }

  try {
    // Populiere die Fragen, damit sie im Frontend sichtbar sind
    const quiz = await Quiz.findById(quizId)
      .populate('questions')
      .populate('createdBy', 'username');
      
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz nicht gefunden' });
    }
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen des Quizzes', error: error.message });
  }
});

// Route, um ein Quiz zu aktualisieren
router.put('/:quizId', authenticateToken, async (req, res) => {
  const { quizId } = req.params;
  const { title, description, timer, questions } = req.body;

  if (!quizId || quizId === 'undefined') {
    return res.status(400).json({ message: 'Ungültige Quiz-ID' });
  }

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz nicht gefunden' });
    }
    // Sicherstellen, dass nur der Ersteller das Quiz bearbeiten kann
    if (quiz.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Nicht autorisiert, dieses Quiz zu bearbeiten' });
    }

    // Aktualisieren der Felder
    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    quiz.timer = timer || quiz.timer;
    if (questions) {
      quiz.questions = questions;
    }

    await quiz.save();
    res.status(200).json({ message: 'Quiz erfolgreich aktualisiert', quiz });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Quizzes', error: error.message });
  }
});

// Route, um ein Quiz zu löschen
router.delete('/:quizId', authenticateToken, async (req, res) => {
  const { quizId } = req.params;

  if (!quizId || quizId === 'undefined') {
    return res.status(400).json({ message: 'Ungültige Quiz-ID' });
  }

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz nicht gefunden' });
    }
    if (quiz.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Nicht autorisiert, dieses Quiz zu löschen' });
    }
    await quiz.deleteOne(); // Verwende deleteOne() statt remove(), da es empfohlen wird
    res.status(200).json({ message: 'Quiz erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Quizzes:', error);
    res.status(500).json({ message: 'Fehler beim Löschen des Quizzes', error: error.message });
  }
});

module.exports = router;
