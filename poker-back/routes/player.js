'use strict'

var express = require('express');
var PlayerController = require('../controllers/player');

var api = express.Router();

api.post('/createPlayer', PlayerController.createPlayer);
api.put('/updatePlayer/:id', PlayerController.updatePlayer);


module.exports = api;