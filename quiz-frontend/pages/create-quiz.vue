<template>
  <div class="container">
    <h1>Erstelle ein neues Quiz</h1>
    
    <form @submit.prevent="createQuiz">
      <div>
        <label>Quiz Titel:</label>
        <input v-model="quiz.title" type="text" required />
      </div>
      
      <div>
        <label>Beschreibung:</label>
        <textarea v-model="quiz.description" required></textarea>
      </div>

      <!-- Existing Questions -->
      <h2>Füge bestehende Fragen hinzu</h2>
      <div v-for="(question, index) in existingQuestions" :key="question._id">
        <input type="checkbox" :value="question._id" v-model="selectedQuestions">
        <label>{{ question.text }}</label>
      </div>

      <!-- Button to open modal for creating a new question -->
      <button @click.prevent="openQuestionModal">Neue Frage erstellen</button>

      <!-- Modal for creating a new question -->
      <question-modal v-if="showModal" @save="addNewQuestion" @close="closeModal" />

      <button type="submit">Quiz erstellen</button>
    </form>
    
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
  </div>
</template>

<script>
import axios from 'axios';
import QuestionModal from '../components/QuestionModal.vue';

export default {
  components: { QuestionModal },
  data() {
    return {
      quiz: {
        title: '',
        description: ''
      },
      selectedQuestions: [], // Array of selected question IDs
      existingQuestions: [], // List of all available questions
      showModal: false, // State for the create question modal
      successMessage: '',
      errorMessage: '',
      currentUserId: '670fd8cdb754b88b7ebdce41' // Dummy user ID for now
    };
  },
  methods: {
    async createQuiz() {
      const quizData = {
        title: this.quiz.title,
        description: this.quiz.description,
        questions: this.selectedQuestions, // Selected question IDs
        userId: this.currentUserId // User who creates the quiz
      };

      try {
        const response = await axios.post('http://localhost:3000/quizzes/create', quizData);
        this.successMessage = 'Quiz erfolgreich erstellt!';
        this.errorMessage = '';
        this.resetForm();
      } catch (error) {
        this.errorMessage = 'Fehler beim Erstellen des Quizzes: ' + error.message;
        this.successMessage = '';
      }
    },
    async fetchQuestions() {
      try {
        const response = await axios.get('http://localhost:3000/questions'); // Fetch existing questions
        this.existingQuestions = response.data;
      } catch (error) {
        console.error('Fehler beim Abrufen der Fragen:', error);
      }
    },
    openQuestionModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    addNewQuestion(newQuestion) {
      this.existingQuestions.push(newQuestion); // Add the new question to the existing list
      this.selectedQuestions.push(newQuestion._id); // Automatically select the new question
      this.closeModal();
    },
    resetForm() {
      this.quiz.title = '';
      this.quiz.description = '';
      this.selectedQuestions = [];
    }
  },
  mounted() {
    this.fetchQuestions(); // Fetch existing questions when the component is mounted
  }
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.success-message {
  color: green;
}

.error-message {
  color: red;
}
</style>
