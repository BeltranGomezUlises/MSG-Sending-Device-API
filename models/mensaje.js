var restful = require("node-restful");
var mongoose = restful.mongoose;
var Schema = mongoose.Schema;
//Schema
var mensajeSchema = new mongoose.Schema({
    mensaje : String,
    tipo : String,
    destino : String,
    envia : String,
    usuarioId: Schema.Types.ObjectId,
    fechaEnviar: { type: Date, default: Date.now() }
});


//imei test = 359297053096938
//return model
module.exports = restful.model("Mensajes", mensajeSchema);
