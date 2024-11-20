const express = require('express');
const router = express.Router();
const FinishedQuiz = require('../models/FinishedQuiz');
const authenticateToken = require('../middleware/authenticateToken');

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
        createdAt: new Date()
        });
        await finishedQuiz.save();
        res.status(201).json({ message: 'Results saved successfully' });
    } catch (error) {
        console.error('Error saving results:', error);
        res.status(500).json({ message: 'Error saving results', error: error.message });
    }
    });

module.exports = router;