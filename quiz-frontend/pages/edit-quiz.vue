<template>
    <div class="edit-quiz">
      <h1>Quiz bearbeiten</h1>
      <form @submit.prevent="updateQuiz">
        <div>
          <label>Quiz Titel:</label>
          <input v-model="quiz.title" type="text" required />
        </div>
        <div>
          <label>Beschreibung:</label>
          <textarea v-model="quiz.description" required></textarea>
        </div>
        <div>
          <label>Fragen:</label>
          <ul>
            <li v-for="(question, index) in quiz.questions" :key="index">
              {{ question.text }}
            </li>
          </ul>
        </div>
        <button type="submit">Speichern</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        quiz: {
          title: '',
          description: '',
          questions: []
        }
      };
    },
    methods: {
      async fetchQuiz(quizId) {
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get(`http://localhost:3000/quizzes/${quizId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          this.quiz = response.data;
        } catch (error) {
          console.error('Fehler beim Abrufen des Quizzes:', error);
        }
      },
      async updateQuiz() {
        const token = localStorage.getItem('token');
        try {
          await axios.put(`http://localhost:3000/quizzes/${this.quiz._id}`, this.quiz, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          alert('Quiz erfolgreich aktualisiert!');
          this.$router.push('/dashboard');
        } catch (error) {
          console.error('Fehler beim Aktualisieren des Quizzes:', error);
        }
      }
    },
    mounted() {
      const quizId = this.$route.params.quizId;
      this.fetchQuiz(quizId);
    }
  };
  </script>
  
  <style scoped>
  .edit-quiz {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  </style>
  