'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlayerSchema = Schema({
    name: String,
    game: { type: Schema.ObjectId, ref: 'Game'},
    position: Number,
    stack: Number,
    card1: String,
    card2: String,
    playing: Boolean
    
})

module.exports = mongoose.model('Player', PlayerSchema);