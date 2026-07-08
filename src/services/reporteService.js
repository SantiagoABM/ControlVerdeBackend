const Reporte = require('../models/Reporte.js');

async function insertarReporte(data) {
    const reporte = new Reporte(data);
    return await reporte.save();
}

// async function deleteReporte(tim) {
//     await Reporte.findOneAndUpdate({ tim },{estado:false});
// }
async function deleteReporte(tim) {
    return await Reporte.deleteOne({ tim });
}

async function filtrarReportes({
    tim,
    motivo,
    estado
}) {
    const query = {};

    // Exact match para numéricos
    if (tim) query.tim = { $regex: tim, $options: "i" };
    if (motivo) query.motivo = motivo;
    if (estado !== undefined) query.estado = estado;

    // Si no se envía nada, devolverá todos (cuidado, puedes limitar si quieres)
    const reportes = await Reporte.find(query).lean();
    return reportes;
}


async function buscarReportePorMotivo(motivo) {
    if (!motivo) throw new Error('Motivo requerido');
    const reportes = await Reporte.find(
        { motivo: motivo , estado: true},
        { tim: 1, _id: 0 } 
    );
    return reportes.map(r => r.tim);
}

async function buscarReportePorMotivov2(motivo) {
    if (!motivo) throw new Error('Motivo requerido');
    const reportes = await Reporte.find(
        { motivo: motivo, estado: true},
        { tim: 1, _id: 0 } 
    );
    return reportes.map(r => r.tim);
}

async function marcarReporteParaExpiracion(tim, fecha) {
    return await Reporte.updateOne({ tim }, { $set: { expireAt: fecha, estado: false } });
}

async function buscarReporte(reporte) {
    if (!reporte) throw new Error('Código Tim requerido');
    const report = await Reporte.findOne(
        { tim:  reporte }
    );
    return report;
}

async function buscarReportePorFechas(fechaInicio, fechaFin) {
    if (!fechaInicio || !fechaFin) throw new Error('Fechas de inicio y fin son requeridas');
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);
    const reportes = await Reporte.find({
        fechaReporte: { $gte: inicio, $lte: fin },
        estado: true
    });
    return reportes;
}

module.exports = {
    insertarReporte,
    deleteReporte,
    filtrarReportes,
    buscarReportePorMotivo,
    buscarReporte,
    marcarReporteParaExpiracion
};
