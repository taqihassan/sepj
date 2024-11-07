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
        <button @click="editQuiz(quiz)" class="bg-yellow-600 hover:bg-yellow-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-500 focus:ring-opacity-50">
          Bearbeiten
        </button>
        <button @click="deleteQuiz(quiz._id)" class="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50">
          Löschen
        </button>
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

          <!-- Fragen anzeigen und bearbeiten -->
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-900">Fragen:</label>
            <div v-for="(question, index) in currentQuiz.questions" :key="index" class="mb-2">
              <input v-model="currentQuiz.questions[index].text" type="text" class="w-full p-2 border rounded mb-1" required placeholder="Fragetext eingeben" />
              <div v-for="(option, optIndex) in question.options" :key="optIndex" class="flex items-center mb-1">
                <input v-model="option.text" type="text" class="w-full p-2 border rounded mr-2" placeholder="Antwortoption eingeben" required />
                <label class="flex items-center">
                  <input type="checkbox" v-model="option.isCorrect" class="mr-2" />
                  Richtige Antwort
                </label>
              </div>
              <button type="button" @click="deleteQuestion(index)" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                Frage löschen
              </button>
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
import QuestionModal from '../components/QuestionModal.vue'; // Corrected path


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
      currentQuiz: {
        title: '',
        description: '',
        timer: 30,
        questions: []
      },
      errorMessage: '',
      successMessage: ''
    };
  },
  methods: {
    async fetchQuizzes() {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3000/api/quizzes/my-quizzes', {
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
        const response = await axios.get(`http://localhost:3000/api/quizzes/${quiz._id}`, {
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
        questions: []
      };
    },
    async updateQuiz() {
      const token = localStorage.getItem('token');
      try {
        await axios.put(`http://localhost:3000/api/quizzes/${this.currentQuiz._id}`, this.currentQuiz, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.successMessage = 'Quiz erfolgreich aktualisiert!';
        this.errorMessage = '';
        this.showModal = false;
        this.fetchQuizzes();
      } catch (error) {
        this.errorMessage = 'Fehler beim Aktualisieren des Quizzes: ' + (error.response && error.response.data ? error.response.data.message : error.message);
        this.successMessage = '';
      }
    },
    async addNewQuestion(newQuestion) {
      // Add new question to the current quiz's questions array
      this.currentQuiz.questions.push(newQuestion);
      this.showQuestionModal = false; // Close the modal after adding
    },
    deleteQuestion(index) {
      if (this.currentQuiz && this.currentQuiz.questions) {
        this.currentQuiz.questions.splice(index, 1);
      }
    },
    async deleteQuiz(quizId) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:3000/api/quizzes/${quizId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.successMessage = 'Quiz erfolgreich gelöscht!';
        this.errorMessage = '';
        this.fetchQuizzes(); // Refresh the quizzes list
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
</style>
