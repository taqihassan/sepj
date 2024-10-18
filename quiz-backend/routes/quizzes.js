const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');

// Route to create a quiz
router.post('/create', async (req, res) => {
  const { title, description, questions, userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const quiz = new Quiz({
      title,
      description,
      questions, // Array of question ObjectIds
      createdBy: user._id
    });

    await quiz.save();
    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Error creating quiz', error: error.message });
  }
});

module.exports = router;
