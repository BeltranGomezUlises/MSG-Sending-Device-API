//dependencies
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var fs = require("fs");
var config = JSON.parse(fs.readFileSync("config.json"));
//mongo
mongoose.connect(config.db); //conectar con el servidor de base de datos

//express
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); //parseador a JSON

//routes
app.use('/api',require("./routes/api")); //añadir un router, require para importar el router api

//start servers
app.listen(config.api_port);
console.log("API corriendo en puerto " + config.api_port);
