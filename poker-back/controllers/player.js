'use strict'

var Player = require('../models/player');

function createPlayer (req, res){

    var player = new Player();
    var params = req.body;

    player.name = params.name;
    player.game = params.game;
    player.position = params.position;
    player.stack = params.stack;
    player.card1= null;
    player.card2= null;

    player.save((err, playerStored) => {
        if(err){
            res.status(500).send({message: "Error creating player"});
        }else{
            if(!playerStored){
                res.status(404).send({message: "Player did not create"});
            }else{
                res.status(200).send({player: playerStored});
            }
        }
    });

 
}

function updatePlayer(req, res){
    
   var update = req.body;
  
   var id = req.params.id;

   Player.findByIdAndUpdate(id, update, (err, playerUpdated) => {
        if(err){
            res.status(500).send({message: "Error updating player"});
        }else{
            if(!playerUpdated){
                res.status(404).send({message: "Player did not update"});
            }else{
                res.status(200).send({player: playerUpdated});
            }
        }
   });


}

module.exports =  {
    createPlayer,
    updatePlayer
};