const mongoose = require('mongoose');

const detalleReporteSchema = new mongoose.Schema({
  // reporteId: {type: mongoose.Schema.ObjectId, ref: 'Reporte'},
  // productoId: {type: mongoose.Schema.ObjectId, ref: 'Producto'},
  tim: Number,
  olpn: String,
  sku: String,
  uEnviadas: Number,
  uRecibidas: Number,
  fechavencimiento: String,
  observacion: { type: String, default: 'PERTENECE' },
  fastRegister: { type: Boolean, default: false },
});

module.exports = mongoose.model('DetalleReporte', detalleReporteSchema);
