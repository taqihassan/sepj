<template>
  <section class="bg-gray-50 dark:bg-white-200 min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6 md:p-8 lg:p-10">
      <h1 class="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-black text-center">Frage erstellen</h1>

      <form @submit.prevent="createQuestion" class="space-y-6">
        
        <!-- Frage -->
        <div>
          <label for="question-text" class="block mb-2 text-lg font-medium text-gray-900">Fragetext:</label>
          <input id="question-text" v-model="question.text" type="text" 
            class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Gib deine Frage ein" required />
        </div>

        <!-- Antwortmöglichkeiten -->
        <div>
          <label class="block mb-4 text-lg font-medium text-gray-900">Antwortmöglichkeiten:</label>
          
          <!-- Scrollbarer Container für Antworten -->
          <div class="max-h-52 overflow-y-auto border border-gray-200 p-3 rounded-lg">
            <div v-for="(option, index) in question.options" :key="index" class="mb-4">
              <input v-model="option.text" type="text" 
                :placeholder="'Antwort ' + (index + 1)" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" required />

              <label class="flex items-center text-sm font-medium text-gray-900">
                <input type="checkbox" v-model="option.isCorrect" class="mr-2 focus:ring-blue-500" />
                Richtige Antwort
              </label>

              <button @click="removeAnswer(index)" v-if="question.options.length > 2" 
                type="button" class="text-red-500 hover:text-red-700 mt-2">
                Antwort entfernen
              </button>
            </div>
          </div>

          <!-- Antwort hinzufügen -->
          <button @click="addAnswer" v-if="question.options.length < 4" 
            type="button" class="text-blue-500 hover:text-blue-700 font-bold mt-4">
            + Antwort hinzufügen
          </button>
        </div>

        <!-- Bild-Upload -->
        <div>
          <label class="block mb-2 text-lg font-medium text-gray-900">Titelbild:</label>
          <input type="file" @change="uploadImage" 
            class="w-full p-3 border border-gray-300 rounded-lg" />
          
          <div v-if="question.image" class="mt-4">
            <img :src="question.image" alt="Titelbild Vorschau" class="max-w-full h-auto rounded-lg shadow-md" />
          </div>
        </div>

        <!-- Erstellen Button -->
        <div class="flex justify-center">
          <button type="submit" 
            class="bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            Frage erstellen
          </button>
        </div>
      </form>

      <!-- Erfolg & Fehler -->
      <div v-if="successMessage" class="text-green-700 bg-green-100 p-4 rounded-lg mt-6 text-center">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="text-red-700 bg-red-100 p-4 rounded-lg mt-6 text-center">
        {{ errorMessage }}
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      question: {
        text: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        image: '' // Speichert den Bildpfad
      },
      successMessage: '',
      errorMessage: ''
    };
  },
  methods: {
    // Antwortoption hinzufügen (max. 4)
    addAnswer() {
      if (this.question.options.length < 4) {
        this.question.options.push({ text: '', isCorrect: false });
      }
    },

    // Antwortoption entfernen (mind. 2)
    removeAnswer(index) {
      if (this.question.options.length > 2) {
        this.question.options.splice(index, 1);
      }
    },

    // Bild hochladen
    async uploadImage(event) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3000/api/questions/upload-image', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        const data = await response.json();
        this.question.image = `http://localhost:3000${data.imagePath}`; // Bildpfad setzen
      } catch (error) {
        console.error('Fehler beim Hochladen des Bildes:', error);
        this.errorMessage = 'Fehler beim Hochladen des Bildes';
      }
    },

    // Frage erstellen
    async createQuestion() {
      // Mindestens eine richtige Antwort muss gesetzt sein
      const correctAnswers = this.question.options.filter(option => option.isCorrect);
      if (correctAnswers.length === 0) {
        this.errorMessage = 'Bitte markieren Sie mindestens eine Antwort als richtig.';
        return;
      }

      try {
        const token = localStorage.getItem('token');

        const response = await fetch('http://localhost:3000/api/questions/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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

    // Formular zurücksetzen
    resetForm() {
      this.question = {
        text: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        image: ''
      };
    }
  }
};
</script>

<style scoped>
/* Scrollbarer Fragencontainer */
.max-h-52 {
  max-height: 13rem;
  overflow-y: auto;
}
</style>
