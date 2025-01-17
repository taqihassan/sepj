const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const authenticateToken = require('../middleware/authenticateToken');

// Route, um Feedback für ein Quiz zu speichern
router.post('/submit', authenticateToken, async (req, res) => {
  const { quizId, feedbackText } = req.body;  // Verwende hier 'feedbackText' statt 'feedback'

  console.log('Request Body:', req.body);  // Logge die Anfrage, um den Inhalt zu prüfen

  if (!quizId || !feedbackText) {
    return res.status(400).json({ message: 'Quiz-ID und Feedbacktext sind erforderlich' });
  }

  try {
    const userId = req.user.userId;
    const newFeedback = new Feedback({
      quizId,
      userId,
      feedbackText,
      createdAt: new Date(),
    });

    await newFeedback.save();
    res.status(201).json({ message: 'Feedback erfolgreich gespeichert' });
  } catch (error) {
    console.error('Fehler beim Speichern des Feedbacks:', error.message);
    res.status(500).json({ message: 'Fehler beim Speichern des Feedbacks', error: error.message });
  }
});

router.get('/:quizId', authenticateToken, async (req, res) => {
  const { quizId } = req.params;
  try {
    const feedbacks = await Feedback.find({ quizId }).populate('userId', 'username');
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('Fehler beim Abrufen der Feedbacks:', error.message);
    res.status(500).json({ message: 'Fehler beim Abrufen der Feedbacks', error: error.message });
  }
});

module.exports = router;
