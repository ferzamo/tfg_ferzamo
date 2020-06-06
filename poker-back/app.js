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
    io.in(player.game).emit("startGameBroadcast", "start");
    newHand(player);
  });

  socket.on("myTurnIsOver", (player) => {
    Player.find({ game: player.game }, function (err, players) {
      Game.findOne({ _id: player.game }, function (err, game) {
        var nextRound = true;
        var playersPlaying = 0;
        players.forEach((playerLoop) => {
          if (playerLoop.playing && playerLoop.bet !== game.highestBet) {
            nextRound = false;
          } else if (
            playerLoop.bigBlind &&
            player.smallBlind &&
            game.state === "preflop"
          ) {
            //Ciega grande primera ronda
            nextRound = false;
          } else if (playerLoop.playing && playerLoop.bet === null) {
            //Para ronda con 0 apuestas
            nextRound = false;
          }

          if(playerLoop.playing){
            playersPlaying++;
          }
        });

        if(playersPlaying===1){
          nextRound = true;
          game.state = 'river';
        }

        if (nextRound) {
          Deck.findOne({ game: player.game }, function (err, deck) {
            switch (game.state) {
              case "preflop":
                game.state = "flop";

                game.flop1 = deck.cards[0].name;
                game.flop2 = deck.cards[1].name;
                game.flop3 = deck.cards[2].name;

                for (var i = 0; i < 3; i++) {
                  deck.cards.shift();
                }
                newRound(players, game, deck);

                break;
              case "flop":
                game.state = "turn";

                game.turn = deck.cards[0].name;
                deck.cards.shift();
                newRound(players, game, deck);
                break;

              case "turn":
                game.state = "river";

                game.river = deck.cards[0].name;
                deck.cards.shift();
                newRound(players, game, deck);
                break;
              case "river":
                
              newHand(player);

                break;
              default:
              // code block
            }
          });
        } else {
          var next = nextPlayerPlaying(player, players);

          next.myTurn = true;

          Player.updateOne({ _id: next._id }, next, function (err) {
            io.in(player.game).emit("startYourTurn");
          });
        }
      });
    });
  });
});

function newHand(player) {
  console.log("New hand");
  Deck.updateOne({ game: player.game }, { cards: populateDeck() }, function (
    err,
    deckPopulated
  ) {
    Game.findOne({ _id: player.game }, function (err, game) {
      Deck.findOne({ game: player.game }, function (err, deck) {
        Player.find({ game: player.game }, function (err, players) {

          game.pot = 0;
          game.highestBet = 500;
          game.state = "preflop";
          game.flop1 = null;
          game.flop2 = null;
          game.flop3 = null;
          game.turn = null;
          game.river = null;

          Game.updateOne({ _id: game._id }, game, function (err) {});

          var i = 0;
          var dealer;
          players.forEach((playerLoop) => {
            if (player.bigBlind) {
              playerLoop.bigBlind = false;
            }
            if (player.smallBlind) {
              playerLoop.smallBlind = false;
            }
            if (playerLoop.stack > 0) {
              playerLoop.playing = true;
            }
            if (playerLoop.dealer === true) {
              playerLoop.dealer = false;
              dealer = playerLoop;
            }

            playerLoop.bet = null;
          });

          nextPlayerPlaying(dealer, players).dealer = true;

          players.forEach((playerLoop) => {
            if (playerLoop.dealer === true) {
              nextPlayerPlaying(playerLoop, players).smallBlind = true;
              nextPlayerPlaying(playerLoop, players).bet = 250;
              nextPlayerPlaying(playerLoop, players).stack =
                nextPlayerPlaying(playerLoop, players).stack - 250;
              nextPlayerPlaying(
                nextPlayerPlaying(playerLoop, players),
                players
              ).bigBlind = true;
              nextPlayerPlaying(
                nextPlayerPlaying(playerLoop, players),
                players
              ).bet = 500;
              nextPlayerPlaying(
                nextPlayerPlaying(playerLoop, players),
                players
              ).stack =
                nextPlayerPlaying(
                  nextPlayerPlaying(playerLoop, players),
                  players
                ).stack - 500;
              nextPlayerPlaying(
                nextPlayerPlaying(
                  nextPlayerPlaying(playerLoop, players),
                  players
                ),
                players
              ).myTurn = true;
            }

            playerLoop.card1 = deck.cards[i].name;
            i++;
            playerLoop.card2 = deck.cards[i].name;
            i++;
          });

          players.forEach((playerLoop) => {
            Player.updateOne({ _id: playerLoop._id }, playerLoop, function (
              err
            ) {
              if (playerLoop.position === players.length) {
                io.in(player.game).emit("startYourTurn");
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
}

function newRound(players, game, deck) {
  var newPot = game.pot;
  var starter;
  players.forEach((player) => {
    if (player.smallBlind) {
      if (player.playing) {
        player.myTurn = true;
      } else {
        nextPlayerPlaying(player, players).myTurn = true;
      }
    }
    newPot = newPot + player.bet;
    player.bet = null;
    Player.updateOne({ _id: player._id }, player, function (err) {});
  });
  game.pot = newPot;
  game.highestBet = 0;
  Game.updateOne({ _id: game._id }, game, function (err) {
    Deck.findOneAndUpdate({ game: game._id }, { cards: deck.cards }, function (
      err,
      deck
    ) {
      io.in(game._id).emit("startYourTurn");
    });
  });
}

function nextPlayerPlaying(player, players) {
  var next = nextPlayer(player, players);
  while (!next.playing) {
    next = nextPlayer(next, players);
  }

  return next;
}

function nextPlayer(player, players) {
  var i;
  if (player.position === players.length) {
    i = 0;
  } else {
    i = player.position;
  }
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

  return cards;
}

module.exports = http;
