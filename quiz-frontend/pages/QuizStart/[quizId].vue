<template>
    <div class="quiz-start-container p-8">
      <!-- Wenn das Quiz geladen ist, zeigen wir die Details -->
      <div v-if="quiz">
        <img v-if="quiz.image" :src="quiz.image" alt="Quiz Bild" class="quiz-image w-full h-48 object-cover rounded-lg mb-6"/>
        <h1 class="text-3xl font-bold mb-4">{{ quiz.title }}</h1>
        <p>{{ quiz.description }}</p>
        <button @click="startPlaying(quiz)" class="bg-green-600 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-lg focus:outline-none">
            Quiz spielen
        </button>

      </div>
  
      <!-- Falls das Quiz noch nicht geladen wurde -->
      <div v-else-if="loading" class="loading-container">
        <p>Quiz wird geladen...</p>
      </div>
  
      <!-- Falls es einen Fehler gibt -->
      <div v-else class="error-container">
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        quiz: null,
        loading: true,
        errorMessage: ''
      };
    },
    async mounted() {
      const quizId = this.$route.params.quizId; // quizId aus der Route lesen
      if (quizId) {
        await this.fetchQuiz(quizId); // Das Quiz anhand der ID laden
      } else {
        this.errorMessage = 'Quiz ID fehlt!';
        this.loading = false;
      }
    },
    methods: {
      async fetchQuiz(quizId) {
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get(`http://localhost:3000/api/quizzes/${quizId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          this.quiz = response.data;
        } catch (error) {
          console.error('Fehler beim Abrufen des Quizzes:', error);
          this.errorMessage = 'Fehler beim Abrufen des Quizzes';
        } finally {
          this.loading = false; // Ladeanzeige beenden
        }
      },
      startPlaying(quiz) {
        if (this.quiz && this.quiz._id) {
          // Weiterleiten zur Seite, wo das Quiz gespielt wird
          this.$router.push({path: `/QuizQuestion/${quiz._id}`});
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .quiz-start-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px;
    background-color: #f9fafb;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .loading-container {
    text-align: center;
    margin-top: 50px;
    font-size: 20px;
    color: #333;
  }
  
  .error-container {
    text-align: center;
    margin-top: 50px;
    font-size: 20px;
    color: red;
  }
  </style>
  