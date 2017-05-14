//dependencies
var express = require("express");
var router = express.Router();
var moment = require('moment');
//JWT
var authCtrl = require("../controllers/authCtrl.js");
var middleware = require("../controllers/middleware.js");
var utils = require("../controllers/utils.js");

var Mensaje = require("../models/mensaje");
var Usuario = require("../models/usuario");
var Enviado = require("../models/enviado");
var Errado = require("../models/errado");

var enviado = function(req, res){
  Mensaje.findById(req.body._id, function(err, mensaje) {
    if (err) throw err;
    var mensajeRes = "Operación exitosa";
    var estadoRes = true;

    if (mensaje != null) {
      switch(req.body.estado) {
      case 1:
        //guardar en eviados
          var enviado = new Enviado({
            mensaje: mensaje.mensaje,
            tipo: mensaje.tipo,
            destino: mensaje.destino,
            envia: mensaje.envia,
            usuarioId: mensaje.usuarioId,
            fechaEnvio: new Date()
          });
          enviado.save();
        //borrar de mensajes
          Mensaje.findByIdAndRemove(req.body._id, function(err) {
            if (err) throw err;
          });
          break;
      case 2:
        //guardar en errados
          var errado = new Errado({
            mensaje: mensaje.mensaje,
            tipo: mensaje.tipo,
            destino: mensaje.destino,
            envia: mensaje.envia,
            usuarioId: mensaje.usuarioId,
            fechaEnvio: new Date(),
            error: req.body.error
          });
          errado.save();
        //borrar de mensajes
          Mensaje.findByIdAndRemove(req.body._id, function(err){
            if (err) throw err;
          });
          break;
      default:
          mensajeRes = "estado desconocido, no se realizó acción";
          estadoRes = false;
      }
    }else{
        mensajeRes = "no existe el mensaje en BD";
        estadoRes = false;
    }
    res.send(utils.response(estadoRes, mensajeRes, mensaje));
  });
}

var getDeviceSMS = function(req, res){  

  //validar usuario activo
  Usuario.findById(req.params.usuarioId, function(err, usuario){

    if (usuario) {
      if (usuario.activo) {
        Mensaje.find({
          envia: req.params.imei,
          usuarioId: req.params.usuarioId,
          fechaEnviar: {$lte : new Date() }
        }).limit(parseInt(req.params.numMensajes)).exec(function(err, mensajes){
          if (err) throw err;
          res.send(utils.response(true, "mensajes por enviar", mensajes));
        });
      }else{
        res.send(utils.response(false, "usuario no activo", null));
      }
    }else{
      res.send(utils.response(false, "usuario invalido", null));
    }
  });
};

var postMensaje = function(req, res){
    //validar el usuario activo
    Usuario.findById(req.body.usuario._id, function(err, usuario){
      if (err) throw err;

      if (usuario.activo) {
          //guardar mensaje
          var sms = new Mensaje(req.body.mensaje);
          sms.save(function(err, mensaje){
            if (err) throw err;
            res.send(utils.response(true, "Operacion exitosa", mensaje));
          });
      }else{
        //notificar de usuario no activo
        res.send(utils.response(false, "usuario no activo temporalmente", null));
      }
    });
}

var postMensajeList = function(req, res){
  var sendResult = function(error){
    if (!error) {
      res.send(utils.response(true, "exitoso", null));
    }else{
      res.send(utils.response(false, "Algunos mensajes no pudieron darse de alta", null));
    }
  };

  var error = false;
  var contador = 0;

  for (var i = 0; i < req.body.length; i++) {
    saveMensaje(req.body[i], function(activo){
      if (!activo) {
        error = true;
      }
      contador += 1;
      if (contador === req.body.length) {
        sendResult(error);
      }
    });
  }
};

var saveMensaje = function(mensaje, callback){
  //validar el usuario activo
  Usuario.findById(mensaje.usuarioId, function(err, usuario){
    if (err) throw err;
    if (usuario.activo){
        //guardar mensaje
        var sms = new Mensaje(mensaje);
        sms.save();
        callback(true);
    }else{
      //notificar de usuario no activo
      callback(false);
    }
  });
}

var mensajesPorEnviar = function(req, res){
  Mensaje.find({
    usuarioId:req.params.usuarioId
  }).exec(function(err, mensajes){
    if(err) throw err;
    res.send(mensajes);
  });
}

var mensajesEnviados = function(req, res){
  Enviado.find({
    usuarioId:req.params.usuarioId
  }).exec(function(err, mensajes){
    if(err) throw err;
    res.send(mensajes);
  });
}

var mensajesErrados = function(req, res){
  Errado.find({
    usuarioId:req.params.usuarioId
  }).exec(function(err, mensajes){
    if(err) throw err;
    res.send(mensajes);
  });
}

//*********desarrollo*************
Mensaje.methods(["get","post","delete"]); //crud de mensajes
Mensaje.register(router, "/mensajes");

Enviado.methods(["get","post","delete"]); //crud de mensajes enviados
Enviado.register(router, "/enviados");

Errado.methods(["get","post","delete"]); //crud de mensaje no enviados por error
Errado.register(router, "/errados");

//*********servicios de cliente web*************
//mensajes por enviar
router.get("/mensajesPorEnviar/:usuarioId", mensajesPorEnviar);
router.get("/mensajesEnviados/:usuarioId", mensajesEnviados);
router.get("/mensajesErrados/:usuarioId", mensajesErrados);

//alta de una listade de mensajes
router.post("/mensajeslista", postMensajeList);

//*********servicios de móvil*************
router.post("/enviado", enviado); //registrar el mensaje enviado
router.get("/mensajes/:usuarioId/:imei/:numMensajes", middleware.ensureAuthenticated, getDeviceSMS); //obtener los mensajes a enviar

//*********servicio de administrador web*************
Usuario.methods(["get", "post", "put", "delete"]); //crud de los usuarios
Usuario.register(router, "/usuarios");

//************servicios compartidos ****************
router.post('/login', authCtrl.emailLogin);


//export router
module.exports = router;
