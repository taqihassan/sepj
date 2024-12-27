import axios from 'axios'

export default defineNuxtPlugin(() => {
  const api = axios.create({
    baseURL: 'http://192.168.0.112:3000', // URL deines Backends
  })

  return {
    provide: {
      axios: api,
    },
  }
})
