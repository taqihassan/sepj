<template>
    <div class="quiz-question-container p-8">
      <div v-if="quiz && quiz.questions && quiz.questions.length > 0">
        <div class="quiz-info flex justify-between items-center mb-8">
          <div class="points text-xl">Punkte: {{ points }}</div>
          <div class="timer text-xl">Timer: {{ remainingTime }} s</div>
          <div class="rounds text-xl">Frage {{ currentIndex + 1 }} / {{ totalQuestions }}</div>
        </div>
        <div class="question mb-8">
          <h2 class="text-3xl font-bold mb-6">{{ currentQuestion.text }}</h2>
          <div v-for="(option, index) in currentQuestion.options" :key="index" class="mb-4">
            <button @click="answerQuestion(option)" class="w-full p-4 border border-gray-300 rounded-lg text-left text-lg font-semibold hover:bg-blue-100">
              {{ option.text }}
            </button>
          </div>
        </div>
      </div>
      <div v-else>
        <p>Quizdaten werden geladen oder sind nicht verfügbar.</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        quiz: null,
        currentIndex: 0,
        points: 0,
        timer: null,
        remainingTime: 30, // Zeit in Sekunden
        totalQuestions: 0,
      };
    },
    computed: {
        currentQuestion() {
            if (this.quiz && this.quiz.questions) {
            return this.quiz.questions[this.currentIndex];
            }
            return {}; // Geben Sie ein leeres Objekt zurück, falls die Daten noch nicht geladen sind
        },
    },

    async mounted() {
      const quizId = this.$route.params.quizId;
      if (quizId) {
        await this.fetchQuiz(quizId);
        this.startTimer();
      }
    },
    methods: {
      async fetchQuiz(quizId) {
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get(`http://localhost:3000/api/quizzes/${quizId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.quiz = response.data;
          this.totalQuestions = this.quiz.questions.length;
          console.log('Quiz erfolgreich geladen:', this.quiz); // Debugging
        } catch (error) {
          console.error('Fehler beim Abrufen des Quizzes:', error);
        }
      },
      startTimer() {
        this.timer = setInterval(() => {
          if (this.remainingTime > 0) {
            this.remainingTime--;
          } else {
            this.nextQuestion(); // Zeit ist abgelaufen, zur nächsten Frage
          }
        }, 1000);
      },
      answerQuestion(option) {
        clearInterval(this.timer); // Stoppe den Timer
        if (option.isCorrect) {
          this.points += 10; // Punkte vergeben, z.B. 10 Punkte pro richtige Antwort
        }
        this.nextQuestion();
      },
      nextQuestion() {
        if (this.currentIndex < this.totalQuestions - 1) {
            this.currentIndex++;
            this.remainingTime = 30; // Timer zurücksetzen
            this.startTimer(); // Timer neu starten
        } else {
            // Quiz ist vorbei, zum Ergebnis übergehen
            this.$router.push(`/QuizResult/${this.points}`);
        }
    },
    },
    beforeDestroy() {
      clearInterval(this.timer); // Sicherstellen, dass der Timer gestoppt wird, wenn die Komponente zerstört wird
    },
  };
  </script>
  