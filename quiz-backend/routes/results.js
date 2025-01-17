const express = require('express');
const router = express.Router();
const FinishedQuiz = require('../models/FinishedQuiz');
const authenticateToken = require('../middleware/authenticateToken');
const FinishedMultiQuiz = require('../models/FinishedMultiQuiz'); // Multiplayer Modell

// 📌 SPEICHERE MULTIPLAYER QUIZ-ERGEBNISSE
router.post('/save-multiplayer', authenticateToken, async (req, res) => {
  const { roomCode, quizId, users } = req.body;

  try {
      const finishedQuiz = new FinishedMultiQuiz({
          roomCode,
          quizId,
          users,
          createdAt: new Date(),
      });

      const savedResult = await finishedQuiz.save();
      res.status(201).json({ message: 'Multiplayer-Ergebnisse erfolgreich gespeichert', resultId: savedResult._id });
  } catch (error) {
      console.error('Fehler beim Speichern der Multiplayer-Ergebnisse:', error);
      res.status(500).json({ message: 'Fehler beim Speichern der Ergebnisse', error: error.message });
  }
});

// 📌 RUFEN MULTIPLAYER ERGEBNISSE FÜR EINEN RAUM AB
router.get('/multiplayer/results/:roomCode', authenticateToken, async (req, res) => {
  const { roomCode } = req.params;

  try {
      const results = await FinishedMultiQuiz.findOne({ roomCode });
      if (!results) {
          return res.status(404).json({ message: 'Keine Multiplayer-Ergebnisse gefunden' });
      }

      res.status(200).json(results);
  } catch (error) {
      console.error('Fehler beim Abrufen der Multiplayer-Ergebnisse:', error);
      res.status(500).json({ message: 'Fehler beim Abrufen der Multiplayer-Ergebnisse', error: error.message });
  }
});


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


router.get('/leaderboard/:quizId', authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params; // Quiz-ID aus der URL
    if (!quizId) {
      return res.status(400).json({ message: 'Quiz-ID fehlt!' });
    }
    // Ergebnisse für das angegebene Quiz filtern und nach Punkten sortieren
    const leaderboard = await FinishedQuiz.find({ quizId })
      .populate('userId', 'username') // Benutzername hinzufügen
      .populate('quizId', 'title') // Quiz-Titel hinzufügen (optional)
      .sort({ score: -1 }) // Ergebnisse nach Punkten absteigend sortieren
      .limit(10); // Optional: Begrenze auf die Top 10
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Fehler beim Abrufen des Leaderboards pro Quiz:', error.message);
    res.status(500).json({ message: 'Fehler beim Abrufen des Leaderboards pro Quiz', error: error.message });
  }
});

module.exports = router;