'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var DeckSchema = Schema({
    cards: [{name: String}],
    game: { type: Schema.ObjectId, ref: 'Game'}
})

module.exports = mongoose.model('Deck', DeckSchema);