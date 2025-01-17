<template>
  <div class="container mt-6">
    <h1 class="text-3xl font-extrabold text-center mb-6 text-green-600">
      Quiz Ergebnis
    </h1>
    <div v-if="score !== null" class="result-container p-6 bg-white rounded-lg shadow">
      <p class="mb-4">Dein Punktestand: {{ score }}</p>

      <div class="button-group flex flex-col gap-4">
        
        <button @click="goToHomePage" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
          Zur Startseite
        </button>

        <!-- Feedback Textfeld und Button -->
        <input v-model="feedbackText" type="text" placeholder="Bitte geben Sie Ihr Feedback" class="p-2 border border-gray-300 rounded mb-2" />
        <button @click="submitFeedback" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded">
          Feedback geben
        </button>
      </div>
    </div>
    <div v-else>
      <p class="text-center text-gray-600">Lade Ergebnis...</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      score: null,
      resultId: this.$route.query.resultId, // Hol die resultId aus der URL
      feedbackText: '', // Variable für das Feedback
      quizId: null
    };
  },
  created() {
  if (!this.resultId) {
    console.error('Result ID is missing in query parameters.');
    this.$router.push('/'); // Redirect to home if no resultId is provided
    return;
  }

  this.loadResult();
},

  methods: {
    async loadResult() {
  try {
    // Use the `resultId` to fetch the result
    const response = await this.$axios.get(`/api/results/${this.resultId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    this.score = response.data.score;
    this.quizId = response.data.quizId; // ✅ Hier wird quizId gespeichert
  } catch (error) {
    console.error('Fehler beim Laden des Ergebnisses:', error);
  }
},

    reviewQuiz() {
      alert('Review-Funktion wird entwickelt...');
    },
    goToHomePage() {
      this.$router.push('/');
    },
    async submitFeedback() {
      if (this.feedbackText.trim() === '') {
        alert('Bitte geben Sie Ihr Feedback ein.');
        return;
      }

      try {
        await axios.post(
          'http://localhost:3000/api/feedback/submit',
          {
            quizId: this.quizId, // ✅ Jetzt wird die richtige quizId gesendet!
            feedbackText: this.feedbackText,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        alert('Vielen Dank für Ihr Feedback!');
        this.feedbackText = ''; // Reset des Textfelds nach erfolgreicher Übermittlung
        window.location.href = '/';
      } catch (error) {
        console.error('Fehler beim Übermitteln des Feedbacks:', error);
        alert('Fehler beim Übermitteln des Feedbacks. Bitte versuchen Sie es später erneut.');
      }
    },
  },
};
</script>

<style scoped>
.result-container {
  max-width: 600px;
  margin: 0 auto;
}
.button-group {
  max-width: 600px;
  margin: 0 auto;
}
</style>
