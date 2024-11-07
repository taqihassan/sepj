<template>
  <div class="container mx-auto p-8 bg-white shadow-lg rounded-lg dark:bg-gray-800">
    <h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-black text-center">Erstelle ein neues Quiz</h1>
    <form @submit.prevent="createQuiz" class="space-y-6">
      <div>
        <label class="block mb-2 text-lg font-medium text-gray-900 dark:text-black">Quiz Titel:</label>
        <input v-model="quiz.title" type="text" class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
      </div>
      <div>
        <label class="block mb-2 text-lg font-medium text-gray-900 dark:text-black">Beschreibung:</label>
        <textarea v-model="quiz.description" class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required></textarea>
      </div>
      <div>
        <label class="block mb-2 text-lg font-medium text-gray-900 dark:text-black">Timer (in Sekunden):</label>
        <input v-model.number="quiz.timer" type="number" min="10" max="300" class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
      </div>
      
      <!-- Existing Questions -->
      <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-black">Füge bestehende Fragen hinzu</h2>
      <div v-for="(question, index) in existingQuestions" :key="question._id" class="mb-4">
        <label class="flex items-center text-lg text-gray-900 dark:text-black">
          <input type="checkbox" :value="question._id" v-model="selectedQuestions" class="mr-3">
          {{ question.text }}
        </label>
      </div>
      
      <div class="flex justify-between mt-6">
        <!-- Button to open the Question Modal -->
        <button @click.prevent="openQuestionModal" class="bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50">
          Neue Frage erstellen
        </button>
        <button type="submit" class="bg-green-600 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50">
          Quiz erstellen
        </button>
      </div>
    </form>

    <!-- Success and Error Messages -->
    <div v-if="errorMessage" class="text-red-700 bg-red-100 p-4 rounded-lg mt-8 text-center">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="text-green-700 bg-green-100 p-4 rounded-lg mt-8 text-center">
      {{ successMessage }}
    </div>

    <!-- Question Modal -->
    <QuestionModal v-if="showModal" @close="closeModal" @save="addNewQuestion" />
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
        description: '',
        timer: 30
      },
      selectedQuestions: [],       // Array to store selected question IDs
      existingQuestions: [],       // Array to store all existing questions
      showModal: false,            // Control visibility of the QuestionModal
      successMessage: '',
      errorMessage: '',
    };
  },
  methods: {
    // Function to create a new quiz with selected questions
    async createQuiz() {
      const token = localStorage.getItem('token');
      const quizData = {
        title: this.quiz.title,
        description: this.quiz.description,
        timer: this.quiz.timer,
        questions: this.selectedQuestions, // Selected question IDs
      };
      try {
        const response = await axios.post('http://localhost:3000/api/quizzes/create', quizData, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        this.successMessage = 'Quiz erfolgreich erstellt!';
        this.errorMessage = '';
        this.resetForm();
      } catch (error) {
        this.errorMessage = 'Fehler beim Erstellen des Quizzes: ' + (error.response && error.response.data ? error.response.data.message : error.message);
        this.successMessage = '';
      }
    },

    // Function to fetch all existing questions created by the user
    async fetchQuestions() {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3000/api/questions/my-questions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.existingQuestions = response.data; // Load existing questions into array
      } catch (error) {
        console.error('Fehler beim Abrufen der Fragen:', error);
      }
    },

    // Open and close modal methods
    openQuestionModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },

    // Add a new question to existingQuestions and automatically select it for the quiz
    addNewQuestion(newQuestion) {
      this.existingQuestions.push(newQuestion);   // Add to list of existing questions
      this.selectedQuestions.push(newQuestion._id); // Auto-select the new question
      this.closeModal();                           // Close the modal after saving
    },

    // Reset form after successfully creating a quiz
    resetForm() {
      this.quiz.title = '';
      this.quiz.description = '';
      this.quiz.timer = 30;
      this.selectedQuestions = [];
    }
  },

  // Fetch questions on component mount
  mounted() {
    this.fetchQuestions();
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  background-color: #f9fafb;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
