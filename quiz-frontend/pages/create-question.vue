<template>
    <section class="bg-gray-50 dark:bg-white-900">

  <div class="container mx-auto p-8 bg-grey shadow-lg rounded-lg  mx-auto md:h-screen lg:py-0">
    <h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-black text-center">Frage erstellen</h1>
    <form @submit.prevent="createQuestion" class="space-y-6">
      <div>
        <label for="question-text" class="block mb-2 text-lg font-medium text-gray-900 dark:text-black">Fragetext:</label>
        <input id="question-text" v-model="question.text" type="text" class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Gib deine Frage ein" required />
      </div>
      <div>
        <label class="block mb-4 text-lg font-medium text-gray-900 dark:text-black">Antwortmöglichkeiten:</label>
        <div v-for="(option, index) in question.options" :key="index" class="mb-6">
          <input v-model="option.text" type="text" :placeholder="'Option ' + (index + 1)" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-2" required />
          <label class="flex items-center text-sm font-medium text-gray-900 dark:text-black">
            <input type="checkbox" v-model="option.isCorrect" class="mr-2 focus:ring-blue-500" />
            Richtige Antwort
          </label>
        </div>
      </div>
      <div class="flex justify-center">
        <button type="submit" class="bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50">
          Frage erstellen
        </button>
      </div>
    </form>

    <div v-if="successMessage" class="text-green-700 bg-green-100 p-4 rounded-lg mt-8 text-center">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="text-red-700 bg-red-100 p-4 rounded-lg mt-8 text-center">
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

        const response = await fetch('http://localhost:3000/api/questions/create', {
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
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  background-color: #f9fafb;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
