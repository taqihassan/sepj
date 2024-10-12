import axios from 'axios'

export default defineNuxtPlugin(() => {
  const api = axios.create({
    baseURL: 'http://localhost:3000', // URL deines Backends
  })

  return {
    provide: {
      axios: api,
    },
  }
})
