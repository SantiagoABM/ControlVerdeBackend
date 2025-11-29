const reporteService = require('../services/reportev2.service.js');
const detalleReporteService = require('../services/detalleReporteService.js');

const insertarReporte = async (req, res) => {
    try {
        const { tim, creadoPor } = req.body;
        if (!creadoPor) {
            return res.status(400).json({
                status: ENUMS.ERROR,
                message: 'El campo usuario es obligatorio.',
                isError: false,
                datos: null
            });
        }
        const response = await reporteService.buscarReporte(tim);
        if (!response) {
            await reporteService.insertarReporte(req.body);
            res.status(200).json({
                status: ENUMS.SUCCESS,
                message: 'Reporte insertado con éxito',
                isError: false,
                datos: null
            });
        }
        res.status(200).json({
            status: ENUMS.ERROR,
            message: 'El reporte ya existe',
            isError: false,
            datos: null
        });
    } catch (error) {
        return res.status(400).json({
            status: ENUMS.SUCCESS,
            message: error.message,
            isError: true,
            datos: null
        });
    }
};

const buscarPorMotivo = async (req, res) => {
    try {
        const { motivo } = req.query;

        const resultados = await reporteService.buscarReportePorMotivo(motivo);
        if (resultados.length === 0) {
            return res.status(200).json({
                status: ENUMS.SUCCESS,
                message: 'No se encontraron reportes con el motivo especificado',
                isError: false,
                datos: []
            });
        }
        return res.status(200).json({
            status: ENUMS.SUCCESS,
            message: 'Reportes encontrados con éxito',
            isError: false,
            datos: resultados
        });
    } catch (error) {
        return res.status(400).json({
            status: ENUMS.ERROR,
            message: error.message,
            isError: true,
            datos: null
        });
    }
};

const buscarReporte = async (req, res) => {
    const { tim } = req.params;

    try {
        const reporte = await reporteService.buscarReporte(tim);

        if (!reporte) {
            return res.status(200).json({
                status: ENUMS.SUCCESS,
                message: 'Reporte no se ha encontrado o no existe.',
                isError: false,
                datos: null
            });
        }

        return res.status(200).json({
            status: ENUMS.SUCCESS,
            message: 'Reporte encontrado con éxito',
            isError: false,
            datos: reporte
        });
    } catch (error) {
        return res.status(400).json({
            status: ENUMS.ERROR,
            message: error.message,
            isError: true,
            datos: null
        });
    }
};

const eliminarReporteyDetalles = async (req, res) => {
    const { tim } = req.params;

    try {
        const fechaExpiracion = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 días

        await detalleReporteService.marcarDetallesParaExpiracion(tim, fechaExpiracion);
        await reporteService.marcarReporteParaExpiracion(tim, fechaExpiracion);

        res.status(200).json({
            status: ENUMS.SUCCESS,
            message: 'Reporte y detalles serán eliminados en 2 días',
            isError: false,
            datos: null
        });
    } catch (error) {
        res.status(400).json({
            status: ENUMS.ERROR,
            message: error.message,
            isError: true,
            datos: null
        });
    }
};

const buscarPorFechas = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        const resultados = await reporteService.buscarReportePorFechas(fechaInicio, fechaFin);
        if (resultados.length === 0) {
            return res.status(200).json({
                status: ENUMS.SUCCESS,
                message: 'No se encontraron reportes en el rango de fechas especificado',
                isError: false,
                datos: []
            });
        }
        return res.status(200).json({
            status: ENUMS.SUCCESS,
            message: 'Reportes encontrados con éxito',
            isError: false,
            datos: resultados
        });
    }
    catch (error) {
        return res.status(400).json({
            status: ENUMS.ERROR,
            message: error.message,
            isError: true,
            datos: null
        });
    }
};

// const eliminarReporteyDetalles = async (req, res) => {
//     const { tim } = req.params;
//     try {
//         console.log(tim)
//         const detallesResult = await detalleReporteService.deleteDetallesReporte(tim);
//         const reporteResult = await reporteService.deleteReporte(tim);

//         return res.status(200).json({
//             message: 'Reporte y detalles eliminados correctamente'
//         });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };


module.exports = {
    insertarReporte,
    buscarPorMotivo,
    buscarReporte,
    buscarPorFechas,
    eliminarReporteyDetalles
};