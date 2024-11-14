<template>
  <div class="quiz-selection-container">
    <h1 class="text-3xl font-bold mb-8 text-gray-900 text-center">Wähle ein Quiz zum Spielen</h1>
    <div v-if="quizzes.length === 0" class="text-center text-gray-700">
      Keine Quizzes gefunden.
    </div>
    <div v-for="quiz in quizzes" :key="quiz._id" class="quiz-card mb-4 p-4 border rounded-lg shadow-md">
      <h2 class="text-2xl font-bold">{{ quiz.title }}</h2>
      <p class="mb-2">{{ quiz.description }}</p>
      <div v-if="quiz.image" class="mb-4">
        <img :src="quiz.image" alt="Quiz Bild" class="w-full h-32 object-cover rounded-lg" />
      </div>
      <button @click="startQuiz(quiz)" class="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none">
        Quiz starten
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      quizzes: [] // Array für alle Quizzes des Nutzers
    };
  },
  mounted() {
    this.fetchQuizzes();
  },
  methods: {
    async fetchQuizzes() {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3000/api/quizzes/my-quizzes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.quizzes = response.data;
      } catch (error) {
        console.error('Fehler beim Abrufen der Quizzes:', error);
      }
    },
    startQuiz(quiz) {
      console.log('Quiz Objekt:', quiz); // Debugging: Überprüfe das Quiz-Objekt

      // Prüfen, ob das Quiz-Objekt und die quizId definiert sind
      if (quiz && quiz._id) {
        console.log('quizId:', quiz._id);  // Überprüfe, ob `quiz._id` korrekt definiert ist

        // Falls quizId vorhanden ist, weiterleiten zur dynamischen QuizStart-Seite
        this.$router.push({path: `/QuizStart/${quiz._id}`});
      } else {
        console.error('Quiz ID nicht definiert oder ungültiges Quiz-Objekt. Überprüfe die Eingabe.');
      }
    }
  }
};
</script>

<style scoped>
.quiz-selection-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  background-color: #f9fafb;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
