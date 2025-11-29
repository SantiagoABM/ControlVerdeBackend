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

async function buscarReportePorMotivo(motivo) {
    if (!motivo) throw new Error('Motivo requerido');
    const reportes = await Reporte.find(
        { motivo: motivo, estado: true },
        { tim: 1, _id: 0 }
    );
    return reportes.map(r => r.tim);
}

async function buscarReportesAvanzado(filtros) {
    const {
        motivo,
        estado,
        fechaInicio,
        fechaFin,
        createdInicio,
        createdFin,
        tim,
        placa,
        origen,
        destino
    } = filtros;

    // 🚩 Validaciones de filtros obligatorios
    if (!motivo) throw new Error("Motivo requerido");
    if (estado === undefined) throw new Error("Estado requerido");

    // 🧱 Construcción dinámica del query
    const query = {
        motivo,
        estado
    };

    // 📅 Filtro: Fecha (fechaEnvio)
    if (fechaInicio || fechaFin) {
        query.fechaEnvio = {};
        if (fechaInicio) query.fechaEnvio.$gte = fechaInicio;
        if (fechaFin) query.fechaEnvio.$lte = fechaFin;
    }

    // 🕒 Filtro: createdAt
    if (createdInicio || createdFin) {
        query.createdAt = {};
        if (createdInicio) query.createdAt.$gte = createdInicio;
        if (createdFin) query.createdAt.$lte = createdFin;
    }

    // 🔍 Filtros opcionales con regex
    if (tim) {
        query.tim = { $regex: tim, $options: "i" };
    }

    if (placa) {
        query.placa = { $regex: placa, $options: "i" };
    }

    if (origen) {
        query.origen = { $regex: origen, $options: "i" };
    }

    if (destino) {
        query.destino = { $regex: destino, $options: "i" };
    }

    // 📌 Realizar la búsqueda
    const reportes = await Reporte.find(query).select({
        _id: 1,
        tim: 1,
        placa: 1,
        origen: 1,
        destino: 1,
        fechaEnvio: 1,
        estado: 1,
        motivo: 1,
        createdAt: 1
    });

    return reportes;
}


async function marcarReporteParaExpiracion(tim, fecha) {
    return await Reporte.updateOne({ tim }, { $set: { expireAt: fecha, estado: false } });
}

async function buscarReporte(reporte) {
    if (!reporte) throw new Error('Código Tim requerido');
    const report = await Reporte.findOne(
        { tim: reporte }
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
    buscarReportePorMotivo,
    buscarReporte,
    marcarReporteParaExpiracion
};
