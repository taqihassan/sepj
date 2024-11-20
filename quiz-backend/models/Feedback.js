const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  feedbackText: { type: String, required: true },  // Beibehalte den Namen als 'feedbackText'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
