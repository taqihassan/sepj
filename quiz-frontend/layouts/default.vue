<template>
    <div>
      <!-- Navbar -->
      <nav class="bg-gray-800 p-4 text-white">
        <div class="container mx-auto">
          <ul class="flex space-x-4">
            <li>
              <NuxtLink to="/" class="hover:underline">Home</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/login" class="hover:underline">Login</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/create-question" class="hover:underline">Create Question</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/create-quiz" class="hover:underline">Create Quiz</NuxtLink>
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
  