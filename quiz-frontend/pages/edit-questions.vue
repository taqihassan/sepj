
<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Meine Fragen bearbeiten</h1>

    <!-- List of User's Questions -->
    <div v-if="userQuestions.length === 0 && !errorMessage" class="text-gray-900 dark:text-white">
      Keine Fragen gefunden.
    </div>
    <div v-if="errorMessage" class="text-red-700 bg-red-100 p-4 rounded-lg mb-4">
      {{ errorMessage }}
    </div>
    <div v-for="question in userQuestions" :key="question._id" class="mb-4 p-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ question.text }}</h3>
      <div class="mt-4">
        <button @click="selectQuestionToEdit(question)" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 mr-2">
          Bearbeiten
        </button>
        <button @click="deleteQuestion(question._id)" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
          Löschen
        </button>
      </div>
    </div>

    <!-- Edit Question Modal -->
    <div v-if="questionToEdit" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Frage bearbeiten</h2>
        <form @submit.prevent="updateQuestion">
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-900">Fragetext:</label>
            <input v-model="questionToEdit.text" type="text" class="w-full p-2 border rounded" required />
          </div>

          <!-- Display current image if available -->
          <div v-if="questionToEdit.image" class="mb-4">
  <label class="block mb-2 text-sm font-medium text-gray-900">Aktuelles Bild:</label>
  <img :src="getImageUrl(questionToEdit.image)" alt="Fragenbild" class="w-full h-32 object-cover rounded-lg mb-2" />
</div>

          <!-- Image Upload for New Image -->
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-900">Bild ändern:</label>
            <input type="file" @change="handleImageUpload" class="w-full p-2 border rounded" accept="image/*" />
          </div>

          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-900">Antwortmöglichkeiten:</label>
            <div v-for="(option, index) in questionToEdit.options" :key="index" class="mb-2">
              <input v-model="option.text" type="text" class="w-full p-2 border rounded mb-1" required />
              <label class="flex items-center">
                <input type="checkbox" v-model="option.isCorrect" class="mr-2" disabled />
                Richtige Antwort
              </label>
            </div>
          </div>

          <div class="flex justify-end">
            <button type="button" @click="cancelEdit" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
              Abbrechen
            </button>
            <button type="submit" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      userQuestions: [],
      questionToEdit: null,
      successMessage: '',
      errorMessage: '',
      selectedImageFile: null, // To store the new image file
    };
  },
  methods: {
    async fetchUserQuestions() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.errorMessage = 'Benutzer ist nicht authentifiziert. Bitte melden Sie sich an.';
        return;
      }
      try {
        const response = await this.$axios.get('/api/questions/my-questions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.userQuestions = response.data;
        this.errorMessage = '';
      } catch (error) {
        this.errorMessage = 'Fehler beim Abrufen der Fragen.';
      }
    },
    async deleteQuestion(questionId) {
      const token = localStorage.getItem('token');
      if (!token) {
        this.errorMessage = 'Benutzer ist nicht authentifiziert. Bitte melden Sie sich an.';
        return;
      }
      try {
        await this.$axios.delete(`/api/questions/${questionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.successMessage = 'Frage erfolgreich gelöscht!';
        this.fetchUserQuestions();
      } catch (error) {
        this.errorMessage = 'Fehler beim Löschen der Frage.';
      }
    },
    selectQuestionToEdit(question) {
      this.questionToEdit = JSON.parse(JSON.stringify(question));
      this.selectedImageFile = null;
    },
    cancelEdit() {
      this.questionToEdit = null;
      this.selectedImageFile = null;
    },
    handleImageUpload(event) {
      this.selectedImageFile = event.target.files[0];
    },
    getImageUrl(imagePath) {
  if (!imagePath) return ''; // Falls kein Bild vorhanden ist, nichts zurückgeben
  return imagePath.startsWith('/uploads/') ? imagePath : `/uploads/${imagePath}`;
},
    async updateQuestion() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.errorMessage = 'Benutzer ist nicht authentifiziert. Bitte melden Sie sich an.';
        return;
      }

      try {
        const formData = new FormData();
        formData.append('text', this.questionToEdit.text);
        formData.append('options', JSON.stringify(this.questionToEdit.options));

        // Append image file if a new image is selected
        if (this.selectedImageFile) {
          formData.append('image', this.selectedImageFile);
        }

        await this.$axios.put(`/api/questions/update-image/${this.questionToEdit._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        });

        this.successMessage = 'Frage erfolgreich aktualisiert!';
        this.fetchUserQuestions();
        this.cancelEdit();
      } catch (error) {
        this.errorMessage = 'Fehler beim Aktualisieren der Frage.';
      }
    },
  },
  mounted() {
    this.fetchUserQuestions();
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
}
</style>
