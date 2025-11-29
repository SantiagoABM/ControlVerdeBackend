const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  dni: { type: String, required: true, unique: true },
  telefono: { type: Number},
  tienda: { type: Number, required: true },
  correo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  password: { type: String, required: true },
  rol: { type: String, required: true, default: 'operador' },
  esAdmin: { type: Boolean, default: false },
  activo: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);