const mongoose = require('mongoose');

const detalleReporteSchema = new mongoose.Schema({
    tim: Number,
    olpn: String,
    sku: {
        type: String,
        unique: true,
    },
    casePack: {
        type: Number,
        default: 0
    },
    uEnviadas: {
        type: Number,
        default: 0
    },
    uRecibidas: {
        type: Number,
        default: 0
    },
    fechavencimiento: String,
    observacion: String,
    fastRegister: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

module.exports = mongoose.model('DetalleReporte', detalleReporteSchema);
