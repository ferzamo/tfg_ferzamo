"use strict";

var express = require("express");
var bodyParser = require("body-parser");

var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

// cargar routes
var player_routes = require("./routes/player");
var game_routes = require("./routes/game");
var deck_routes = require("./routes/deck")

const axios = require('axios')


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configurar cabeceras
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");

  next();
});

//rutas base
app.use("/api", player_routes);
app.use("/api", game_routes);
app.use("/api", deck_routes);

//Socket.io



io.on("connection", (socket) => {
  
  console.log("a user connected");
 


  socket.on("disconnect", () =>  {

    axios.delete('http://localhost:3977/api/deletePlayer/' + socket.user)
    socket.to(socket.game).emit('playerDisconnectedBroadcast', socket.user);
    console.log("user disconnected");
  });

  socket.on('playerConnection', (player) => {
    socket.user = player._id;
    socket.game = player.game;
    socket.join(socket.game);
    socket.to(socket.game).emit('playerConnectionBroadcast', player);
  });

  socket.on('startGame', (player) => {
  
    socket.to(player.game).emit('startGameBroadcast', 'start');
  })

  socket.on('myTurnIsOver', (player) => {
    
    console.log(player.position);
    if (player.position!==9){
      
    socket.to(player.game).emit('startYourTurn', player.position+1);
    }
  })

});

module.exports = http;
