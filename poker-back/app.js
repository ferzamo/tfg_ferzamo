"use strict";

var express = require("express");
var bodyParser = require("body-parser");

var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

// cargar routes
var player_routes = require("./routes/player");
var game_routes = require("./routes/game");
var deck_routes = require("./routes/deck");
var registry_routes = require("./routes/registry");

const axios = require("axios");

var Deck = require("./models/deck");
var Game = require("./models/game");
var Player = require("./models/player");

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
app.use("/api", registry_routes);

function nextPlayer(player, players) {
  var i;
  console.log('Me llega un: ', player.position);
  if (player.position === players.length) {
    i = 0;
  } else {
    i = player.position;
  }

  console.log('Devuelvo un: ',i);

  return players[i];
}

function populateDeck() {
  var cards = [];
  const numbs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"];
  const suits = ["diamond", "club", "heart", "spade"];

  numbs.forEach((numb) => {
    suits.forEach((suit) => {
      cards.push({
        name: suit + "_" + numb,
      });
    });
  });

  var ctr = cards.length,
    temp,
    index;
  while (ctr > 0) {
    index = Math.floor(Math.random() * ctr);
    ctr--;
    temp = cards[ctr];
    cards[ctr] = cards[index];
    cards[index] = temp;
  }
  console.log(cards);
  return cards;
}

//Socket.io

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    axios.delete("http://localhost:3977/api/deletePlayer/" + socket.user);
    socket.to(socket.game).emit("playerDisconnectedBroadcast", socket.user);
    console.log("user disconnected");
  });

  socket.on("playerConnection", (player) => {
    socket.user = player._id;
    socket.game = player.game;
    socket.join(socket.game);
    socket.to(socket.game).emit("playerConnectionBroadcast", player);
  });



  socket.on("startGame", (player) => {
    Deck.updateOne({ game: player.game }, { cards: populateDeck() }, function (
      err,
      deckPopulated
    ) {
    Deck.findOne({ game: player.game }, function (err, deck) {
      Player.find({ game: player.game }, function (err, players) {
        if (err) return handleError(err);

        var i = 0;
        players.forEach((playerLoop) => {
          if (playerLoop.dealer === true) {
            
            nextPlayer(playerLoop, players).smallBlind= true;
            nextPlayer(playerLoop, players).bet= 250;
            nextPlayer(nextPlayer(playerLoop, players), players).bigBlind = true;
            nextPlayer(nextPlayer(playerLoop, players), players).bet = 500;
            nextPlayer(nextPlayer(nextPlayer(playerLoop, players), players), players).myTurn = true;
            
          }

          playerLoop.card1 = deck.cards[i].name;
          i++;
          playerLoop.card2 = deck.cards[i].name;
          i++;

          Player.updateOne({ _id: playerLoop._id },  playerLoop , function (
            err
          ) {
            if (playerLoop.position===players.length){
              io.in(player.game).emit("startGameBroadcast", "start");
            }
          });
        });

        for (var j = 0; j < i; j++) {
          deck.cards.shift();
        }

        Deck.findOneAndUpdate(
          { game: player.game },
          { cards: deck.cards },
          function (err, deck) {}
        );
      });
    });
    
  });

    
  });

  socket.on("myTurnIsOver", (player) => {
    socket.to(player.game).emit("startYourTurn", player.position + 1);
  });

  socket.on("iChangedSomething", (player) => {
    socket.to(player.game).emit("checkSomethingChanged");
  });
});

module.exports = http;
