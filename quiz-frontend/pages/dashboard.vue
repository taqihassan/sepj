<template>
  <div class="dashboard">
    <h1>Leaderboard pro Quiz</h1>
    <div>
      <label for="quiz-select">Wähle ein Quiz:</label>
      <select id="quiz-select" v-model="selectedQuizId" @change="fetchQuizLeaderboard">
        <option v-for="quiz in quizzes" :key="quiz._id" :value="quiz._id">
          {{ quiz.title }}
        </option>
      </select>
    </div>
    <table>
      <thead>
        <tr>
          <th>Platz</th>
          <th>User ID</th>
          <th>Punkte</th>
          <th>Datum</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(result, index) in results" :key="result._id">
          <td>{{ index + 1 }}</td>
          <td>{{ result.userId?.username || 'N/A' }}</td>
          <td>{{ result.score || 0 }}</td>
          <td>{{ result.createdAt ? formatDate(result.createdAt) : 'N/A' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import axios from 'axios';

export default {
  data() {
    return {
      quizzes: [], // Liste aller verfügbaren Quizzes
      selectedQuizId: '', // ID des ausgewählten Quiz
      results: [], // Ergebnisse für das Dashboard oder Leaderboard
    };
  },
  mounted() {
    this.fetchResults(); // Standardmäßig wird das Dashboard geladen
    this.fetchQuizzes(); // Lade alle verfügbaren Quizzes
  },
  methods: {
    async fetchQuizzes() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error("Kein Token gefunden!");
          return;
        }
        const { data } = await axios.get('http://localhost:3000/api/quizzes/all-quizzes', {
          headers: { Authorization: `Bearer ${token}` }, // Token im Header senden
        });
        this.quizzes = data; // Speichere die Quizzes
        console.log('Quizzes:', data); // Debug: Zeige die verfügbaren Quizzes
      } catch (error) {
        console.error('Fehler beim Abrufen der Quizzes:', error);
      }
    },
    async fetchQuizLeaderboard() {
      if (!this.selectedQuizId) {
        console.error("Kein Quiz ausgewählt!");
        return;
      }
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error("Kein Token gefunden!");
          return;
        }
        const { data } = await axios.get(
          `http://localhost:3000/api/results/leaderboard/${this.selectedQuizId}`,
          {
            headers: { Authorization: `Bearer ${token}` }, // Token im Header senden
          }
        );
        this.results = data; // Ergebnisse mit den Quiz-spezifischen Leaderboard-Daten ersetzen
        console.log('Leaderboard für Quiz:', data); // Debug: Zeige die Daten in der Konsole
      } catch (error) {
        console.error('Fehler beim Abrufen des Quiz-Leaderboards:', error);
      }
    },
    async fetchLeaderboard() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error("Kein Token gefunden!");
          return;
        }
        const { data } = await axios.get('http://localhost:3000/api/results/leaderboard', {
          headers: { Authorization: `Bearer ${token}` }, // Token im Header senden
        });
        this.results = data; // Ergebnisse mit den Leaderboard-Daten ersetzen
        console.log(data); // Debug: Ergebnisse in der Konsole anzeigen
      } catch (error) {
        console.error('Fehler beim Abrufen des Leaderboards:', error);
      }
    },
    async fetchAllResults() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error("Kein Token gefunden!");
          return;
        }
        const { data } = await axios.get('http://localhost:3000/api/results/all-results', {
          headers: { Authorization: `Bearer ${token}` }, // Token im Header senden
        });
        this.results = data; // Setze die Ergebnisse auf die API-Daten
        console.log(data); // Debug: Ergebnisse in der Konsole anzeigen
      } catch (error) {
        console.error('Fehler beim Abrufen aller Ergebnisse:', error);
      }
    },
    async fetchResults() {
      try {
        const token = localStorage.getItem('token'); // Token aus dem lokalen Speicher abrufen
        if (!token) {
          console.error("Kein Token gefunden!");
          return;
        }
        const { data } = await axios.get('http://localhost:3000/api/results/dashboard', {
          headers: { Authorization: `Bearer ${token}` }, // Token im Header senden
        });
        this.results = data; // Ergebnisse speichern
        console.log(data); // Debug: Zeige die abgerufenen Daten
      } catch (error) {
        console.error('Fehler beim Abrufen der Dashboard-Daten:', error);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString(); // Datum formatieren
    },
  },
};
</script>


<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background-color: #f4f4f4;
  text-align: left;
}
</style>