<template>
  <div class="container">
    <h1>Frage erstellen</h1>
    <form @submit.prevent="createQuestion">
      <div>
        <label>Fragetext:</label>
        <input v-model="question.text" type="text" placeholder="Gib deine Frage ein" required />
      </div>
      <div>
        <label>Antwortmöglichkeiten:</label>
        <div v-for="(option, index) in question.options" :key="index">
          <input v-model="option.text" type="text" :placeholder="'Option ' + (index + 1)" required />
          <label>
            <input type="checkbox" v-model="option.isCorrect" />
            Richtige Antwort
          </label>
        </div>
      </div>
      <button type="submit">Frage erstellen</button>
    </form>

    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      question: {
        text: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]
      },
      successMessage: '',
      errorMessage: ''
    };
  },
  methods: {
    async createQuestion() {
      try {
        const token = localStorage.getItem('token'); // Hole das Token aus dem localStorage

        const response = await fetch('http://localhost:3000/questions/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Füge das Token im Authorization Header hinzu
          },
          body: JSON.stringify(this.question)
        });

        if (response.ok) {
          this.successMessage = 'Frage erfolgreich erstellt!';
          this.errorMessage = '';
          this.resetForm();
        } else {
          const errorData = await response.json();
          this.errorMessage = errorData.message || 'Fehler beim Erstellen der Frage';
          this.successMessage = '';
        }
      } catch (error) {
        this.errorMessage = 'Fehler beim Erstellen der Frage: ' + error.message;
        this.successMessage = '';
      }
    },
    resetForm() {
      this.question = {
        text: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]
      };
    }
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
  margin-top: 20px;
}

.error-message {
  color: red;
  margin-top: 20px;
}
</style>
