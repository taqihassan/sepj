<template>
  <div class="container mt-6">
    <h1 class="text-3xl font-extrabold text-center mb-6 text-blue-600">
      {{ selectedQuiz ? selectedQuiz.title : "Quiz spielen" }}
    </h1>

    <div v-if="selectedQuiz && currentQuestionIndex < selectedQuiz.questions.length">
      <div class="question-container p-6 bg-white rounded-lg shadow">
        
        <!-- Bild der Frage -->
        <div v-if="selectedQuiz.questions[currentQuestionIndex].image" class="image-container">
          <img :src="selectedQuiz.questions[currentQuestionIndex].image" alt="Fragenbild" class="question-image">
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
            >
              {{ option.text }}
            </button>
          </div>
        </div>

        <div class="timer mt-4">Zeit verbleibend: {{ timer }} Sekunden</div>
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
import axios from 'axios';

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
    };
  },
  created() {
    const quizId = this.$route.query.quizId;
    if (quizId) {
      this.loadQuiz(quizId);
    }
  },
  methods: {
    async loadQuiz(quizId) {
      try {
        const response = await axios.get(`http://localhost:3000/api/quizzes/play/${quizId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        this.selectedQuiz = response.data;
        if (this.selectedQuiz && this.selectedQuiz.questions.length > 0) {
          this.Timer();
        }
      } catch (error) {
        console.error('Fehler beim Laden des Quizzes:', error);
      }
    },
    Timer() {
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
  }
  this.timer = this.selectedQuiz?.timer || 0;
  this.timerInterval = setInterval(() => {
    if (this.timer > 0) {
      this.timer--;
    } else {
      clearInterval(this.timerInterval);
      
      // Überprüfe, ob es sich um die letzte Frage handelt
      if (this.currentQuestionIndex === this.selectedQuiz.questions.length - 1) {
        // Letzte Frage unbeantwortet, dann wird das Quiz als abgeschlossen betrachtet
        this.userAnswers.push({
          text: "Keine Antwort",
          isCorrect: false,
          correctAnswer: this.selectedQuiz.questions[this.currentQuestionIndex].options.find(opt => opt.isCorrect)?.text || "",
        });

        // Setze quizCompleted auf true und leite zur Ergebnis-Seite weiter
        this.quizCompleted = true;
        this.completeQuiz(); // Quiz beenden und auf die Ergebnisseite weiterleiten
      } else {
        // Wenn es nicht die letzte Frage ist, einfach die Antwort als "Keine Antwort" aufzeichnen
        this.answerQuestion(null);
      }
    }
  }, 1000);
},
    async answerQuestion(option) {
  const question = this.selectedQuiz.questions[this.currentQuestionIndex];
  let isCorrect = option && option.isCorrect;

  // Antwort des Benutzers speichern
  this.userAnswers.push({
    text: option ? option.text : "Keine Antwort",
    isCorrect: isCorrect,
    correctAnswer: question.options.find(opt => opt.isCorrect)?.text || "",
  });

  // Punkteberechnung mit Abzug alle 0,5 Sekunden und Multiplikator für mehrere richtige Antworten hintereinander
  let maxPoints = 1000;
  let totalTime = this.selectedQuiz.timer; // Gesamtzeit des Timers
  let pointsPerHalfSecond = maxPoints / (totalTime * 2); // Punkteabzug alle 0,5 Sekunden

  let timePenalty = (totalTime - this.timer) * 2 * pointsPerHalfSecond; // Berechnet den Punktabzug basierend auf der verstrichenen Zeit
  let scoreForQuestion = maxPoints - timePenalty;

  // Multiplikator für mehrere richtig beantwortete Fragen hintereinander
  if (isCorrect) {
    this.consecutiveCorrect = (this.consecutiveCorrect || 0) + 1;
    let multiplier = this.consecutiveCorrect > 1 ? 1 + (this.consecutiveCorrect - 1) * 0.1 : 1;
    this.score += scoreForQuestion * multiplier;
  } else {
    this.consecutiveCorrect = 0; // Bei einer falschen Antwort wird der Zähler zurückgesetzt
  }

  // Wenn noch Fragen übrig sind, weiter zur nächsten Frage
  if (this.currentQuestionIndex < this.selectedQuiz.questions.length - 1) {
    this.currentQuestionIndex++;
    this.Timer();
  } else {
    this.quizCompleted = true; // Setze quizCompleted auf true
    await this.completeQuiz(); // Quiz beenden
  }
},
async completeQuiz() {
  clearInterval(this.timerInterval);
  this.quizCompleted = true;

  try {
    const response = await axios.post(`http://localhost:3000/api/results/save`, {
      quizId: this.selectedQuiz._id,
      userId: localStorage.getItem('userId'),
      score: this.score,
      title: this.selectedQuiz.title,
      description: this.selectedQuiz.description,
      userAnswers: this.userAnswers,
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    // Extract the `resultId` from the server response
    const resultId = response.data.resultId;

    // Redirect to the results page with the resultId
    this.$router.push({
      name: 'results',
      query: {
        resultId,
      },
    });
  } catch (error) {
    console.error('Fehler beim Abschließen des Quizzes:', error);
  }
},
    reviewQuiz() {
      this.currentQuestionIndex = 0;
      this.quizCompleted = false;
    },
    goToHomePage() {
      this.$router.push({ name: 'home' });
    },
    giveFeedback() {
      this.$router.push({ name: 'feedback', params: { quizId: this.selectedQuiz._id } });
    }
  }
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
