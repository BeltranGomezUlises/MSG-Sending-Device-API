var jwt = require('jwt-simple');
var moment = require('moment');
var fs = require("fs");
var config = JSON.parse(fs.readFileSync("config.json"));

var utils = require("./utils.js");

exports.ensureAuthenticated = function(req, res, next) {
  if(!req.headers.authorization) {
    return res
      .status(202)
      .send(utils.response(false, "Tu petición no tiene cabecera de autorización", null));
  }
  var token = req.headers.authorization;
  try{
      var payload = jwt.decode(token, config.tokenKey);      
      req.data = payload.sub;
      next();
  }catch(err){
    return res
        .status(202)
        .send(utils.response(false, "El token expiró", null));
  }
}
