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

var Hand = require("pokersolver").Hand;

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

//Socket.io

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    Game.findOne({ _id: socket.game }, function (err, game) {
      try {
        if (game.state === "pregame") {
          Player.find({ game: socket.game }, function (err, players) {
            players.forEach((playerLoop) => {
              if (playerLoop.position > socket.user.position) {
                Player.updateOne(
                  { _id: playerLoop._id },
                  { position: playerLoop.position - 1 },
                  function (err) {}
                );
              }
              if(playerLoop.position === 2) {
                Player.updateOne(
                  { _id: playerLoop._id },
                  { dealer: true },
                  function (err) {}
                );
              }
            });

            Player.deleteOne({ _id: socket.user._id }, function (err) {
              if (err) return handleError(err);

              socket
                .to(socket.game)
                .emit("playerDisconnectedBroadcast", socket.user);
            });
          });
        }
      } catch (e) {
        console.log("Entra catch");
      }
    });

    console.log("user disconnected");
  });

  socket.on("playerConnection", (player) => {
    socket.user = player;
    socket.game = player.game;
    socket.join(socket.game);
    socket.to(socket.game).emit("playerConnectionBroadcast", player);
  });

  socket.on("startGame", (player) => {
    io.in(player.game).emit("startGameBroadcast", "start");
    newHand(player);
  });

  socket.on("sendInfo", (data) => {
    io.in(data.player.game).emit("getInfo", data.text);
  });

  socket.on("myTurnIsOver", (player) => {
    Player.find({ game: player.game }, function (err, players) {
      Game.findOne({ _id: player.game }, function (err, game) {
        var nextRound = true;
        var playersPlaying = 0;
        var playersAllIn = 0;
        var allIn = false;
        players.forEach((playerLoop) => {
          if (
            playerLoop.playing &&
            playerLoop.bet !== game.highestBet &&
            !playerLoop.allIn
          ) {
            nextRound = false;
          } else if (
            playerLoop.bigBlind &&
            playerLoop.bet <= game.blind[0].value &&
            (player.smallBlind ||
              nextPlayerPlaying(player, players)._id == playerLoop._id) &&
            game.state === "preflop" &&
            !playerLoop.allIn
          ) {
            //Ciega grande primera ronda

            nextRound = false;
          } else if (
            playerLoop.playing &&
            playerLoop.bet === null &&
            !playerLoop.allIn
          ) {
            //Para ronda con 0 apuestas
            nextRound = false;
          }
          if (playerLoop.playing) {
            playersPlaying++;
          }

          if (playerLoop.allIn) {
            playersAllIn++;
          }
        });

        if (playersPlaying === 1) {
          nextRound = true;
          game.state = "river";
        }

        if (playersPlaying === playersAllIn ) {
          allIn = true;
          nextRound = true;
        } else {
          allIn = false;
        }

        if (nextRound) {
          if (playersPlaying - 1 === playersAllIn) allIn = true;
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

                if (!allIn) {
                  newRound(players, game, deck);
                  break;
                }

              case "flop":
                game.state = "turn";

                game.turn = deck.cards[0].name;
                deck.cards.shift();
                if (!allIn) {
                  newRound(players, game, deck);
                  break;
                }

              case "turn":
                game.state = "river";

                game.river = deck.cards[0].name;
                deck.cards.shift();
                if (!allIn) {
                  newRound(players, game, deck);
                  break;
                } else {
                  io.in(player.game).emit("startYourTurn");
                }

              case "river":
                if (playersPlaying !== 1) {
                  showdown(players, game);

                  var playersHands = [];
                  var playersStill = [];

                  players.forEach((player) => {
                    if (player.playing === true) {
                      var playerHand = [
                        translateCard(player.card1),
                        translateCard(player.card2),
                        translateCard(game.flop1),
                        translateCard(game.flop2),
                        translateCard(game.flop3),
                        translateCard(game.turn),
                        translateCard(game.river),
                      ];

                      playersHands.push(playerHand);

                      playersStill.push(player);
                    }
                  });

                  const hands = [];
                  for (let i = 0; i < playersHands.length; i += 1) {
                    const c = playersHands[i];
                    const h = Hand.solve(c);

                    h.playerId = playersHands.indexOf(c); // AssignIdentifier
                    hands.push(h);
                  }

                  const handWinners = Hand.winners(hands);

                  for (var i = 0; i < handWinners.length; i++) {
                    io.in(game._id).emit(
                      "getInfo",
                      playersStill[handWinners[i].playerId].name +
                        " wins with " +
                        handWinners[i].descr
                    );
                    var winnerId = playersStill[handWinners[i].playerId]._id;

                    var newStack =
                      playersStill[handWinners[i].playerId].stack +
                      game.pot / handWinners.length;


                    Player.updateOne(
                      { _id: winnerId },
                      { stack: newStack },
                      function (err) {}
                    );
                  }
                } else {
                  var winnerId = nextPlayerPlaying(player, players)._id;

                  io.in(game._id).emit(
                    "getInfo",
                    nextPlayerPlaying(player, players).name + " wins"
                  );
                  var newStack =
                    nextPlayerPlaying(player, players).stack + game.pot;

                  Player.updateOne(
                    { _id: winnerId },
                    { stack: newStack },
                    function (err) {
                    }
                  );
                }

                Game.updateOne({ _id: game._id }, { pot: 0 }, function (
                  err
                ) {});

                setTimeout(function () {
                  newHand(player);
                }, 10000);

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

function showdown(players, game) {
  players.forEach((player) => {
    player.bet = null;
    Player.updateOne({ _id: player._id }, player, function (err) {});
  });

  game.highestBet = 0;
  Game.updateOne({ _id: game._id }, game, function (err) {
    io.in(game._id).emit("showdown");
  });
}

function newHand(player) {
  io.in(player.game).emit("getInfo", "\n");
  io.in(player.game).emit("getInfo", "\n");
  io.in(player.game).emit("getInfo", "------- NEW ROUND -------");

  Deck.updateOne({ game: player.game }, { cards: populateDeck() }, function (
    err,
    deckPopulated
  ) {
    Game.findOne({ _id: player.game }, function (err, game) {
      Deck.findOne({ game: player.game }, function (err, deck) {
        Player.find({ game: player.game }, function (err, players) {
          game.blind = updateBlind(game.blind);

          game.pot = game.blind[0].value + game.blind[0].value / 2;
          game.highestBet = game.blind[0].value;
          game.state = "preflop";
          game.flop1 = null;
          game.flop2 = null;
          game.flop3 = null;
          game.turn = null;
          game.river = null;

          Game.updateOne({ _id: game._id }, game, function (err) {});

          var i = 0;
          var dealer;
          var playersPlaying = 0;
          var lastPlayerPlaying;
          players.forEach((playerLoop) => {
            if (playerLoop.bigBlind) {
              playerLoop.bigBlind = false;
            }
            if (playerLoop.smallBlind) {
              playerLoop.smallBlind = false;
            }
            if (playerLoop.stack > 0) {
              playerLoop.playing = true;
            } else {
              playerLoop.playing = false;
            }
            if (playerLoop.dealer === true) {
              playerLoop.dealer = false;
              dealer = playerLoop;
            }

            playerLoop.allIn = false;
            playerLoop.bet = null;
            if (playerLoop.playing){
 
              playersPlaying++;
              lastPlayerPlaying = playerLoop;
            } 
          });

          if (playersPlaying === 1) {
            io.in(player.game).emit("getInfo", "***********");
            io.in(player.game).emit("getInfo", "***********");
            io.in(player.game).emit("getInfo", "¡¡ " + lastPlayerPlaying.name + " won the game !!");
            io.in(player.game).emit("getInfo", "***********");
            io.in(player.game).emit("getInfo", "***********");
            deleteEverything(player.game);
          } else {
            nextPlayerPlaying(dealer, players).dealer = true;

            var small;
            var big;

            players.forEach((playerLoop) => {
              if (playerLoop.dealer === true) {
                small = nextPlayerPlaying(playerLoop, players);
                small.smallBlind = true;
                if (small.stack < game.blind[0].value / 2) {
                  small.bet = small.stack;
                  small.stack = 0;
                  small.allIn = true;
                } else {
                  small.bet = game.blind[0].value / 2;
                  small.stack = small.stack - game.blind[0].value / 2;
                }

                big = nextPlayerPlaying(small, players);
                big.bigBlind = true;
                if (big.stack < game.blind[0].value) {
                  big.bet = big.stack;
                  big.stack = 0;
                  big.allIn = true;
                } else {
                  big.bet = game.blind[0].value;
                  big.stack = big.stack - game.blind[0].value;
                }
                nextPlayerPlaying(big, players).myTurn = true;
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
          }
        });
      });
    });
  });
}

function newRound(players, game, deck) {
  players.forEach((player) => {
    if (player.smallBlind) {
      if (player.playing && !player.allIn) {
        player.myTurn = true;
      } else {
        nextPlayerPlaying(player, players).myTurn = true;
      }
    }

    player.bet = null;
  });
  players.forEach((player) => {
    Player.updateOne({ _id: player._id }, player, function (err) {});
  });

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
  while (!next.playing || next.allIn) {
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

function translateCard(cardName) {
  var suit = cardName.split("_")[0].substring(0, 1);
  var number = cardName.split("_")[1];

  if (number === "1") number = "A";
  if (number === "10") number = "T";
  if (number === "jack") number = "J";
  if (number === "queen") number = "Q";
  if (number === "king") number = "K";

  return number + suit;
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

function updateBlind(blinds) {
  var date = new Date();
  var i = 0;

  while (blinds[i].time < date) {
    if (blinds[i + 1].time < date) {
      blinds.shift();
    }

    i++;
  }

  return blinds;
}

function deleteEverything(game) {

  Game.deleteOne({ _id: game }, function (err) {
    Deck.deleteOne({ game: game }, function (err) {
      Player.deleteMany({ game: game }, function (err) {
      });
    });
  });

}

module.exports = http;
