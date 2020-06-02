"use strict";

var Registry = require("../models/registry");

function createRegistry(req, res) {
  var registry = new Registry();
  var params = req.body;
  registry.game = params._id;

  registry.moves = [];

  registry.save((err, registryStored) => {
    if (err) {
      res.status(500).send({ message: "Error creating registry" });
    } else {
      if (!registryStored) {
        res.status(404).send({ message: "Registry not created" });
      } else {
        res.status(200).send({ registryStored });
      }
    }
  });
}

function insertMove(req, res){
    var game = req.params.gameId;
   
    var params = req.body;
   
    var move = {playerId: params.playerId, bet: params.bet};

    Registry.findOneAndUpdate({ game: game },  { $push: { moves: move } }, (err, registry) => {
      if (err) {
        res.status(500).send({ message: "insertMove failed" });
      } else {
        if (!registry) {
          res.status(404).send({ message: "Registry doesnt exist" });
        } else {
          res.status(200).send({ move });
        }
      }
    });

    
}

 function getMoves(req, res) {
  var game = req.params.gameId;
  Registry.findOne({ game: game }, (err, registry) => {
    if (err) {
      res.status(500).send({ message: "getLastMove failed" });
    } else {
      if (!registry) {
        res.status(404).send({ message: "No moves" });
      } else {
        
        const moves = registry.moves
        res.status(200).send({ moves });
      }
    }
  });
}



  
   
 

module.exports = {
    createRegistry,
    insertMove,
    getMoves
};