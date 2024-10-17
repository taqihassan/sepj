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
          <input v-model="question.options[0]" type="text" placeholder="Option 1" required />
          <input v-model="question.options[1]" type="text" placeholder="Option 2" required />
          <input v-model="question.options[2]" type="text" placeholder="Option 3" />
          <input v-model="question.options[3]" type="text" placeholder="Option 4" />
        </div>
        <div>
          <label>Richtige Antwort:</label>
          <input v-model="question.correctAnswer" type="text" placeholder="Richtige Antwort" required />
        </div>
        <!-- Verstecktes Eingabefeld für die userId -->
        <input type="hidden" v-model="question.userId" />
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
          options: ['', '', '', ''],
          correctAnswer: '',
          userId: '670fd8cdb754b88b7ebdce41' // ID des Dummy-Users
        },
        successMessage: '',
        errorMessage: ''
      };
    },
    methods: {
      async createQuestion() {
        try {
          const response = await fetch('http://localhost:3000/questions/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.question),
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
          options: ['', '', '', ''],
          correctAnswer: '',
          userId: '670fd8cdb754b88b7ebdce41' // Stelle sicher, dass die userId immer gesetzt ist
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
  