const BitacoraAuditoria = require('../models/Bitacora');

const crearBitacoraAuditoria = async ({ dni, tipo, mensaje }) => {
  try {

    await BitacoraAuditoria.create({
      tipo,
      mensaje,
      dni
    });
  } catch (error) {
    // ⚠️ Nunca debe romper la ejecución principal
    console.error('[BITACORA]', error.message);
  }
};

module.exports = crearBitacoraAuditoria;
