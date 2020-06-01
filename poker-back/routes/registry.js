'use strict'

var express = require('express');
var RegistryController = require('../controllers/registry');

var api = express.Router();

api.post('/createRegistry', RegistryController.createRegistry);
api.put('/insertMove/:gameId', RegistryController.insertMove);
api.get('/getMoves/:gameId', RegistryController.getMoves);

module.exports = api;