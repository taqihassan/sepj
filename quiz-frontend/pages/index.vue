<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold text-center mb-6">Willkommen im Quizsystem</h1>
    <div class="flex justify-center mt-4">
  <button @click="handleQuizStart" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
    Quiz starten
  </button>
</div>

    
    <div v-if="showPopup" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 class="text-xl font-bold mb-4">Anmeldung erforderlich</h2>
        <p class="mb-4">Bitte melde dich an, um das Quiz zu starten.</p>
        <div class="flex justify-end">
          <button @click="goToLogin" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
            Zum Login
          </button>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
export default {
  data() {
    return {
      showPopup: false,
      isAuthenticated: false // Standardmäßig auf "nicht authentifiziert" setzen
    };
  },
  methods: {
    handleQuizStart() {
      
        this.navigateToMode(); // Navigiert zum Modus, wenn der Benutzer angemeldet ist
      
    },
    goToLogin() {
      this.showPopup = false;
      // Hier könntest du den Benutzer zur Login-Seite leiten, wo er sich anmelden muss
      this.$router.push({ name: 'login' });
    },
    navigateToMode() {
      this.$router.push({ name: 'modus' });
    },
    login() {
      // Dies ist ein einfaches Beispiel; in der Realität würdest du hier den Login-Prozess abbilden
      this.isAuthenticated = true; // Setze isAuthenticated auf true, wenn der Benutzer erfolgreich angemeldet ist
      this.showPopup = false;
    }
  }
};
</script>

<style scoped>
/* Keine benutzerdefinierten Styles erforderlich, alle Stile basieren auf Tailwind CSS */
</style>
