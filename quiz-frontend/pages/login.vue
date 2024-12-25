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
      try {
        const response = await axios.post('http://localhost:3000/api/login', {
          email: this.email,
          password: this.password,
        });

        localStorage.setItem('token', response.data.token);
        window.dispatchEvent(new Event('loginStatusChanged'));

        this.$router.push('/dashboard');
      } catch (error) {
        this.showError = true;
        this.errorMessage = error.response?.data?.message || 'Ein unbekannter Fehler ist aufgetreten';
      }
    },
    closeModal() {
      this.showError = false;
    },
  },
};
</script>

<template>
  <section class="bg-gray-50 dark:bg-gray-900">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="/" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        <img class="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo">
        Quizzy
      </a>
      <div class="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800">
        <div class="p-6 space-y-4 sm:p-8">
          <h1 class="text-xl font-bold leading-tight text-gray-900 md:text-2xl dark:text-white">
            Sign in to your account
          </h1>
          <form @submit="login">
            <div>
              <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
              <input
                type="email"
                v-model="email"
                id="email"
                class="bg-gray-50 border text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
              <input
                type="password"
                v-model="password"
                id="password"
                class="bg-gray-50 border text-gray-900 rounded-lg w-full p-2.5 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <button type="submit" class="w-full bg-gray-600 text-white py-2.5 rounded-lg">Sign in</button>
          </form>
        </div>
      </div>
    </div>
    <div v-if="showError" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Fehler beim Login</h2>
        <p>{{ errorMessage }}</p>
        <button @click="closeModal" class="bg-red-600 text-white px-4 py-2 rounded-lg mt-4">Schließen</button>
      </div>
    </div>
  </section>
</template>
