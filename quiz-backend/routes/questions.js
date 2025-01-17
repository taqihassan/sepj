const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Question = require('../models/Question');
const authenticateToken = require('../middleware/authenticateToken');


// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Route to handle image upload for questions
router.post('/upload-image', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Kein Bild hochgeladen' });
    }
    res.status(200).json({ imagePath: `/uploads/${req.file.filename}` });
  } catch (error) {
    console.error('Fehler beim Hochladen des Bildes:', error);
    res.status(500).json({ message: 'Fehler beim Hochladen des Bildes', error: error.message });
  }
});

// Route to create a new question
router.post('/create', authenticateToken, async (req, res) => {
  const { text, options, image } = req.body;

  try {
    const userId = req.user.userId;
    const question = new Question({
      text,
      options,
      image, // Store the image path if provided
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

// Route to update a specific question by ID with optional image upload
router.put('/update-image/:id', authenticateToken, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { text, options } = req.body;

  try {
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Frage nicht gefunden' });
    }

    // Update question details
    question.text = text;
    question.options = JSON.parse(options); // Parse options if sent as a JSON string

    // If a new image was uploaded, update the image field
    if (req.file) {
      question.image = `/uploads/${req.file.filename}`;
    }

    await question.save();
    res.status(200).json({ message: 'Frage erfolgreich aktualisiert', question });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Frage:', error);
    res.status(500).json({ message: 'Fehler beim Aktualisieren der Frage', error: error.message });
  }
});

// Standard route to update question details without image upload
router.put('/:id', authenticateToken, async (req, res) => {
  const { text, options, image } = req.body;

  try {
    const questionId = req.params.id;
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { text, options, image },
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