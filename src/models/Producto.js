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
  casePack: { type: Number, default: 1 },
  costoPromedio: { type: Number, default: 0 },
  precioVigente: { type: Number, default: 0 },
  uMedida: { type: String, default: '' },
  isContable:{type: Boolean, default: false},
  detalle: String,
  marcaSensible: {type: Boolean, default: false}
}, {
  timestamps: true
});

productoSchema.index({ sku: 1, ean: 1, subdpto: 1 });

module.exports = mongoose.model('Producto', productoSchema);
