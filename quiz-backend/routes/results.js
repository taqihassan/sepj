const express = require('express');
const router = express.Router();
const FinishedQuiz = require('../models/FinishedQuiz');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const results = await FinishedQuiz.find()
      .populate('quizId', 'title') // Quiz-Titel
      .populate('userId', 'username') // Username des Benutzers
      .sort({ createdAt: -1 }); // Sortiere nach dem neuesten Ergebnis

    res.status(200).json(results);
  } catch (error) {
    console.error('Fehler beim Abrufen der Ergebnisse:', error.message);
    res.status(500).json({ message: 'Fehler beim Abrufen der Ergebnisse', error: error.message });
  }
});

router.get('/all-results', authenticateToken, async (req, res) => {
  try {
    const results = await FinishedQuiz.find()
      .populate('quizId', 'title') // Quiz-Titel hinzufügen
      .populate('userId', 'username') // Benutzername hinzufügen
      .sort({ createdAt: -1 }); // Ergebnisse nach Datum sortieren

    res.status(200).json(results); // Rückgabe aller Ergebnisse
  } catch (error) {
    console.error('Fehler beim Abrufen aller Ergebnisse:', error.message);
    res.status(500).json({ message: 'Fehler beim Abrufen der Ergebnisse', error: error.message });
  }
});



// Route to save the results of a finished quiz
router.post('/save', authenticateToken, async (req, res) => {
    const { quizId, score, title, description, userAnswers } = req.body;
    const userId = req.user.userId;
  
    try {
      const finishedQuiz = new FinishedQuiz({
        quizId,
        userId,
        score,
        title,
        description,
        userAnswers,
        createdAt: new Date(),
      });
  
      const savedResult = await finishedQuiz.save();
      res.status(201).json({ message: 'Results saved successfully', resultId: savedResult._id });
    } catch (error) {
      console.error('Error saving results:', error);
      res.status(500).json({ message: 'Error saving results', error: error.message });
    }
  });
  
    // Route to get a specific result by resultId
router.get('/:resultId', authenticateToken, async (req, res) => {
    const { resultId } = req.params;
  
    if (!resultId) {
      return res.status(400).json({ message: 'Result ID is required' });
    }
  
    try {
      const result = await FinishedQuiz.findById(resultId).populate('quizId', 'title description');
      if (!result) {
        return res.status(404).json({ message: 'Result not found' });
      }
  
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching result:', error);
      res.status(500).json({ message: 'Error fetching result', error: error.message });
    }
  });

module.exports = router;