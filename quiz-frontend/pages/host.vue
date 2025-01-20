<template>
    <div class="host-container">
      <h2 class="text-3xl font-bold text-center mb-6 text-blue-600">Leaderboard</h2>
  
      <div v-if="leaderboard.length > 0" class="leaderboard-wrapper">
        <h3 class="text-2xl font-semibold mb-4 text-center">Top 5 Spieler</h3>
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th class="text-left px-4 py-2">Platz</th>
              <th class="text-left px-4 py-2">Name</th>
              <th class="text-left px-4 py-2">Punkte</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(player, index) in leaderboard" :key="index" class="leaderboard-item">
              <td class="px-4 py-2">{{ index + 1 }}</td>
              <td class="px-4 py-2">{{ player.username }}</td>
              <td class="px-4 py-2"> {{ player.score }} Punkte</td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <div v-else class="text-center">
        <p class="text-gray-600 text-lg">Warte, bis alle Spieler das Quiz abgeschlossen haben...</p>
      </div>
    </div>
  </template>
  
  <script>
  import io from "socket.io-client";
  
  export default {
    data() {
      return {
        leaderboard: [], // Leaderboard-Daten
        roomCode: null, // Raumcode
      };
    },
    created() {
      // Raumcode aus der URL-Query abrufen
      this.roomCode = this.$route.query.roomCode;
  
      // WebSocket-Verbindung herstellen
      this.socket = io("http://localhost:3000");
  
      // Dem Raum beitreten
      this.socket.emit("join-room", { roomCode: this.roomCode, username: "Host" });
  
      // Auf das Leaderboard warten
      this.socket.on("leaderboard-ready", (data) => {
        this.leaderboard = data.leaderboard;
      });
    },
    beforeDestroy() {
      if (this.socket) {
        this.socket.disconnect();
      }
    },
  };
  </script>
  
  <style scoped>
  .host-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #f9f9f9;
    padding: 20px;
  }
  
  .leaderboard-wrapper {
    background-color: #ffffff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 20px;
    max-width: 600px;
    width: 100%;
  }
  
  .leaderboard-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  
  .leaderboard-table th,
  .leaderboard-table td {
    border-bottom: 1px solid #e0e0e0;
    padding: 10px;
  }
  
  .leaderboard-table th {
    background-color: #f3f3f3;
    font-weight: bold;
  }
  
  .leaderboard-table tr:last-child td {
    border-bottom: none;
  }
  
  .leaderboard-table td {
    font-size: 16px;
  }
  
  .leaderboard-table td:first-child {
    font-weight: bold;
  }
  
  .text-center {
    margin-top: 20px;
  }
  </style>
  