<template>
    <div class="quiz-result-container p-8 text-center">
      <h1 class="text-4xl font-bold mb-6">Quiz Beendet!</h1>
      <p class="text-2xl">Du hast {{ points }} Punkte erreicht!</p>
      <button @click="goToHome" class="bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg mt-6">
        Zurück zur Startseite
      </button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        points: 0
      };
    },
    mounted() {
      this.points = this.$route.params.points;  // Punktzahl aus den URL-Params holen
    },
    methods: {
      goToHome() {
        this.$router.push({ name: 'dashboard' }); // Zurück zur Startseite (dashboard.vue)
      }
    }
  };
  </script>
  