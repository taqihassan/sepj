<template>
  <div class="modal">
    <h3>Neue Frage erstellen</h3>
    <form @submit.prevent="saveQuestion">
      <label>Fragetext:</label>
      <input v-model="questionText" required />

      <h4>Antworten</h4>
      <div v-for="(answer, index) in answers" :key="index">
        <input v-model="answer.text" placeholder="Antworttext" required />
        <label>
          <input type="checkbox" v-model="answer.isCorrect" />
          Richtige Antwort
        </label>
        <button @click="removeAnswer(index)" v-if="answers.length > 2">Entfernen</button>
      </div>

      <button @click="addAnswer" v-if="answers.length < 4">Antwort hinzufügen</button>
      <button type="submit">Speichern</button>
      <button @click="$emit('close')">Abbrechen</button>
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
      const newQuestion = {
        text: this.questionText,
        options: this.answers
      };

      try {
        const response = await axios.post('http://localhost:3000/questions/create', newQuestion);
        this.$emit('save', response.data); // Emit the new question data back to the parent
      } catch (error) {
        console.error('Fehler beim Erstellen der Frage:', error);
      }
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
</style>
