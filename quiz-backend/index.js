// index.js - Backend Hauptdatei
const express = require('express');
const cors = require('cors');

// Initialisiere Express
const app = express();

// Middleware, um JSON-Daten zu parsen und CORS zu erlauben
app.use(express.json());
app.use(cors());

// Beispielroute
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hallo von deinem Backend!' });
});

// Server starten
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
