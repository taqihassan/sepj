<!-- modus.vue -->
<template>
 <div class="flex flex-col items-center">
    <h2 class="text-xl font-semibold mb-4">Wähle einen Spielmodus</h2>
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4" @click="selectSingleplayer">Einzelspieler</button>
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4" @click="showMultiplayerComingSoon">Mehrspieler</button>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      selectSingleplayer() {
        this.$router.push({ name: 'quiz' }); // Navigiere zu quiz.vue
      },
      showMultiplayerComingSoon() {
        alert('Mehrspieler-Modus kommt bald!'); // Zeige eine Benachrichtigung
      }
    }
  };
  </script>
  