<template>
  <section class="bg-gray-50 dark:bg-white-200 min-h-screen flex items-center justify-center">
    <div class="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6 md:p-8 lg:p-10">
      <h1 class="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-black text-center">Neues Quiz erstellen</h1>
      
      <form @submit.prevent="createQuiz" class="space-y-6">
        
        <!-- Quiz Title -->
        <div>
          <label class="block mb-2 text-lg font-medium text-gray-900">Quiz Titel:</label>
          <input v-model="quiz.title" type="text" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>

        <!-- Quiz Description -->
        <div>
          <label class="block mb-2 text-lg font-medium text-gray-900">Beschreibung:</label>
          <textarea v-model="quiz.description" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
        </div>

        <!-- Quiz Timer -->
        <div>
          <label class="block mb-2 text-lg font-medium text-gray-900">Timer (in Sekunden):</label>
          <input v-model.number="quiz.timer" type="number" min="10" max="300" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>

        <!-- Image Upload -->
        <div>
          <label class="block mb-2 text-lg font-medium text-gray-900">Titelbild:</label>
          <input type="file" @change="uploadImage" class="w-full p-3 border border-gray-300 rounded-lg" />
          <div v-if="quiz.image" class="mt-4">
            <img :src="quiz.image" alt="Titelbild Vorschau" class="max-w-full h-auto rounded-lg shadow-md" />
          </div>
        </div>

        <!-- Dropdown für bestehende Fragen -->
        <div>
          <button @click="toggleDropdown" type="button" class="w-full flex justify-between items-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Bestehende Fragen hinzufügen
            <svg class="w-4 h-4 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
            </svg>
          </button>

          <!-- Scrollbarer Container für bestehende Fragen -->
          <div v-if="isDropdownOpen" class="mt-2 max-h-48 overflow-y-auto bg-white border rounded-lg shadow-lg p-3">
            <div v-for="(question, index) in existingQuestions" :key="question._id" class="flex items-center mb-2">
              <input type="checkbox" :value="question._id" v-model="selectedQuestions" class="mr-3">
              <label class="text-gray-900">{{ question.text }}</label>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex flex-col md:flex-row justify-between gap-3">
          <button @click.prevent="openQuestionModal" class="w-full md:w-auto bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            Neue Frage erstellen
          </button>
          <button type="submit" class="w-full md:w-auto bg-green-600 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
            Quiz erstellen
          </button>
        </div>
      </form>

      <!-- Success and Error Messages -->
      <div v-if="errorMessage" class="text-red-700 bg-red-100 p-4 rounded-lg mt-6 text-center">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="text-green-700 bg-green-100 p-4 rounded-lg mt-6 text-center">
        {{ successMessage }}
      </div>

      <!-- Question Modal -->
      <QuestionModal v-if="showModal" @close="closeModal" @save="addNewQuestion" />
    </div>
  </section>
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
        timer: 30,
        image: '',
      },
      selectedQuestions: [],
      existingQuestions: [],
      showModal: false,
      successMessage: '',
      errorMessage: '',
      isDropdownOpen: false // Steuert das Dropdown-Menü für bestehende Fragen
    };
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },

    async createQuiz() {
      const token = localStorage.getItem('token');
      const quizData = {
        title: this.quiz.title,
        description: this.quiz.description,
        timer: this.quiz.timer,
        questions: this.selectedQuestions,
        image: this.quiz.image 
      };
      try {
        await this.$axios.post('/api/quizzes/create', quizData, {
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

    async fetchQuestions() {
      const token = localStorage.getItem('token');
      try {
        const response = await this.$axios.get('/api/questions/my-questions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.existingQuestions = response.data;
      } catch (error) {
        console.error('Fehler beim Abrufen der Fragen:', error);
      }
    },

    async uploadImage(event) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      try {
        const response = await this.$axios.post('/api/quizzes/upload-image', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        this.quiz.image = `${response.data.imagePath}`; 
      } catch (error) {
        console.error('Fehler beim Hochladen des Bildes:', error.response ? error.response.data : error.message);
        this.errorMessage = 'Fehler beim Hochladen des Bildes: ' + (error.response ? error.response.data.message : error.message);
      }
    },

    openQuestionModal() {
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    addNewQuestion(newQuestion) {
      this.existingQuestions.push(newQuestion);
      this.selectedQuestions.push(newQuestion._id);
      this.closeModal();
    },

    resetForm() {
      this.quiz.title = '';
      this.quiz.description = '';
      this.quiz.timer = 30;
      this.quiz.image = '';
      this.selectedQuestions = [];
    }
  },

  mounted() {
    this.fetchQuestions();
  }
};
</script>

<style scoped>
/* Scrollbarer Fragencontainer */
.max-h-48 {
  max-height: 12rem;
  overflow-y: auto;
}


</style>
