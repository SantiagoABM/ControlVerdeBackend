const reporteService = require('../services/reporteService.js');

const insertarReporte = async (req, res) => {
    try {
        await reporteService.insertarReporte(req.body);
        res.status(201).json({
            message: 'Reporte insertado con éxito'
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar el Reporte', detalle: error.message });
    }
};

const buscarPorMotivo = async (req, res) => {
    try {
        const { motivo } = req.query;

        const resultados = await reporteService.buscarReportePorMotivo(motivo);
        res.status(200).json(resultados);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const buscarReporte = async (req, res) => {
    const { tim } = req.params;

    try {
        const reporte = await reporteService.buscarReporte(tim);

        if (!reporte) {
            return res.status(404).json({ message: 'Reporte no encontrado' });
        }

        res.status(200).json({
            message: 'Reporte encontrado',
            reporte: reporte
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


module.exports = { 
    insertarReporte,
    buscarPorMotivo,
    buscarReporte
};