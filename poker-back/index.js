'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3977;


mongoose.connect('mongodb://localhost:27017/tfg_dataBase', { useNewUrlParser: true }, (err, res) => {
    if (err) {
        throw err;
    } else {
        app.listen(port, function () {
            console.log("Servidor del api rest escuchando en " + port);
        })

    }
})


