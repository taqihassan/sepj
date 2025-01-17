const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const FinishedQuiz = require('../models/FinishedQuiz');
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
  try {
    const quiz = new Quiz({
      title,
      description,
      questions,
      timer,
      createdAt: new Date(),
      createdBy: req.user.userId, // Füge den User hinzu, der das Quiz erstellt hat
      image // Include the image path in the quiz creation
    });
    await quiz.save();
    res.status(201).json({ message: 'Quiz erfolgreich erstellt', quiz });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Erstellen des Quizzes', error: error.message });
  }
});


router.get('/my-quizzes',authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const quizzes = await Quiz.find({ createdBy: userId });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen der Quizzes', error: error.message });
  }
});

// Route to retrieve all quizzes
router.get('/all-quizzes', authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('createdBy', 'username');
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen der Quizzes', error: error.message });
  }
});

// Route to retrieve a specific quiz by ID for playing
router.get('/play/:quizId', authenticateToken, async (req, res) => {
  const { quizId } = req.params;

  if (!quizId || quizId === 'undefined') {
    return res.status(400).json({ message: 'Ungültige Quiz-ID' });
  }

  try {
    // Populate the questions and their options
    const quiz = await Quiz.findById(quizId)
      .populate('questions')
      .populate('createdBy', 'username');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz nicht gefunden' });
    }

    // Debug: Ausgabe der abgerufenen Daten
    console.log('Quiz:', quiz);
    console.log('Fragen:', quiz.questions);

    res.status(200).json(quiz);
  } catch (error) {
    console.error('Fehler beim Abrufen des Quizzes:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen des Quizzes', error: error.message });
  }
});




// Route to start the quiz
router.post('/start/:quizId', authenticateToken, async (req, res) => {
  const { quizId } = req.params;

  if (!quizId || quizId === 'undefined') {
    return res.status(400).json({ message: 'Ungültige Quiz-ID' });
  }

  try {
    const quiz = await Quiz.findById(quizId).populate('questions');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz nicht gefunden' });
    }

    // Initialize the quiz session
    const session = {
      quizId,
      currentQuestionIndex: 0,
      score: 0,
      startTime: new Date(),
      questions: quiz.questions,
      timer: quiz.timer
    };

    res.status(200).json({ message: 'Quiz gestartet', session });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Starten des Quizzes', error: error.message });
  }
});

// Route to answer a question in the quiz
router.post('/answer/:quizId', authenticateToken, async (req, res) => {
  const { quizId } = req.params;
  const { sessionId, answer, questionIndex, timeTaken } = req.body;

  if (!quizId || quizId === 'undefined') {
    return res.status(400).json({ message: 'Ungültige Quiz-ID' });
  }

  try {
    // Find the quiz and relevant question
    const quiz = await Quiz.findById(quizId).populate('questions');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz nicht gefunden' });
    }

    const question = quiz.questions[questionIndex];
    if (!question) {
      return res.status(400).json({ message: 'Ungültige Frage' });
    }

    // Calculate score based on time taken
    let maxPoints = 1000;
    let timeFactor = Math.max(0, quiz.timer - timeTaken) / quiz.timer;
    let scoreForQuestion = maxPoints * timeFactor;

    // Check if answer is correct
    const isCorrect = question.options.some(opt => opt.text === answer && opt.isCorrect);
    if (!isCorrect) {
      scoreForQuestion = 0;
    }

    res.status(200).json({ message: 'Frage beantwortet', isCorrect, scoreForQuestion });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Beantworten der Frage', error: error.message });
  }
});

// Route to complete the quiz and save results
router.post('/complete/:quizId', authenticateToken, async (req, res) => {
  const { quizId } = req.params;
  const { userId, score, userAnswers } = req.body;

  if (!quizId || quizId === 'undefined') {
    return res.status(400).json({ message: 'Ungültige Quiz-ID' });
  }
  if (!userId) {
    return res.status(400).json({ message: 'Benutzer-ID fehlt' });
  }
  if (score == null) {
    return res.status(400).json({ message: 'Punktestand fehlt' });
  }
  if (!userAnswers) {
    return res.status(400).json({ message: 'Benutzerantworten fehlen' });
  }

  try {
    // Save the completed quiz
    const finishedQuiz = new FinishedQuiz({
      quizId,
      userId,
      score,
      userAnswers,
      createdAt: new Date()
    });

    await finishedQuiz.save();
    res.status(201).json({ message: 'Quiz abgeschlossen', finishedQuiz });
  } catch (error) {
    console.error('Fehler beim Abschließen des Quizzes:', error.message);
    res.status(500).json({ message: 'Fehler beim Abschließen des Quizzes', error: error.message });
  }
});

// Route to retrieve the results of a completed quiz by userId and quizId
router.get('/results/:userId/:quizId', authenticateToken, async (req, res) => {
  const { userId, quizId } = req.params;

  if (!userId || !quizId) {
    return res.status(400).json({ message: 'Fehlende Felder: userId oder quizId' });
  }

  try {
    const result = await FinishedQuiz.findOne({ userId, quizId }).populate('quizId', 'title description');
    if (!result) {
      return res.status(404).json({ message: 'Ergebnis nicht gefunden' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Fehler beim Abrufen des Ergebnisses:', error.message);
    res.status(500).json({ message: 'Fehler beim Abrufen des Ergebnisses', error: error.message });
  }
});


// Quiz bearbeiten


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

router.post('/duplicate/:quizId', authenticateToken, async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user.userId;

  try {
    // Find the original quiz and populate its questions
    const originalQuiz = await Quiz.findById(quizId).populate('questions');

    if (!originalQuiz) {
      return res.status(404).json({ message: 'Original-Quiz nicht gefunden' });
    }

    // Duplicate each question associated with the original quiz
    const duplicatedQuestions = await Promise.all(
      originalQuiz.questions.map(async (question) => {
        const newQuestion = new Question({
          text: question.text,
          options: question.options.map((option) => ({
            text: option.text,
            isCorrect: option.isCorrect,
          })),
          image: question.image, // Retain the image path for the duplicated question
          createdBy: userId,
        });
        return await newQuestion.save();
      })
    );

    // Create the duplicated quiz
    const duplicatedQuiz = new Quiz({
      title: `${originalQuiz.title} (Kopie)`,
      description: originalQuiz.description,
      timer: originalQuiz.timer,
      questions: duplicatedQuestions.map((q) => q._id), // Reference the new question IDs
      image: originalQuiz.image, // Retain the image of the original quiz
      createdBy: userId,
    });

    await duplicatedQuiz.save();

    res.status(201).json({ message: 'Quiz erfolgreich dupliziert', quiz: duplicatedQuiz });
  } catch (error) {
    console.error('Fehler beim Duplizieren des Quizzes:', error);
    res.status(500).json({ message: 'Fehler beim Duplizieren des Quizzes', error: error.message });
  }
});

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


module.exports = router;
