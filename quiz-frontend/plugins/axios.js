import axios from 'axios'

export default defineNuxtPlugin(() => {
  const api = axios.create({
    baseURL: 'http://192.x.x.x:3000', // URL deines Backends
  })

  return {
    provide: {
      axios: api,
    },
  }
})
