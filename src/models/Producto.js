const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  sku: String,
  ean: String,
  subdpto: String,
  descripcion: String,
  marca: String,
  proveedor: String,
  casePack: Number,
  costoPromedio: Number,
  precioVigente: Number,
  uMedida: String,
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);
