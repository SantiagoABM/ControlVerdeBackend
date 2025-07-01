const mongoose = require('mongoose');

const detalleReporteSchema = new mongoose.Schema({
  tim: Number,
  olpn: String,
  sku: String,
  uEnviadas: Number,
  uRecibidas: Number,
  fechavencimiento: String,
  observacion: { type: String, default: 'PERTENECE' },
  fastRegister: { type: Boolean, default: false },
  expireAt: { type: Date, default: null }
});

detalleReporteSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('DetalleReporte', detalleReporteSchema);
