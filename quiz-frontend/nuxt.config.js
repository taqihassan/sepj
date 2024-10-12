export default defineNuxtConfig({
  // Plugins, die in der Anwendung verwendet werden
  plugins: ['~/plugins/axios.js'],

  // Axios-Konfiguration (als Plugin integriert)
  // Optionale Einstellungen (falls notwendig)
  // z.B. kannst du hier auch andere Nuxt-Konfigurationen hinzufügen
  // modules: [],
  // Globale Einstellungen für die Anwendung
  // z.B. könntest du CSS-Dateien hier global einbinden
  // css: [],
  axios: {
    baseURL: 'http://localhost:3000', // Backend-URL (Express.js-Server)
  },

  compatibilityDate: '2024-10-12'
})