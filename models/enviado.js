var restful = require("node-restful");
var mongoose = restful.mongoose;
var Schema = mongoose.Schema;
//Schema
var enviadoSchema = new mongoose.Schema({
    mensaje : String,
    tipo : String,
    destino : String,
    envia : String,
    usuarioId: Schema.Types.ObjectId,
    fechaEnvio : { type: Date, default: null }
});

//return model
module.exports = restful.model("Enviados", enviadoSchema);
