const detalleReporteService = require('../services/detalleReporteService.js');

const insertarDetalleReporte = async (req, res) => {
    try {
        await detalleReporteService.insertarDetalleReporte(req.body);
        res.status(201).json({
            message: 'Detalle del reporte insertado con éxito'
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar el detalle del reporte', detalle: error.message });
    }
};

const insertarLote = async (req, res) => {
    try {
        const detalleReporte = req.body;
        console.log('Lote recibido:', JSON.stringify(req.body));
        if (!detalleReporte || !Array.isArray(detalleReporte) || detalleReporte.length === 0) {
            return res.status(400).json({ error: 'Se esperaba un arreglo de los detalles del reporte' });
        }

        const insertados = await detalleReporteService.insertarDetalleReporteEnLote(detalleReporte);
        res.status(201).json({ message: 'Lote insertado', total: insertados.length });
    } catch (error) {
        console.error('Error al insertar lote:', error);
        res.status(500).json({ error: 'Error en la inserción del lote', detalle: error.message });
    }
};

module.exports = { 
    insertarDetalleReporte,
    insertarLote
};