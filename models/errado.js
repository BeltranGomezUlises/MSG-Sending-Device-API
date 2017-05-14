var restful = require("node-restful");
var mongoose = restful.mongoose;
var Schema = mongoose.Schema;
//Schema
var erradoSchema = new mongoose.Schema({
    mensaje : String,
    tipo : String,
    destino : String,
    envia : String,
    error: String,
    usuarioId: Schema.Types.ObjectId
});

//return model
module.exports = restful.model("Errados", erradoSchema);
