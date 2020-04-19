'use strict'

var express = require('express');
var GameController = require('../controllers/game');

var api = express.Router();

api.post('/createGame', GameController.createGame);
api.get('/getGame/:id', GameController.getGame);
api.put('/updateGame/:id', GameController.updateGame);



module.exports = api;