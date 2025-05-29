const mongoose = require('mongoose');

const reporteSchema = new mongoose.Schema({
    tim: {
        type: Number,
        required: true,
        unique: true,
    },
    placa: String,
    origen: String,
    destino: String,
    fechaEnvio: String,
    estado: {
        type: Boolean,
        default: true
    },
    motivo: String,
}, { timestamps: false });

module.exports = mongoose.model('Reporte', reporteSchema);
