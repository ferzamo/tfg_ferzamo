"use strict";

var Player = require("../models/player");

function createPlayer(req, res) {
  var player = new Player();
  var params = req.body;
 

  player.name = params.name;
  player.game = params.game;
  player.position = params.position;
  player.stack = params.stack;
  player.card1 = params.card1;
  player.card2 = params.card2;

  player.save((err, playerStored) => {
    if (err) {
      res.status(500).send({ message: "Error creating player" });
    } else {
      if (!playerStored) {
        res.status(404).send({ message: "Player did not create" });
      } else {
        res.status(200).send({ player: playerStored });
      }
    }
  });
}

function getPlayer(req, res) {
  var id = req.params.id;

  Player.findById(id, (err, player) => {
    if (err) {
      res.status(500).send({ message: "getplayer failed" });
    } else {
      if (!player) {
        res.status(404).send({ message: "Player doesnt exist" });
      } else {
        res.status(200).send({ player: player });
      }
    }
  });
}

function getPlayers(req, res) {
  var gameId = req.params.gameId;

  if (!gameId) {
    var find = Player.find({});
  } else {
    var find = Player.find({ game: gameId }).sort("position");
  }

  find.exec(function (err, players) {
    if (err) {
      res.status(500).send({ message: "getplayers failed" });
    } else {
      if (!players) {
        res.status(404).send({ message: "Players dont exist" });
      } else {
        res.status(200).send({ players });
      }
    }
  });
}

function updatePlayer(req, res) {
  var update = req.body;

  var id = req.params.id;

  Player.findByIdAndUpdate(id, update, (err, playerUpdated) => {
    if (err) {
      res.status(500).send({ message: "Error updating player" });
    } else {
      if (!playerUpdated) {
        res.status(404).send({ message: "Player did not update" });
      } else {
        res.status(200).send({ player: playerUpdated });
      }
    }
  });
}

function deletePlayer(req, res) {
    var id = req.params.id

    Player.findByIdAndRemove(id, (err, playerRemoved) => {
        if (err) {
            res.status(500).send({ message: "Error deleting player" });
          } else {
            if (!playerRemoved) {
              res.status(404).send({ message: "Player did not remove" });
            } else {
              res.status(200).send({ playerRemoved });
            }
          }
    })
}

module.exports = {
  createPlayer,
  getPlayer,
  getPlayers,
  updatePlayer,
  deletePlayer
};
