<template>
  <div class="container mt-6">
    <h1 class="text-3xl font-extrabold text-center mb-6 text-blue-600">
      {{ selectedQuiz ? selectedQuiz.title : "Quiz spielen" }}
    </h1>

    <div v-if="selectedQuiz && currentQuestionIndex < selectedQuiz.questions.length && !quizCompleted">
      <div class="question-container p-6 bg-white rounded-lg shadow">
        <!-- Bild der Frage -->
        <div v-if="selectedQuiz.questions[currentQuestionIndex].image" class="image-container">
          <img :src="getQuestionImage(selectedQuiz.questions[currentQuestionIndex].image)" alt="Fragenbild" class="question-image">
        </div>

        <!-- Text der Frage -->
        <h2 class="text-xl font-bold mt-4 text-center">Frage {{ currentQuestionIndex + 1 }}</h2>
        <p class="text-center mb-4">{{ selectedQuiz.questions[currentQuestionIndex].text }}</p>

        <!-- Antwortoptionen -->
        <div class="options-grid">
          <div v-for="(option, index) in selectedQuiz.questions[currentQuestionIndex].options" :key="index" class="option-item">
            <button
              @click="answerQuestion(option)"
              class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              :disabled="waitingForOthers"
            >
              {{ option.text }}
            </button>
          </div>
        </div>

        <div class="timer mt-4">Zeit verbleibend: {{ timer }} Sekunden</div>

        <div v-if="waitingForOthers" class="waiting mt-4 text-center text-gray-500">
          Warten auf andere Teilnehmer...
        </div>
      </div>
    </div>

    <!-- Quiz abgeschlossen -->
    <div v-else-if="quizCompleted">
      <div class="result-container p-6 bg-white rounded-lg shadow">
        <h2 class="text-2xl font-bold mb-4">Quiz abgeschlossen!</h2>
        <p class="mb-4">Dein Punktestand: {{ score }}</p>

        <div class="button-group flex flex-col gap-4">
          <button @click="reviewQuiz" class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded">
            Fragen überprüfen
          </button>
          <button @click="goToHomePage" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
            Zur Startseite
          </button>
          <button @click="giveFeedback" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded">
            Feedback geben
          </button>
        </div>
      </div>
    </div>

    <!-- Ladezustand anzeigen -->
    <div v-else>
      <p class="text-center text-gray-600">Lade Quiz...</p>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";

export default {
  data() {
    return {
      selectedQuiz: null,
      currentQuestionIndex: 0,
      timer: 0,
      score: 0,
      quizCompleted: false,
      timerInterval: null,
      userAnswers: [],
      results: [],
      socket: null,
      roomCode: "",
      waitingForOthers: false, // Neuer Zustand für das Warten auf andere
    };
  },
  async created() {
    try {
      if (process.client) {
        const username = localStorage.getItem("username");
        if (!username) {
          alert("Du bist nicht eingeloggt. Bitte melde dich an.");
          this.$router.push({ name: "login" });
          return;
        }

        const response = await this.$axios.get('/api/ip');
        this.serverIp = response.data.ip;

        this.socket = io(`http://${this.serverIp}:3000`);
       
        const quizId = this.$route.query.quizId;
        if (quizId) {
          await this.loadQuiz(quizId, 'multiplayer');
        }

        this.roomCode = this.$route.query.roomCode;
        this.socket.emit("join-room", {
          roomCode: this.roomCode,
          username: username,
        });

        this.socket.on("next-question", (data) => {
          this.selectedQuiz = { questions: [data.question] };
          this.currentQuestionIndex = 0;
          this.timer = data.timer;
          this.waitingForOthers = false; // Beendet den Wartestatus
          this.startTimer();
        });

        this.socket.on("timer-update", (data) => {
          this.timer = data.timer;
          if (this.timer <= 0) {
            clearInterval(this.timerInterval);
          }
        });

        this.socket.on("quiz-finished", (data) => {
          this.results = data.results;
          this.quizCompleted = true;
        });
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der IP-Adresse oder bei der Verbindung:", error);
    }
  },

  methods: {
    getQuestionImage(imagePath) {
      return imagePath.startsWith("/uploads") ? `/uploads${imagePath}` : imagePath;
    },
    async loadQuiz(quizId, mode = 'multiplayer') {
      try {
        const endpoint = mode === 'multiplayer' ? `/api/quizzes/play/${quizId}` : `/api/quizzes/singleplayerplay/${quizId}`;
        const response = await this.$axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        this.selectedQuiz = response.data;
        if (this.selectedQuiz && this.selectedQuiz.questions.length > 0) {
          this.startTimer();
        }
      } catch (error) {
        console.error("Fehler beim Laden des Quizzes:", error);
      }
    },

    startTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      this.timerInterval = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          clearInterval(this.timerInterval);
          this.answerQuestion(null);
        }
      }, 1000);
    },
    answerQuestion(option) {
      const question = this.selectedQuiz.questions[this.currentQuestionIndex];
      this.waitingForOthers = true; // Setzt den Wartestatus
      this.socket.emit("submit-answer", {
        roomCode: this.roomCode,
        answer: option ? option.text : "Keine Antwort",
      });

      if (option && option.isCorrect) {
        this.score += 100;
      }
    },
    reviewQuiz() {
      this.currentQuestionIndex = 0;
      this.quizCompleted = false;
    },
    goToHomePage() {
      this.$router.push({ name: "home" });
    },
    giveFeedback() {
      this.$router.push({ name: "feedback", params: { quizId: this.selectedQuiz._id } });
    },
  },
};
</script>

<style scoped>
.question-container {
  max-width: 600px;
  margin: 0 auto;
}
.result-container {
  max-width: 600px;
  margin: 0 auto;
}
.button-group {
  max-width: 600px;
  margin: 0 auto;
}
</style>
