const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;

const finishedquizSchema = new Schema({
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, required: true },
    title: { type: String, ref: 'Quiz' },
    description: { type: String, ref: 'Quiz' },
    userAnswers: [{
        text: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
        correctAnswer: { type: String } // New field to store the correct answer
    }],
    createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model('FinishedQuiz', finishedquizSchema);
