<template>
    <div>
      <!-- Navbar -->
      <nav class="bg-gray-800 p-4 text-white">
        <div class="container mx-auto">
          <ul class="flex space-x-4">
            <li>
              <NuxtLink to="/" class="hover:underline">Startseite</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/login" class="hover:underline">Login</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/create-question" class="hover:underline">Fragen erstellen</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/create-quiz" class="hover:underline">Quiz erstellen</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/edit-questions" class="hover:underline"> Fragen bearbeiten</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/edit-quiz" class="hover:underline">Quiz bearbeiten</NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
  
      <!-- Page content -->
      <NuxtPage />
    </div>
  </template>
  
  <style scoped>
  nav {
    background-color: #2d3748; /* Darker background for navbar */
  }
  </style>
  