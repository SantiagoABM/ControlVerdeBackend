const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  sku: {
    type: String,
    unique: true,
    required: true,
  },
  ean: { type: String, default: '' },
  subdpto: { type: String, default: '' },
  descripcion: { type: String, default: '' },
  marca: { type: String, default: '' },
  proveedor: { type: String, default: '' },
  casePack: { type: Number, default: 0 },
  costoPromedio: { type: Number, default: 0 },
  precioVigente: { type: Number, default: 0 },
  uMedida: { type: String, default: '' },
}, {
  timestamps: true
});

module.exports = mongoose.model('Producto', productoSchema);
