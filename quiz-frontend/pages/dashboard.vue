<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
   <!-- <button @click="fetchAllResults">Alle Ergebnisse anzeigen</button> -->
    <table>
      <thead>
        <tr>
          <th>User ID</th>
          <th>Quiz</th>
          <th>Punkte</th>
          <th>Datum</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="result in results" :key="result._id">
          <td>{{ result.userId?.username || 'N/A' }}</td>
          <td>{{ result.quizId?.title || 'N/A' }}</td>
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
      results: [],
    };
  },
  mounted() {
    this.fetchResults(); // Wird ausgeführt, sobald das Dashboard geladen wird
  },
  methods: {
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
