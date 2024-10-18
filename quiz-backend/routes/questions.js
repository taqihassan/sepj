const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const User = require('../models/User');

// Route to create a new question
router.post('/create', async (req, res) => {
  const { text, options, userId } = req.body; // No 'correctAnswer' field anymore

  try {
    // Find the user who is creating the question
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    // Create the new question using the 'text', 'options', and 'createdBy' fields
    const question = new Question({
      text,
      options, // This should be an array of objects: [{ text: String, isCorrect: Boolean }]
      createdBy: user._id, // Store the user's ID who created the question
    });

    // Save the question to the database
    await question.save();
    res.status(201).json({ message: 'Frage erfolgreich erstellt', question });
  } catch (error) {
    console.error('Fehler beim Erstellen der Frage:', error); // Log the detailed error
    res.status(500).json({ message: 'Fehler beim Erstellen der Frage', error: error.message });
  }
});

// Route to fetch all questions
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
