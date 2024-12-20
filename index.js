const express = require("express");
const app = express();
const http = require("http");
const PORT = 3000;

// Create Express http server
const server = http.createServer(app);

// Server listens on port
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

// Initialize Socket IO on server
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "https://rive-penguin.netlify.app",
  },
});

// Here we need to create the states for the rive animation and
// set up an interval that updates the values

let isAngry = false;
let isHappy = false;
let hp = 75;

setInterval(() => {
  if (hp > 0) {
    if (hp < 35) {
      isAngry = true;
    } else {
      isAngry = false;
    }

    if (hp > 85) {
      isHappy = true;
    } else {
      isHappy = false;
    }
    hp = hp - 0.1;
    io.sockets.emit('status', { happyness: isHappy, angryness: isAngry, health: hp });
  }

  if (hp > 100) {
    hp = 100;
    io.sockets.emit('status', { happyness: isHappy, angryness: isAngry, health: hp });
  }
  if (hp <= 0) {
    hp = 0;
    io.sockets.emit('status', { happyness: isHappy, angryness: isAngry, health: hp });
  }

}, 1000);

// A user connects to the server (opens a socket)
io.sockets.on("connection", function (socket) {
  // Server recieves a ping and responds with an emit event (sends a message to all connected sockets)
  io.sockets.emit("greet", { mesasge: "Server says hello" });

  socket.on("feed", (data) => {
    if(isHappy == true){
      hp = hp + 1;
    } else if(isAngry == true){
      hp = hp + 5;
    } else {
      hp = hp + 3;
    }

    
    console.log("Recieved client ping: ", data);

    io.sockets.emit('feeding', {message: "feeding client"})
  });

  socket.on("play", (data) => {
    if(isHappy == true){
      hp = hp - 5;
    } else if(isAngry == true){
      hp = hp - 15; 
    } else {
      hp = hp - 10;
    }
    console.log("Recieved client ping: ", data);
    io.sockets.emit('playing', {message: "playing with client"})
  });

  socket.on("check-hp", (data, callback) => {
    console.log("Recieved client ping: ", data);
    callback({ health: hp });
  });
  
});
