const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Question = require('../models/Question');

// Quiz erstellen
router.post('/create', async (req, res) => {
  const { title, questionIds, userId } = req.body;

  try {
    const user = await User.findById(userId); // Benutzer finden
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    const questions = await Question.find({ _id: { $in: questionIds } }); // Fragen finden
    if (questions.length !== questionIds.length) {
      return res.status(400).json({ message: 'Einige Fragen nicht gefunden' });
    }

    const quiz = new Quiz({
      title,
      questions: questionIds,
      createdBy: user._id
    });

    await quiz.save(); // Quiz speichern

    // Quiz mit dem Benutzer verknüpfen
    user.createdQuizzes.push(quiz._id);
    await user.save();

    res.status(201).json({ message: 'Quiz erfolgreich erstellt', quiz });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Erstellen des Quizzes', error });
  }
});

module.exports = router;
                                                                                                                                  