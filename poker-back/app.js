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
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
})

//rutas base
app.use('/api', player_routes);
app.use('/api', game_routes);


module.exports = app;