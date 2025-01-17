// FinishedMultiQuiz.js - MongoDB Schema für abgeschlossene Multiplayer-Quizze
const mongoose = require("mongoose");

const FinishedMultiQuizSchema = new mongoose.Schema({
  roomCode: { type: String, required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  users: [
    {
      username: { type: String, required: true },
      score: { type: Number, required: true },
      answers: [
        {
          questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
          answerText: { type: String, required: true },
          isCorrect: { type: Boolean, required: true },
        },
      ],
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FinishedMultiQuiz", FinishedMultiQuizSchema);