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
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
},
  {
    timestamps: true
  }
);

detalleReporteSchema.index({ tim: 1 });

module.exports = mongoose.model('DetalleReporte', detalleReporteSchema);
