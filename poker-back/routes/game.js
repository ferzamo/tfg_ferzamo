'use strict'

var express = require('express');
var GameController = require('../controllers/game');

var api = express.Router();

api.post('/createGame', GameController.createGame);



module.exports = api;