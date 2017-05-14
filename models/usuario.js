//dependencies
var restful = require("node-restful");
var mongoose = restful.mongoose;
var Schema = mongoose.Schema;

//schema
var usuarioSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  activo: Boolean,
  dispositivos: [Schema.Types.Mixed],
  tipo: String,
  correo: String,
  contra: String
});

//return model
module.exports = restful.model("Usuarios", usuarioSchema);
