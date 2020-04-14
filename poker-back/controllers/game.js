'use strict'

var Game = require('../models/game');

function createGame(req,res){
    var game = new Game();

    var params = req.body;

    game.speed = params.speed;
    game.stack = params.stack;
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

function updateGame(req, res){
    
    var update = req.body;
   
    var id = req.params.id;
 
    Game.findByIdAndUpdate(id, update, (err, gameUpdated) => {
         if(err){
             res.status(500).send({message: "Error updating game"});
         }else{
             if(!gameUpdated){
                 res.status(404).send({message: "Game did not update"});
             }else{
                 res.status(200).send({game: gameUpdated});
             }
         }
    });
 
 
 }

module.exports =  {
    createGame,
    updateGame
};