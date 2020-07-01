'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = Schema({
    speed: String,
    stack: Number,
    pot: Number,
    highestBet: Number,
    flop1: String,
    flop2: String,
    flop3: String,
    turn: String,
    river: String,
    state: String,
    blind: [{value: Number, time: Date}]
})

module.exports = mongoose.model('Game', GameSchema);