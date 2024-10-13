export default defineNuxtConfig({
  plugins: ['~/plugins/axios.js'],

  axios: {
    baseURL: 'http://localhost:3000', // Backend-URL (Express.js)
  },

  devtools: {
    enabled: true, // DevTools einschalten
  },

  // Nitro-Server für Nuxt 3 konfigurieren (für Entwicklungsport)
  nitro: {
    devServer: {
      port: 3001, // Ändere den Port des Frontends auf 3001
    },
  },

  compatibilityDate: '2024-10-13',
})