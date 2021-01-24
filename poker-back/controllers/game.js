'use strict'

var Game = require('../models/game');

function createGame(req,res){
   
    var game = new Game();

    var params = req.body;

    game.speed = params.speed;
    game.stack = params.stack;
    game.pot = params.pot;
    game.highestBet = params.highestBet;
    game.flop1 = params.flop1;
    game.flop2 = params.flop2;
    game.flop3 = params.flop3;
    game.turn = params.turn;
    game.river = params.river;
    game.state = params.state;
    
    

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

 function createBlindTable(req,res){
   
    var game = req.body;
    var id = req.params.id;
   

    game.blind = populateBlindTable(game);

    Game.findByIdAndUpdate(id, game, (err, gameUpdated) => {
        if(err){
            res.status(500).send({message: "Error creating blind table"});
        }else{
            if(!gameUpdated){
                res.status(404).send({message: "Table wasnt created"});
            }else{
                res.status(200).send({game: gameUpdated});
            }
        }
   });
    
}

 function populateBlindTable(game){
    var table = [];

    var date = new Date();
    var dateIncreaser;

    var blind = game.stack/100;
    var blindIncreaser = game.stack/200;

    var counter = 0;


    switch(game.speed){
        case 'Normal':
            dateIncreaser = 15;
        break;
        
        case 'Turbo':
            dateIncreaser = 10;
        break;

        case 'HyperTurbo':
            dateIncreaser = 5;
        break;
    }

    while (blind < game.stack*9){

        if(counter === 3){
            counter = 0;
            blindIncreaser = blindIncreaser * 2;
        }

        if (table.length !== 0){
            date = addMinutes(date, dateIncreaser);
            blind += blindIncreaser;
        }

        counter++;

        table.push({
            value: blind,
            time: date,
        })

    }

    return table;
 }

 function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

module.exports =  {
    createGame,
    getGame,
    updateGame,
    createBlindTable
};