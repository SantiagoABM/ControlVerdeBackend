const BitacoraAuditoria = require('../models/Bitacora.js');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

async function obtenerLogs({ tipo, dni, desde, hasta }) {
    const filtros = {};

    if (tipo && tipo != "null") filtros.tipo = tipo;
    if (dni && dni != "null") filtros.dni = dni;

    if (desde && desde != "null" || hasta && hasta != "null") {
        filtros.creadoEn = {};
        if (desde && desde != "null") filtros.creadoEn.$gte = dayjs.tz(desde, 'America/Lima').startOf('day').utc().toDate();
        if (hasta && hasta != "null") filtros.creadoEn.$lte = dayjs.tz(hasta, 'America/Lima').endOf('day').utc().toDate();
    }

    const bitacoras = await BitacoraAuditoria.find(filtros)
        .sort({ creadoEn: -1 }).lean();
    const bitacorasFormateadas = bitacoras.map(bitacora => ({
        ...bitacora,
        creadoEn: dayjs(bitacora.creadoEn).tz('America/Lima').format('YYYY-MM-DD HH:mm:ss')
    }));
    return bitacorasFormateadas;
}

async function limpiarBitacora() {
    const resultado = await BitacoraAuditoria.deleteMany({});

    return resultado.deletedCount;
}

module.exports = {
    obtenerLogs,
    limpiarBitacora
};