<template>
  <div class="flex flex-col items-center">
    <h2 class="text-xl font-semibold mb-4">Wähle einen Spielmodus</h2>
    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4" @click="selectSingleplayer">
      Einzelspieler
    </button>
    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4" @click="joinRoom">
      Mehrspieler (Raum beitreten)
    </button>
    <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4" @click="openHostModal">
      Quiz hosten
    </button>

    <!-- Host Modal -->
    <div v-if="showHostModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">Wähle ein Quiz für den Raum</h3>
        <div class="overflow-y-auto max-h-96">
          <ul>
            <li v-for="quiz in userQuizzes" :key="quiz._id" class="mb-2">
              <button
                @click="selectQuiz(quiz)"
                :class="selectedQuiz === quiz ? 'bg-blue-200' : ''"
                class="w-full text-left p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                {{ quiz.title }}
              </button>
            </li>
          </ul>
        </div>
        <div class="flex justify-end mt-4">
          <button
            @click="createRoom"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
            :disabled="!selectedQuiz"
          >
            Raum erstellen
          </button>
          <button @click="closeHostModal" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Abbrechen
          </button>
        </div>
      </div>
    </div>

    <!-- Raum-Code-Anzeige -->
    <div v-if="roomCode" class="mt-6 text-center">
      <p class="text-lg font-bold">Raumcode: {{ roomCode }}</p>
      <button @click="startQuiz" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">
        Quiz starten
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { io } from 'socket.io-client';

export default {
  data() {
    return {
      showHostModal: false,
      userQuizzes: [],
      selectedQuiz: null,
      roomCode: '',
      socket: null,
    };
  },
  methods: {
    selectSingleplayer() {
      this.$router.push({ name: 'quiz' });
    },
    joinRoom() {
      const roomCode = prompt('Gib den Raumcode ein:');
      if (roomCode) {
        this.$router.push({ name: 'play', query: { roomCode } });
      }
    },
    openHostModal() {
      this.fetchUserQuizzes();
      this.showHostModal = true;
    },
    closeHostModal() {
      this.showHostModal = false;
      this.selectedQuiz = null;
    },
    async fetchUserQuizzes() {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3000/api/quizzes/my-quizzes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.userQuizzes = response.data;
      } catch (error) {
        console.error('Fehler beim Abrufen der Quizzes:', error);
      }
    },
    selectQuiz(quiz) {
      this.selectedQuiz = quiz;
    },
    createRoom() {
      if (!this.selectedQuiz) {
        alert('Bitte wähle ein Quiz aus.');
        return;
      }
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      this.roomCode = roomCode;

      this.socket = io('http://localhost:3000');
      this.socket.emit('create-room', { roomCode, quizId: this.selectedQuiz._id });

      this.showHostModal = false;
    },
    startQuiz() {
      if (this.socket) {
    // Quiz im Raum starten
    this.socket.emit('start-quiz', this.roomCode);
    alert('Quiz gestartet!');
  }
},
  },
};
</script>

<style scoped>
/* Add styles if needed */
</style>
