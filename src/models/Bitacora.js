const mongoose = require('mongoose');

const BitacoraAuditoriaSchema = new mongoose.Schema({
  dni: {
    type: String,
    required: false
  },

  tipo: {
    type: String,
    required: true,
    enum: [
      'AUTH',
      'PRODUCTOS',
      'REPORTES',
      'USUARIOS'
    ]
  },
  mensaje: {
    type: String,
    required: true
    // Ej: "Usuario ejecutó carga de Excel de recepción"
  },

  creadoEn: {
    type: Date,
    default: Date.now,
    index: true
  }
});

BitacoraAuditoriaSchema.index(
  { creadoEn: 1 }
);

module.exports = mongoose.model('BitacoraAuditoria', BitacoraAuditoriaSchema);
