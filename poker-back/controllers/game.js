'use strict'

var Game = require('../models/game');

function createGame(req,res){
    var game = new Game();

    var params = req.body;

    game.speed = params.speed;
    game.stack = params.stack;
    game.pot = params.pot;
    game.flop1 = params.flop1;
    game.flop2 = params.flop2;
    game.flop3 = params.flop3;
    game.turn = params.turn;
    game.river = params.river;
    

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

function getGame(req, res){

    var id = req.params.id;

    Game.findById(id, (err, game) => {
        if(err){
            res.status(500).send({message: "getgame failed"});
        }else{
            if(!game){
                res.status(404).send({message: "Game doesnt exist"});
            }else{
                res.status(200).send({game});
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
    getGame,
    updateGame
};