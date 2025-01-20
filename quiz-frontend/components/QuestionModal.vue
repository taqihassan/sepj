<template>
  <div class="modal bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
    <h3 class="text-2xl font-semibold text-gray-800 mb-4">Neue Frage erstellen</h3>
    <form @submit.prevent="saveQuestion" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fragetext:</label>
        <input 
          v-model="questionText" 
          required 
          class="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Geben Sie den Fragetext ein"
        />
      </div>

      <h4 class="text-lg font-medium text-gray-700 mt-4">Antworten</h4>
      <div v-for="(answer, index) in answers" :key="index" class="flex items-center space-x-2 mb-2">
        <input 
          v-model="answer.text" 
          placeholder="Antworttext" 
          required 
          class="flex-grow border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <label class="flex items-center space-x-2">
          <input 
            type="checkbox" 
            v-model="answer.isCorrect" 
            class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
          />
          <span class="text-sm text-gray-600">Richtige Antwort</span>
        </label>
        <button 
          @click="removeAnswer(index)" 
          v-if="answers.length > 2" 
          type="button"
          class="text-red-500 hover:text-red-700 focus:outline-none"
        >
          Entfernen
        </button>
      </div>

      <div class="flex justify-between items-center mt-4">
        <button 
          @click="addAnswer" 
          v-if="answers.length < 4" 
          type="button"
          class="text-primary-600 hover:text-primary-800 font-medium focus:outline-none"
        >
          + Antwort hinzufügen
        </button>
      </div>

      <div class="flex justify-end space-x-4 mt-6">
        <button 
          @click="$emit('close')" 
          type="button"
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Abbrechen
        </button>
        <button 
          type="submit"
          class="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Speichern
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      questionText: '',
      answers: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    };
  },
  methods: {
    addAnswer() {
      if (this.answers.length < 4) {
        this.answers.push({ text: '', isCorrect: false });
      }
    },
    removeAnswer(index) {
      if (this.answers.length > 2) {
        this.answers.splice(index, 1);
      }
    },
    async saveQuestion() {
      // Validation to ensure at least one correct answer is selected
      const correctAnswers = this.answers.filter(answer => answer.isCorrect);
      if (correctAnswers.length === 0) {
        alert('Bitte markieren Sie mindestens eine Antwort als richtig.');
        return;
      }

      const token = localStorage.getItem('token');
      const newQuestion = {
        text: this.questionText,
        options: this.answers
      };

      try {
        const response = await axios.post('http://localhost:3000/api/questions/create', newQuestion, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.$emit('save', response.data.question); // Emit the new question data back to the parent
        this.resetForm();
      } catch (error) {
        console.error('Fehler beim Erstellen der Frage:', error);
      }
    },
    resetForm() {
      this.questionText = '';
      this.answers = [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ];
    }
  }
};
</script>

<style scoped>
.modal {
  padding: 20px;
  background: white;
  border: 1px solid #ccc;
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  max-width: 500px;
  width: 100%;
}

.text-primary-600 {
  color: #2563eb; 
}

.text-primary-800 {
  color: #1e40af; 
}

.bg-primary-600 {
  background-color: #2563eb; 
}

.bg-primary-700 {
  background-color: #1e40af; 
}

.focus:ring-primary-500 {
  box-shadow: 0 0 0 2px #3b82f6; 
}
</style>
