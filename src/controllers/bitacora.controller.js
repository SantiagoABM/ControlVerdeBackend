const bitacoraService = require('../services/bitacora.service.js');
const ENUMS = require('../utils/constantes.js');

const obtenerLogsByFilter = async (req, res) => {
    try {
        const { tipo, dni, desde, hasta } = req.query;
        const logs = await bitacoraService.obtenerLogs({ tipo, dni, desde, hasta });
        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Logs obtenidos exitosamente',
            datos: logs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const limpiarBitacora = async (req, res) => {
    try {
        const resp = await bitacoraService.limpiarBitacora();

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Bitácora limpiada correctamente',
            datos: null
        });
    } catch (error) {
        return res.status(500).json({
            success: ENUMS.ERROR,
            message: error.message  
        });
    }
};
module.exports = {
    obtenerLogsByFilter,
    limpiarBitacora
};