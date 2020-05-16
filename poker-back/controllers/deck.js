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

  function populateDeck(req, res) {
    var game = req.params.gameId;
    var cards = [];
    const numbs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king']
    const suits = ['diamond', 'club', 'heart', 'spade']

    numbs.forEach(numb => {
        suits.forEach(suit => {
          cards.push({
            name: suit + '_' + numb
          })
        })
      })

    shuffle(cards);

    console.log("Las cartas: ", cards);
    
  
    Deck.findOneAndUpdate({ game: game }, { cards: cards }, (err, deck) => {
      if (err) {
        res.status(500).send({ message: "getCard failed" });
      } else {
        if (!deck) {
          res.status(404).send({ message: "Deck doesnt exist" });
        } else {
          
          res.status(200).send({ deck });
        }
      }
    });
  }

  function shuffle(array) {
    var ctr = array.length, temp, index;


    while (ctr > 0) {

        index = Math.floor(Math.random() * ctr);

        ctr--;

        temp = array[ctr];
        array[ctr] = array[index];
        array[index] = temp;
    }
    return array;
}

module.exports = {
  createDeck,
  getCard,
  deleteCard,
  populateDeck
};
