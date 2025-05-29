const Reporte = require('../models/Reporte.js');

async function insertarReporte(data) {
    const reporte = new Reporte(data);
    return await reporte.save();
}

async function buscarReportePorMotivo(motivo) {
    if (!motivo) throw new Error('Motivo requerido');
    const reportes = await Reporte.find(
        { motivo: { $regex: motivo, $options: 'i' } },
        { tim: 1, _id: 0 } // Solo devuelve el campo `tim`
    );
    return reportes.map(r => r.tim);
}

module.exports = {
    insertarReporte,
    buscarReportePorMotivo
};
