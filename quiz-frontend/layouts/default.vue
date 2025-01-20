<template>
  <header>
    <nav class="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
      <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
        <a href="/" class="flex items-center">
          <img src="https://flowbite.com/docs/images/logo.svg" class="mr-3 h-6 sm:h-9" alt="Flowbite Logo" />
          <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Quizzy</span>
        </a>
        <div class="flex items-center lg:order-2">
          <!-- Bedingte Buttons -->
          <button
            v-if="!isLoggedIn"
            @click="$router.push('/login')"
            class="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
          >
            Log in
          </button>
          <button
            v-if="!isLoggedIn"
            @click="$router.push('/register')"
            class="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-500 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          >
            Sign up
          </button>
          <button
            v-if="isLoggedIn"
            @click="logout"
            class="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
          >
            Log out
          </button>
        </div>
        <div class="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
          <ul class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
            <li>
              <NuxtLink to="/" class="block py-2 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent lg:text-primary-700 lg:p-0 dark:text-white" aria-current="page">Startseite</NuxtLink>
            </li>
            <li v-if="isLoggedIn">
              <NuxtLink to="/create-quiz" class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Quiz erstellen</NuxtLink>
            </li>
            <li v-if="isLoggedIn">
              <NuxtLink to="/edit-quiz" class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Quiz bearbeiten</NuxtLink>
            </li>
            <li v-if="isLoggedIn">
              <NuxtLink to="/create-question" class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Fragen erstellen</NuxtLink>
            </li>
            <li v-if="isLoggedIn">
              <NuxtLink to="/edit-questions" class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Fragen bearbeiten</NuxtLink>
            </li>
            <li v-if="isLoggedIn">
              <NuxtLink to="/dashboard" class="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Rankings</NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Page content -->
  </header>
  <NuxtPage />
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false,
    };
  },
  mounted() {
  this.checkLoginStatus(); // Überprüft den Login-Status direkt beim Mounten
  window.addEventListener('loginStatusChanged', this.checkLoginStatus);
},
beforeDestroy() {
  window.removeEventListener('loginStatusChanged', this.checkLoginStatus);
},
  methods: {
    async checkLoginStatus() {
    const token = localStorage.getItem('token');
    
    // Überprüfen, ob ein Token vorhanden ist
    if (token) {
      try {
        // OPTIONAL: Anfrage zur Validierung des Tokens
        const response = await this.$axios.get('/api/validate-token', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.isLoggedIn = response.data.valid; // Setzt isLoggedIn basierend auf der Serverantwort
      } catch (error) {
        console.error('Token-Validierung fehlgeschlagen:', error);
        this.isLoggedIn = false; // Ungültiges Token
        localStorage.removeItem('token'); // Entfernt das ungültige Token
      }
    } else {
      this.isLoggedIn = false; // Kein Token vorhanden
    }

    console.log('Login Status:', this.isLoggedIn);
  },
    logout() {
      // Entfernt das Token und leitet zur Login-Seite um
      localStorage.removeItem('token');
      this.isLoggedIn = false;
      this.$router.push('/login');
      window.dispatchEvent(new Event('loginStatusChanged'));
    },
  },
};
</script>
