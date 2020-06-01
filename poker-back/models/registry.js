'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var RegistrySchema = Schema({
    moves: [{playerId: String,
            bet: Number}],
    game: { type: Schema.ObjectId, ref: 'Game'}
})

module.exports = mongoose.model('Registry', RegistrySchema);