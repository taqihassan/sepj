<script>
import axios from 'axios';

export default {
  data() {
    return {
      email: '',
      password: '',
      showError: false,
      errorMessage: '',
    };
  },
  methods: {
    async login(event) {
  event.preventDefault();
  console.log('Login-Daten werden gesendet:', { email: this.email, password: this.password });

  try {
    const response = await this.$axios.post('/api/login', {
      email: this.email,
      password: this.password,
    });

    console.log('Login erfolgreich:', response.data);

    // Überprüfen, ob die Serverantwort gültig ist
    if (response.data && response.data.token) {
      // Token und Username speichern
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      window.dispatchEvent(new Event('loginStatusChanged'));

      // Weiterleitung zu einer geschützten Seite (z. B. Dashboard)
      this.$router.push('/');
    } else {
      throw new Error('Ungültige Serverantwort');
    }
  } catch (error) {
    console.error('Fehler beim Login:', error);

    // Fehlerbehandlung
    this.showError = true;
    this.errorMessage = error.response?.data?.message || 'Ein unbekannter Fehler ist aufgetreten';
  }
},
    closeModal() {
      this.showError = false; // Pop-up schließen
    },
  },
};
</script>

<template>
  <section class="bg-gray-50 dark:bg-gray-900">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="../" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        <img class="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo">
        Quizzy
      </a>
      <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Sign in to your account
          </h1>
          <form class="space-y-4 md:space-y-6" @submit="login">
            <div>
              <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
              <input type="email" v-model="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required>
            </div>
            <div>
              <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
              <input type="password" v-model="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
            </div>
            <button type="submit" class="w-full text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-500 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Sign in</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Pop-up-Modal -->
    <div v-if="showError" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-1/3">
        <h2 class="text-xl font-bold mb-4">Fehler beim Login</h2>
        <p>{{ errorMessage }}</p>
        <button @click="closeModal" class="mt-4 bg-red-600 text-white p-2 rounded-lg">Schließen</button>
      </div>
    </div>
  </section>
</template>
