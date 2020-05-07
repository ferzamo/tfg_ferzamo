'use strict'

var express = require('express');
var DeckController = require('../controllers/deck');

var api = express.Router();

api.post('/createDeck', DeckController.createDeck);
api.get('/getCard/:gameId', DeckController.getCard);
api.put('/deleteCard/:gameId', DeckController.deleteCard);
api.put('/populateDeck/:gameId', DeckController.populateDeck);
module.exports = api;