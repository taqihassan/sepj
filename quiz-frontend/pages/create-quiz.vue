<template>
<section class="bg-gray-50 dark:bg-blue-200 min-h-screen flex items-center">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-black text-center">Erstelle ein neues Quiz</h1>
    <form @submit.prevent="createQuiz" class="space-y-6">
      
      <!-- Quiz Title -->
      <div>
        <label class="block mb-2 text-lg font-medium text-gray-900 dark:text-black">Quiz Titel:</label>
        <input v-model="quiz.title" type="text" class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
      </div>
      
      <!-- Quiz Description -->
      <div>
        <label class="block mb-2 text-lg font-medium text-gray-900 dark:text-black">Beschreibung:</label>
        <textarea v-model="quiz.description" class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required></textarea>
      </div>
      
      <!-- Quiz Timer -->
      <div>
        <label class="block mb-2 text-lg font-medium text-gray-900 dark:text-black">Timer (in Sekunden):</label>
        <input v-model.number="quiz.timer" type="number" min="10" max="300" class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
      </div>
      
      <!-- Image Upload -->
      <div>
        <label class="block mb-2 text-lg font-medium text-gray-900 dark:text-black">Titelbild:</label>
        <input type="file" @change="uploadImage" class="w-full p-4 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        <div v-if="quiz.image" class="mt-4">
          <img :src="quiz.image" alt="Titelbild Vorschau" class="max-w-full h-auto" />
        </div>
      </div>
      <div>
    <!-- Button to Toggle Dropdown -->
    <button @click="toggleDropdown" id="dropdownHelperButton" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">
      Füge bestehende Fragen hinzu
      <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div v-if="isDropdownOpen" id="dropdownHelper" class="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-60 dark:bg-gray-700 dark:divide-gray-600 mt-2">
      <div v-for="(question, index) in existingQuestions" :key="question._id" class="p-3 space-y-1">
        <label class="flex items-center text-lg text-white-900 dark:text-white">
          <input type="checkbox" :value="question._id" v-model="selectedQuestions" class="mr-3">
          {{ question.text }}
        </label>
      </div>
    </div>
  </div>
      
      <!-- Buttons -->
      <div class="flex justify-between mt-6">
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
      username: '' // Add username field to store the user's name
    },
    selectedQuestions: [],
    existingQuestions: [],
    showModal: false,
    successMessage: '',
    errorMessage: '',
    isDropdownOpen: false // Zustand zur Steuerung des Dropdowns
  };
},
  methods: {
    toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  },
    // Function to create a new quiz with selected questions and optional image
    async createQuiz() {
  const token = localStorage.getItem('token');
  const quizData = {
    title: this.quiz.title,
    description: this.quiz.description,
    timer: this.quiz.timer,
    questions: this.selectedQuestions,
    image: this.quiz.image // Include image URL in the quiz data
  };
  try {
    const response = await this.$axios.post('/api/quizzes/create', quizData, {
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
        const response = await this.$axios.get('/api/questions/my-questions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.existingQuestions = response.data; // Load existing questions into array
      } catch (error) {
        console.error('Fehler beim Abrufen der Fragen:', error);
      }
    },

    // Upload Image Function
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
        // Construct the full URL to display the image
        this.quiz.image = `http://localhost:3000${response.data.imagePath}`; 
      } catch (error) {
        console.error('Fehler beim Hochladen des Bildes:', error.response ? error.response.data : error.message);
        this.errorMessage = 'Fehler beim Hochladen des Bildes: ' + (error.response ? error.response.data.message : error.message);
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
      this.quiz.image = '';
      this.selectedQuestions = [];
    }
  },

  // Fetch questions on component mount
  mounted() {
    this.fetchQuestions();
  }
};
</script>

