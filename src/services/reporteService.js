const Reporte = require('../models/Reporte.js');

async function insertarReporte(data) {
    const reporte = new Reporte(data);
    return await reporte.save();
}

async function buscarReportePorMotivo(motivo) {
    if (!motivo) throw new Error('Motivo requerido');
    const reportes = await Reporte.find(
        { motivo: motivo },
        { tim: 1, _id: 0 } 
    );
    return reportes.map(r => r.tim);
}

async function buscarReporte(reporte) {
    if (!reporte) throw new Error('Código Tim requerido');
    const report = await Reporte.findOne(
        { tim:  reporte }
    );
    return report;
}

module.exports = {
    insertarReporte,
    buscarReportePorMotivo,
    buscarReporte
};
