<template>
  <div class="dashboard">
    <h1>Dashboard</h1>

    <div>
      <h2>Erstellte Fragen</h2>
      <ul>
        <li v-for="question in userQuestions" :key="question._id">
          {{ question.text }}
        </li>
      </ul>
      <div v-if="userQuestions.length === 0">Keine Fragen gefunden.</div>
    </div>

    <div>
      <h2>Erstellte Quizzes</h2>
      <ul>
        <li v-for="quiz in userQuizzes" :key="quiz._id">
          <strong>{{ quiz.title }}</strong><br />
          Beschreibung: {{ quiz.description }}<br />
          Erstellt am: {{ new Date(quiz.createdAt).toLocaleDateString() }}<br />
          Erstellt von: {{ quiz.createdBy.username }}<br />
          <button @click="editQuiz(quiz._id)">Bearbeiten</button>
          <button @click="confirmDeleteQuiz(quiz._id)">Löschen</button>
          <button @click="duplicateQuiz(quiz)">Duplizieren</button>
        </li>
      </ul>
      <div v-if="userQuizzes.length === 0">Keine Quizzes gefunden.</div>
    </div>

    <!-- Bestätigungsmodal zum Löschen eines Quiz -->
    <div v-if="showDeleteModal" class="modal">
      <p>Sind Sie sicher, dass Sie dieses Quiz löschen möchten?</p>
      <button @click="deleteQuiz(deleteQuizId)">Ja, löschen</button>
      <button @click="cancelDelete">Abbrechen</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      userQuestions: [],
      userQuizzes: [],
      errorMessage: '',
      showDeleteModal: false,
      deleteQuizId: null,
    };
  },
  methods: {
    async fetchUserQuestions() {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3000/questions/my-questions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.userQuestions = response.data;
      } catch (error) {
        console.error('Fehler beim Abrufen der Fragen:', error);
        this.errorMessage = 'Fehler beim Abrufen der Fragen';
      }
    },
    async fetchUserQuizzes() {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3000/quizzes/my-quizzes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.userQuizzes = response.data;
      } catch (error) {
        console.error('Fehler beim Abrufen der Quizzes:', error);
        this.errorMessage = 'Fehler beim Abrufen der Quizzes';
      }
    },
    editQuiz(quizId) {
      this.$router.push({ path: `/edit-quiz/${quizId}` });
    },
    confirmDeleteQuiz(quizId) {
      this.showDeleteModal = true;
      this.deleteQuizId = quizId;
    },
    cancelDelete() {
      this.showDeleteModal = false;
      this.deleteQuizId = null;
    },
    async deleteQuiz(quizId) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:3000/quizzes/${quizId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.userQuizzes = this.userQuizzes.filter(quiz => quiz._id !== quizId);
        this.cancelDelete();
      } catch (error) {
        console.error('Fehler beim Löschen des Quizzes:', error);
        this.errorMessage = 'Fehler beim Löschen des Quizzes';
      }
    },
    async duplicateQuiz(quiz) {
      const token = localStorage.getItem('token');
      try {
        const duplicatedQuiz = {
          title: quiz.title + " (Kopie)",
          description: quiz.description,
          questions: quiz.questions,
          createdBy: quiz.createdBy
        };
        const response = await axios.post('http://localhost:3000/quizzes/create', duplicatedQuiz, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.userQuizzes.push(response.data.quiz);
      } catch (error) {
        console.error('Fehler beim Duplizieren des Quizzes:', error);
      }
    }
  },
  mounted() {
    this.fetchUserQuestions();
    this.fetchUserQuizzes();
  }
};
</script>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  margin-top: 20px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 10px;
}

.modal {
  padding: 20px;
  background: white;
  border: 1px solid #ccc;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}
</style>
