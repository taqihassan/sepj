<template>
  <div class="container mx-auto p-8 bg-white shadow-lg rounded-lg dark:bg-gray-800">
    <h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-black text-center">Meine Quizzes</h1>
    <div v-if="quizzes.length === 0" class="text-center text-gray-700 dark:text-gray-300">
      Keine Quizzes gefunden.
    </div>
    <div v-for="quiz in quizzes" :key="quiz._id" class="mb-6 p-4 border-b border-gray-300 dark:border-gray-700">
      <h2 class="text-2xl font-bold mb-2 text-gray-800 dark:text-black">{{ quiz.title }}</h2>
      <p class="text-gray-700 dark:text-gray-400">{{ quiz.description }}</p>
      <div class="flex justify-end mt-4 space-x-4">
        <button @click="duplicateQuiz(quiz._id)" class="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50">
          Duplizieren
        </button>
        <button @click="showFeedback(quiz._id)" class="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50">
          Feedback
        </button>
        <button @click="editQuiz(quiz)" class="bg-yellow-600 hover:bg-yellow-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-500 focus:ring-opacity-50">
          Bearbeiten
        </button>
        <button @click="deleteQuiz(quiz._id)" class="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50">
          Löschen
        </button>
      </div>
    </div>

    <!-- Feedback Modal -->
<div v-if="showFeedbackModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
  <div class="bg-white p-6 rounded-lg w-full max-w-lg">
    <h2 class="text-xl font-bold mb-4">{{ modalTitle }}</h2>
    <div v-if="currentFeedback.length > 0">
      <ul>
        <li v-for="(feedback, index) in currentFeedback" :key="index" class="mb-2">
          <p class="text-gray-800 dark:text-gray-200">{{ feedback.feedbackText }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Von: {{ feedback.userId.username }}</p>
        </li>
      </ul>
    </div>
    <div v-else>
      <p class="text-gray-600">Keine Feedbacks verfügbar.</p>
    </div>
    <div class="flex justify-end mt-4">
      <button @click="closeFeedbackModal" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Schließen</button>
    </div>
  </div>
</div>

    <!-- Modal for Editing Quiz -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 class="text-xl font-bold mb-4">{{ modalTitle }}</h2>
        <form @submit.prevent="updateQuiz">
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-900">Titel:</label>
            <input v-model="currentQuiz.title" type="text" class="w-full p-2 border rounded" required />
          </div>
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-900">Beschreibung:</label>
            <textarea v-model="currentQuiz.description" class="w-full p-2 border rounded" required></textarea>
          </div>
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-900">Timer (in Sekunden):</label>
            <input v-model.number="currentQuiz.timer" type="number" min="10" max="300" class="w-full p-2 border rounded" required />
          </div>

          <!-- Display current image if available -->
          <div v-if="currentQuiz.image">
            <img :src="currentQuiz.image" alt="Quiz Bild" class="w-full h-32 object-cover rounded-lg" />
          </div>

          <!-- Image Upload for New Title Image -->
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-900">Titelbild ändern:</label>
            <input type="file" @change="handleImageUpload" class="w-full p-2 border rounded" accept="image/*" />
          </div>

          <!-- Fragen anzeigen und bearbeiten mit Scroll-Container -->
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-900">Fragen:</label>
            
            <!-- Scroll-Container für Fragen -->
            <div class="question-scroll-container">
              <div v-for="(question, index) in currentQuiz.questions" :key="index" class="mb-4">
                <div class="flex justify-between items-center">
                  <input 
                    v-model="currentQuiz.questions[index].text" 
                    type="text" 
                    class="w-full p-2 border rounded mb-1" 
                    required 
                    placeholder="Fragetext eingeben" 
                  />
                  <button 
                    @click="toggleOptions(index)" 
                    type="button" 
                    class="ml-2 text-gray-500 focus:outline-none">
                    <span v-if="question.showOptions">▼</span>
                    <span v-else>▶</span>
                  </button>
                </div>
                <div v-show="question.showOptions" class="mt-2 ml-4 border-l-2 border-gray-300 pl-4">
                  <div v-for="(option, optIndex) in question.options" :key="optIndex" class="flex items-center mb-1">
                    <p class="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 mr-2 flex items-center justify-between">
                      <span>{{ option.text }}</span>
                      <span v-if="option.isCorrect" class="text-green-600 font-semibold">✔</span>
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  @click="deleteQuestion(index)" 
                  class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mt-2">
                  Frage löschen
                </button>
              </div>
            </div>

            <button type="button" @click="showQuestionModal = true" class="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded mt-2">
              Neue Frage hinzufügen
            </button>
          </div>

          <div class="flex justify-end">
            <button type="button" @click="closeModal" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">Abbrechen</button>
            <button type="submit" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Speichern</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Question Modal for Creating New Questions -->
    <question-modal v-if="showQuestionModal" @close="showQuestionModal = false" @save="addNewQuestion" />
    
    <div v-if="errorMessage" class="text-red-700 bg-red-100 p-4 rounded-lg mt-8 text-center">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="text-green-700 bg-green-100 p-4 rounded-lg mt-8 text-center">
      {{ successMessage }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

import QuestionModal from '../components/QuestionModal.vue';

export default {
  components: {
    QuestionModal
  },
  data() {
    return {
      quizzes: [],
      showModal: false,
      modalTitle: '',
      showQuestionModal: false, // Control question modal visibility
      showFeedbackModal: false,
      currentFeedback: [], // Feedback-Daten für das Modal
      errorMessage: '',
      successMessage: '',
      currentQuiz: {
        title: '',
        description: '',
        timer: 30,
        questions: [],
        image: '' // Store current image filename if available
      },
      selectedImageFile: null, // Track the selected image file for uploading
      errorMessage: '',
      successMessage: ''
    };
  },
  methods: {
   async showFeedback(quizId) {
    const token = localStorage.getItem('token');
    try {
      const response = await this.$axios.get(`/api/feedback/${quizId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.data.length === 0) {
        alert('Keine Feedbacks für dieses Quiz vorhanden.');
        return;
      }
      this.currentFeedback = response.data;
      this.modalTitle = 'Feedback für das Quiz';
      this.showFeedbackModal = true;

      console.log('Feedback erhalten:', this.currentFeedback);
    console.log('showFeedbackModal:', this.showFeedbackModal);
    } catch (error) {
      console.error('Fehler beim Abrufen des Feedbacks:', error.message);
      alert('Fehler beim Abrufen des Feedbacks.');
    }
  },
  closeFeedbackModal() {
    this.showFeedbackModal = false;
    this.currentFeedback = [];
  },
    async fetchQuizzes() {
      const token = localStorage.getItem('token');
      try {
        const response = await this.$axios.get('/api/quizzes/my-quizzes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.quizzes = response.data;
      } catch (error) {
        this.errorMessage = 'Fehler beim Abrufen der Quizzes: ' + (error.response && error.response.data ? error.response.data.message : error.message);
      }
    },
    async editQuiz(quiz) {
      const token = localStorage.getItem('token');
      try {
        const response = await this.$axios.get(`/api/quizzes/${quiz._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.currentQuiz = response.data;
        this.modalTitle = 'Quiz bearbeiten';
        this.showModal = true;
      } catch (error) {
        this.errorMessage = 'Fehler beim Abrufen des Quizzes: ' + (error.response && error.response.data ? error.response.data.message : error.message);
      }
    },
    closeModal() {
      this.showModal = false;
      this.currentQuiz = {
        title: '',
        description: '',
        timer: 30,
        questions: [],
        image: ''
      };
      this.selectedImageFile = null;
    },
    async updateQuiz() {
      const token = localStorage.getItem('token');
      try {
        // Update the quiz details first
        await this.$axios.put(`/api/quizzes/${this.currentQuiz._id}`, this.currentQuiz, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // If a new image file was selected, upload it
        if (this.selectedImageFile) {
          const formData = new FormData();
          formData.append('image', this.selectedImageFile);
          formData.append('quizId', this.currentQuiz._id);
          
          await this.$axios.post('/api/quizzes/upload-image', formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
        }

        this.successMessage = 'Quiz erfolgreich aktualisiert!';
        this.errorMessage = '';
        this.showModal = false;
        this.fetchQuizzes();
      } catch (error) {
        this.errorMessage = 'Fehler beim Aktualisieren des Quizzes: ' + (error.response && error.response.data ? error.response.data.message : error.message);
        this.successMessage = '';
      }
    },
    handleImageUpload(event) {
      this.selectedImageFile = event.target.files[0];
    },
    async duplicateQuiz(quizId) {
      const token = localStorage.getItem('token');
      try {
        const response = await this.$axios.post(`/api/quizzes/duplicate/${quizId}`, null, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.successMessage = 'Quiz erfolgreich dupliziert!';
        this.errorMessage = '';
        this.fetchQuizzes(); // Refresh the quizzes list
      } catch (error) {
        this.errorMessage = 'Fehler beim Duplizieren des Quizzes: ' + (error.response && error.response.data ? error.response.data.message : error.message);
        this.successMessage = '';
      }
    },
    getImageUrl(imagePath) {
    return `http://localhost:3000${imagePath}`;
    },
    async addNewQuestion(newQuestion) {
      newQuestion.showOptions = false;
      this.currentQuiz.questions.push(newQuestion);
      this.showQuestionModal = false;
    },
    toggleOptions(index) {
      this.currentQuiz.questions[index].showOptions = !this.currentQuiz.questions[index].showOptions;
    },
    deleteQuestion(index) {
      this.currentQuiz.questions.splice(index, 1);
    },
    async deleteQuiz(quizId) {
      const token = localStorage.getItem('token');
      try {
        await this.$axios.delete(`/api/quizzes/${quizId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.successMessage = 'Quiz erfolgreich gelöscht!';
        this.errorMessage = '';
        this.fetchQuizzes();
      } catch (error) {
        this.errorMessage = 'Fehler beim Löschen des Quizzes: ' + (error.response && error.response.data ? error.response.data.message : error.message);
        this.successMessage = '';
      }
    }
  },
  mounted() {
    this.fetchQuizzes();
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

.question-scroll-container {
  max-height: 300px; /* Maximalhöhe des Containers */
  overflow-y: auto; /* Ermöglicht vertikales Scrollen */
  border: 1px solid #ccc; /* Optional: Rahmen um den Container */
  padding: 10px;
  background-color: #f9fafb; /* Optional: Hintergrundfarbe */
  border-radius: 5px;
}
</style>