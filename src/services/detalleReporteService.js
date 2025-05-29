const DetalleReporte = require('../models/DetalleReporte.js');

async function insertarDetalleReporte(data) {
    const detalleReporte = new DetalleReporte(data);
    return await detalleReporte.save();
}

async function insertarDetalleReporteEnLote(detalleReportes) {
    return await DetalleReporte.insertMany(detalleReportes , { ordered: false });
}


module.exports = {
    insertarDetalleReporte,
    insertarDetalleReporteEnLote
};
