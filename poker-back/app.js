'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// cargar routes
var player_routes = require('./routes/player');
var game_routes = require('./routes/game');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Configurar cabeceras

//rutas base
app.use('/api', player_routes);
app.use('/api', game_routes);


module.exports = app;