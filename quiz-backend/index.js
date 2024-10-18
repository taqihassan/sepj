const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Importiere das User-Modell
const questionsRoute = require('./routes/questions'); // Import the questions route
const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = 'your_secret_key'; // Ersetze durch einen sichereren Schlüssel

// MongoDB-Verbindung herstellen
const uri = 'mongodb+srv://wi22b002:oZAs1TPTpnaw70Ew@quiz.jsjxs.mongodb.net/?retryWrites=true&w=majority&appName=Quiz';
mongoose.connect(uri).then(async () => {
  console.log('MongoDB erfolgreich verbunden');
}).catch(err => {
  console.error('MongoDB-Verbindung fehlgeschlagen:', err);
});
app.use('/questions', questionsRoute); // Mount questions route
// Registrierungsroute
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Überprüfe, ob die E-Mail bereits existiert
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Registrierung fehlgeschlagen: E-Mail existiert bereits');
      return res.status(400).json({ message: 'E-Mail existiert bereits' });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Erstelle einen neuen Benutzer
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      createdQuizzes: [],
      createdAt: new Date()
    });

    await newUser.save();
    console.log(`Neuer Benutzer erfolgreich erstellt: ${newUser.email}`);

    // Sende eine Antwort und leite den Benutzer zur Login-Seite weiter
    res.status(201).json({ message: 'Benutzer erfolgreich erstellt' });
  } catch (error) {
    console.error('Fehler bei der Registrierung:', error.message);
    res.status(500).json({ message: 'Interner Serverfehler', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Finde den Benutzer anhand der E-Mail-Adresse
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login fehlgeschlagen: Benutzer nicht gefunden');
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    // Vergleiche das eingegebene Passwort mit dem gespeicherten (gehashten) Passwort
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Login fehlgeschlagen: Falsches Passwort');
      return res.status(401).json({ message: 'Falsches Passwort' });
    }

    // Erstelle ein JWT-Token für die Benutzersitzung
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });

    console.log(`Benutzer erfolgreich angemeldet: ${user.email}`);

    // Sende das Token zurück und bestätige die Anmeldung
    res.status(200).json({ message: 'Login erfolgreich', token });
  } catch (error) {
    console.error('Fehler beim Login:', error.message);
    res.status(500).json({ message: 'Interner Serverfehler', error: error.message });
  }
});

// Server starten
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
