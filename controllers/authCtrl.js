var jwt = require('jwt-simple');
var moment = require('moment');
var fs = require("fs");
var config = JSON.parse(fs.readFileSync("config.json"));
var Usuario = require("../models/usuario");

var utils = require("./utils.js");

var createToken = function(data) {
  var payload = {
    sub: data,
    iat: moment().unix(),
    exp: moment().add(7, "days").unix(), //minutes, hours, week
  };
  var token = jwt.encode(payload, config.tokenKey);
  //console.log("token: \n",token);
  //console.log("decoded: \n", jwt.decode(token, config.tokenKey));
  return token;
};


exports.emailLogin = function(req, res) {
  Usuario.find({correo: req.body.correo}).exec(function(err, usuario){
    if(err) throw err;
    if(usuario.length > 0){
      if (usuario[0].contra === req.body.contra) {
        return res
        .status(200)
        .send(utils.response(true, "datos en token", createToken(usuario)));
      }else{
        return res
        .status(202)
        .send(utils.response(false, "contraseña invalida", null));
      }
    }else{
      console.log("usuario no encontrado");
      return res
      .status(202)
      .send(utils.response(false, "usuario invalido",null));
    }
  });
};
