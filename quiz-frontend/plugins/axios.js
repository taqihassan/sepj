import axios from 'axios';

export default defineNuxtPlugin(() => {
  const api = axios.create({
    baseURL: process.server
      ? `http://127.0.0.1:3000` // Auf dem Server
      : `http://${window.location.hostname}:3000`, // Auf dem Client dynamische Host-IP
  });

  return {
    provide: {
      axios: api,
    },
  };
});
