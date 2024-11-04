const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const authenticateToken = require('../middleware/authenticateToken');

// Route to create a new question
router.post('/create', authenticateToken, async (req, res) => {
  const { text, options } = req.body;

  try {
    // Find the user who is creating the question using the token
    const userId = req.user.userId;

    // Create the new question using the 'text', 'options', and 'createdBy' fields
    const question = new Question({
      text,
      options, // This should be an array of objects: [{ text: String, isCorrect: Boolean }]
      createdBy: userId, // Store the user's ID who created the question
    });

    // Save the question to the database
    await question.save();
    res.status(201).json({ message: 'Frage erfolgreich erstellt', question });
  } catch (error) {
    console.error('Fehler beim Erstellen der Frage:', error); // Log the detailed error
    res.status(500).json({ message: 'Fehler beim Erstellen der Frage', error: error.message });
  }
});

// Route to fetch all questions created by the logged-in user
router.get('/my-questions', authenticateToken, async (req, res) => {
  try {
    // Find questions created by the logged-in user
    const userId = req.user.userId;
    const questions = await Question.find({ createdBy: userId }); // Fetch all questions for the logged-in user
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions', error });
  }
});

// Route to fetch all questions (for all users - useful for admins, for example)
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find(); // Fetch all questions
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions', error });
  }
});

module.exports = router;
