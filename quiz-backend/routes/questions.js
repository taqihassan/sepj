const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const authenticateToken = require('../middleware/authenticateToken');

// Route to create a new question
router.post('/api/create', authenticateToken, async (req, res) => {
  const { text, options } = req.body;

  try {
    const userId = req.user.userId;
    const question = new Question({
      text,
      options,
      createdBy: userId,
    });

    await question.save();
    res.status(201).json({ message: 'Frage erfolgreich erstellt', question });
  } catch (error) {
    console.error('Fehler beim Erstellen der Frage:', error);
    res.status(500).json({ message: 'Fehler beim Erstellen der Frage', error: error.message });
  }
});

// Route to fetch all questions created by the logged-in user
router.get('/my-questions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const questions = await Question.find({ createdBy: userId });
    res.status(200).json(questions);
  } catch (error) {
    console.error('Fehler beim Abrufen der Fragen:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Fragen', error });
  }
});

// Route to delete a specific question by ID
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const questionId = req.params.id;
    await Question.findByIdAndDelete(questionId);
    res.status(200).json({ message: 'Frage erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der Frage:', error);
    res.status(500).json({ message: 'Fehler beim Löschen der Frage', error });
  }
});

// Route to update a specific question by ID
router.put('/:id', authenticateToken, async (req, res) => {
  const { text, options } = req.body;

  try {
    const questionId = req.params.id;
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { text, options },
      { new: true } // Return the updated document
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Frage nicht gefunden' });
    }

    res.status(200).json({ message: 'Frage erfolgreich aktualisiert', updatedQuestion });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Frage:', error);
    res.status(500).json({ message: 'Fehler beim Aktualisieren der Frage', error: error.message });
  }
});



module.exports = router;
