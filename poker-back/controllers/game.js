'use strict'

var Game = require('../models/game');
var Player = require('../models/player');

function createGame(req,res){
    var game = new Game();

    var params = req.body;

    game.name = params.name;
    game.pot = 0;
    game.flop1 = null;
    game.flop2 = null;
    game.flop3 = null;
    game.turn = null;
    game.river = null;

    game.save((err, gameStored) => {
        if(err){
            res.status(500).send({message: "Error creating game"});
        }else{
            if(!gameStored){
                res.status(404).send({message: "Game not created"});
            }else{
                res.status(200).send({game: gameStored});
            }
        }
    });
}

module.exports =  {
    createGame
};