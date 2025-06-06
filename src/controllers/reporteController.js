const { response } = require('../app.js');
const reporteService = require('../services/reporteService.js');
const detalleReporteService = require('../services/detalleReporteService.js');

const insertarReporte = async (req, res) => {
    try {
        const tim = req.body.tim;
        const response = await reporteService.buscarReporte(tim);
        if (!response) {
            await reporteService.insertarReporte(req.body);
            return res.status(201).json({
                message: 'Reporte insertado con éxito'
            });
        }
        return res.status(400).json({
            message: 'El reporte ya ha sido registrado'
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error al insertar el Reporte', detalle: error.message });
    }
};

const buscarPorMotivo = async (req, res) => {
    try {
        const { motivo } = req.query;

        const resultados = await reporteService.buscarReportePorMotivo(motivo);
        return res.status(200).json(resultados);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const buscarReporte = async (req, res) => {
    const { tim } = req.params;

    try {
        const reporte = await reporteService.buscarReporte(tim);

        if (!reporte) {
            return res.status(404).json({ message: 'Reporte no encontrado' });
        }

        return res.status(200).json({
            message: 'Reporte encontrado',
            reporte: reporte
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const eliminarReporteyDetalles = async (req, res) => {
    const { tim } = req.params;
    try {
        console.log(tim)
        const detallesResult = await detalleReporteService.deleteDetallesReporte(tim);
        const reporteResult = await reporteService.deleteReporte(tim);

        return res.status(200).json({
            message: 'Reporte y detalles eliminados correctamente'
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


module.exports = {
    insertarReporte,
    buscarPorMotivo,
    buscarReporte,
    eliminarReporteyDetalles
};