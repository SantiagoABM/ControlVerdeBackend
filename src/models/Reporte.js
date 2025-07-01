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
    expireAt: {
        type: Date,
        default: null
    },
    motivo: String,
}, { timestamps: false });

reporteSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Reporte', reporteSchema);
