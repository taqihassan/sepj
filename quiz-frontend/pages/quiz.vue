<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 v-if="!quizEnded" class="text-2xl font-bold mb-6 text-center">{{ question.text }}</h2>
  
        <!-- Quiz wird angezeigt, wenn es nicht beendet ist -->
        <form v-if="!quizEnded" @submit.prevent="submitAnswer">
          <div v-for="(option, index) in question.options" :key="index" class="mb-4">
            <label>
              <input type="radio" v-model="selectedAnswer" :value="option" />
              {{ option }}
            </label>
          </div>
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">
            Antwort senden
          </button>
        </form>
  
        <!-- Endergebnis -->
        <div v-if="quizEnded" class="text-center">
          <h2 class="text-2xl font-bold">Quiz beendet!</h2>
          <p class="mt-4">Dein Punktestand: {{ score }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { io } from 'socket.io-client'
  
  const question = ref({ text: '', options: [] })
  const selectedAnswer = ref('')
  const score = ref(0)
  const quizEnded = ref(false)
  
  // Socket.io Verbindung
  const socket = io('http://localhost:3000')
  
  // Wenn eine neue Frage empfangen wird
  socket.on('next-question', (newQuestion) => {
    question.value = newQuestion
    selectedAnswer.value = ''
  })
  
  // Wenn das Quiz endet und das Endergebnis gesendet wird
  socket.on('quiz-end', (data) => {
    score.value = data.score
    quizEnded.value = true
  })
  
  // Antwort senden
  const submitAnswer = () => {
    socket.emit('submit-answer', selectedAnswer.value)
  }
  </script>
  
