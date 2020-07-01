"use strict";

var Deck = require("../models/deck");

function createDeck(req, res) {
  var deck = new Deck();

  var params = req.body;
  deck.game = params._id;

  deck.cards = [];

  deck.save((err, deckStored) => {
    if (err) {
      res.status(500).send({ message: "Error creating deck" });
    } else {
      if (!deckStored) {
        res.status(404).send({ message: "Deck not created" });
      } else {
        res.status(200).send({ deckStored });
      }
    }
  });
}

 function getCard(req, res) {
  var game = req.params.gameId;
  Deck.findOne({ game: game }, (err, deck) => {
    if (err) {
      res.status(500).send({ message: "getCard failed" });
    } else {
      if (!deck) {
        res.status(404).send({ message: "Deck doesnt exist" });
      } else {
        const card = deck.cards[0];
        console.log("Carta: ", card);
        deleteCard(req);
        res.status(200).send({ card });
      }
    }
  });
}

function deleteCard(req, res) {
    var game = req.params.gameId;
  
    Deck.findOneAndUpdate({ game: game },  { "$pop": { cards: -1 } }, (err, deck) => {
      if (err) {
        res.status(500).send({ message: "getCard failed" });
      } else {
        if (!deck) {
          res.status(404).send({ message: "Deck doesnt exist" });
        }
      }
    });
  }

  

  

module.exports = {
  createDeck,
  getCard,
  deleteCard
};
