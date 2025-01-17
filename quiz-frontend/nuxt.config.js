export default defineNuxtConfig({
  plugins: ['~/plugins/axios.js'],

  axios: {
    baseURL: 'http://localhost:3000', // Backend-URL (Express.js)
  },

  devtools: {
    enabled: true, // DevTools einschalten
  },

  css: ['~/assets/css/tailwind.css'],

    postcss: {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    },

  // Nitro-Server für Nuxt 3 konfigurieren (für Entwicklungsport)
  nitro: {
    devServer: {
      port: 3001, // Ändere den Port des Frontends auf 3001
      host: '0.0.0.0', // Akzeptiere Verbindungen von allen IP-Adressen
    },
    devProxy: {
      '/api': {
        target: 'http://192.168.0.112:3000', // Ersetze mit deiner lokalen IP-Adresse für das Backend
        changeOrigin: true,
      },
    },
  },

  compatibilityDate: '2024-10-13',
})