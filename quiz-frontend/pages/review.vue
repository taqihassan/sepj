<!-- review.vue -->
<template>
    <div>
      <h1>Quiz Review</h1>
      <div v-for="question in reviewedQuestions" :key="question._id">
        <p>{{ question.text }}</p>
        <p>Deine Antwort: {{ question.userAnswer }}</p>
        <p v-if="!question.isCorrect">Korrekte Antwort: {{ question.correctAnswer }}</p>
      </div>
      <textarea v-model="feedback" placeholder="Gib dein Feedback zum Quiz..."></textarea>
      <button @click="submitFeedback">Feedback absenden</button>
      <button @click="goToStartMenu">Zurück zum Startmenü</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        quizId: null,
        reviewedQuestions: [],
        feedback: ''
      };
    },
    created() {
      this.quizId = this.$route.params.quizId;
      this.loadReview(this.quizId); // Lädt die Review-Daten
    },
    methods: {
      loadReview(quizId) {
        // API-Aufruf zur Abfrage der abgeschlossenen Quizdaten
      },
      submitFeedback() {
        // API-Aufruf zum Speichern des Feedbacks
      },
      goToStartMenu() {
        this.$router.push({ name: 'startMenu' }); // Zurück zum Startmenü
      }
    }
  };
  </script>
  