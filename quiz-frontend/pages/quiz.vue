<template>
  <div class="container mt-6">
    <h1 class="text-3xl font-extrabold text-center mb-6 text-blue-600">
      {{ selectedQuiz ? selectedQuiz.title : "Verfügbare Quizzes" }}
    </h1>

    <!-- Übersicht der Quizzes anzeigen -->
    <div v-if="quizzes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="quiz in quizzes" :key="quiz._id" class="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
        <div v-if="quiz.image" class="h-48 bg-cover bg-center" :style="{ backgroundImage: `url(${quiz.image})` }"></div>
        <div v-else class="h-48 bg-gray-200 flex items-center justify-center">
          <p class="text-gray-500">Kein Bild verfügbar</p>
        </div>
        <div class="p-6">
          <h2 class="font-bold text-xl mb-2 text-gray-800">{{ quiz.title }}</h2>
          <p class="text-gray-600 mb-4">{{ quiz.description }}</p>
          <p class="text-gray-600 mb-4">Erstellt von: {{ quiz.createdBy.username }}</p>
          <button @click="goToQuiz(quiz._id)" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-300">
            Quiz starten
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-center">
      <p class="text-gray-600">Keine Quizzes verfügbar.</p>
      <div v-if="!isAuthenticated" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white p-6 rounded-lg w-full max-w-md">
          <h2 class="text-xl font-bold mb-4">Sie sind nicht angemeldet</h2>
          <p>Bitte melden Sie sich an, um fortzufahren.</p>
          <div class="flex justify-end mt-4">
            <button @click="redirectToLogin" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Zum Login
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      quizzes: [],
      isAuthenticated: !!localStorage.getItem('token'),
      selectedQuiz: null, // Hier wird `selectedQuiz` hinzugefügt
    };
  },
  created() {
    this.fetchQuizzes();
  },
  methods: {
    async fetchQuizzes() {
  const token = localStorage.getItem('token');
  if (!token) {
    this.isAuthenticated = false;
    return;
  }

  try {
    const response = await this.$axios.get('/api/quizzes/all-quizzes', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Backend-URL dynamisch bestimmen
    const backendUrl = `http://${window.location.hostname}:3000`;

    // Bildpfade umwandeln
    this.quizzes = response.data.map(quiz => ({
      ...quiz,
      image: quiz.image ? `${backendUrl}${quiz.image}` : null
    }));

  } catch (error) {
    if (error.response && error.response.status === 401) {
      this.isAuthenticated = false;
    } else {
      console.error('Fehler beim Laden der Quizzes:', error);
    }
  }
},

    goToQuiz(quizId, mode = 'singleplayer') {
      // Modus prüfen und entsprechend weiterleiten
      const path = mode === 'multiplayer' ? '/play' : '/singleplayerplay';
      this.$router.push({ path, query: { quizId: quizId } });
    },
    redirectToLogin() {
      window.location.href = '/login';
    }
  }
};

</script>
