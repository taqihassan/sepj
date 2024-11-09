const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const Quiz = require('../models/Quiz');
const authenticateToken = require('../middleware/authenticateToken');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename with timestamp
  }
});
const upload = multer({ storage });

// Route to handle image uploads for quizzes
router.post('/upload-image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Kein Bild hochgeladen' });
    }
    const quizId = req.body.quizId;
    const imagePath = `/uploads/${req.file.filename}`;

    // Update quiz document with new image path
    await Quiz.findByIdAndUpdate(quizId, { image: imagePath });

    res.status(200).json({ imagePath });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Fehler beim Hochladen des Bildes', error: error.message });
  }
});

// Route to create a new quiz
router.post('/create', authenticateToken, async (req, res) => {
  const { title, description, questions, timer, image } = req.body;
  const userId = req.user.userId;
  try {
    const quiz = new Quiz({
      title,
      description,
      questions,
      timer,
      createdBy: userId,
      createdAt: new Date(),
      image // Include the image path in the quiz creation
    });
    await quiz.save();
    res.status(201).json({ message: 'Quiz erfolgreich erstellt', quiz });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Erstellen des Quizzes', error: error.message });
  }
});

// Route to retrieve all quizzes created by the authenticated user
router.get('/my-quizzes', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const quizzes = await Quiz.find({ createdBy: userId });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen der Quizzes', error: error.message });
  }
});

// Route to retrieve a specific quiz by ID (for editing purposes)
router.get('/:quizId', authenticateToken, async (req, res) => {
  const { quizId } = req.params;

  if (!quizId || quizId === 'undefined') {
    return res.status(400).json({ message: 'Ungültige Quiz-ID' });
  }

  try {
    // Populate the questions and createdBy fields so they are visible on the frontend
    const quiz = await Quiz.findById(quizId)
      .populate('questions')
      .populate('createdBy', 'username');
      
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz nicht gefunden' });
    }
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen des Quizzes', error: error.message });
  }
});

// Route to update a quiz
router.put('/:quizId', authenticateToken, async (req, res) => {
  const { quizId } = req.params;
  const { title, description, timer, questions, image } = req.body;

  if (!quizId || quizId === 'undefined') {
    return res.status(400).json({ message: 'Ungültige Quiz-ID' });
  }

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz nicht gefunden' });
    }
    // Ensure that only the creator can edit the quiz
    if (quiz.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Nicht autorisiert, dieses Quiz zu bearbeiten' });
    }

    // Update fields
    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    quiz.timer = timer || quiz.timer;
    quiz.image = image || quiz.image; // Update the image if provided
    if (questions) {
      quiz.questions = questions;
    }

    await quiz.save();
    res.status(200).json({ message: 'Quiz erfolgreich aktualisiert', quiz });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Quizzes', error: error.message });
  }
});

// Route to delete a quiz
router.delete('/:quizId', authenticateToken, async (req, res) => {
  const { quizId } = req.params;

  if (!quizId || quizId === 'undefined') {
    return res.status(400).json({ message: 'Ungültige Quiz-ID' });
  }

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz nicht gefunden' });
    }
    if (quiz.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Nicht autorisiert, dieses Quiz zu löschen' });
    }
    await quiz.deleteOne(); // Use deleteOne() instead of remove()
    res.status(200).json({ message: 'Quiz erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Quizzes:', error);
    res.status(500).json({ message: 'Fehler beim Löschen des Quizzes', error: error.message });
  }
});

module.exports = router;
