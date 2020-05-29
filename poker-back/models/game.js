'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = Schema({
    speed: String,
    stack: Number,
    pot: Number,
    flop1: String,
    flop2: String,
    flop3: String,
    turn: String,
    river: String
})

module.exports = mongoose.model('Game', GameSchema);