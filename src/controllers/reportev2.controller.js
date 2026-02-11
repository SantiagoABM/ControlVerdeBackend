const reporteService = require('../services/reportev2.service.js');
const detalleReporteService = require('../services/detalleReporteService.js');
const crearBitacoraAuditoria = require('../middlewares/bitacoraMiddleware.js');
const ENUMS = require('../utils/constantes.js');

const insertarReporte = async (req, res) => {
    try {
        const { tim, creadoPor, motivo } = req.body;

        if (!creadoPor) {
            return res.status(400).json({
                success: ENUMS.ERROR,
                message: 'El campo creadoPor es obligatorio.',

                datos: null
            });
        }
        const response = await reporteService.buscarReporte(tim);

        if (!response) {
            await reporteService.insertarReporte(req.body);
            if (motivo === 'T') { motivo = 'TIM' }
            else {
                motivo = 'Donación';
            }
            await crearBitacoraAuditoria({
                dni: req.usuario.dni,
                tipo: "REPORTES",
                mensaje: `Usuario ${req.usuario.nombres} insertó el reporte #${tim} motivo: ${motivo}`
            });
            res.status(200).json({
                success: ENUMS.SUCCESS,
                message: 'Reporte insertado con éxito',
                datos: null
            });
        }
        res.status(200).json({
            success: ENUMS.ERROR,
            message: 'El reporte ya existe',
            datos: null
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.SUCCESS,
            message: error.message,
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
                success: ENUMS.SUCCESS,
                message: 'No se encontraron reportes con el motivo especificado',

                datos: []
            });
        }
        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Reportes encontrados con éxito',

            datos: resultados
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};

const buscarPorMotivov2 = async (req, res) => {
    try {
        const { motivo } = req.query;

        const resultados = await reporteService.buscarReportePorMotivov2(motivo);
        if (resultados.length === 0) {
            return res.status(200).json({
                success: ENUMS.SUCCESS,
                message: 'No se encontraron reportes con el motivo especificado',

                datos: []
            });
        }
        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Reportes encontrados con éxito',

            datos: resultados
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
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
                success: ENUMS.SUCCESS,
                message: 'Reporte no se ha encontrado o no existe.',

                datos: null
            });
        }

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Reporte encontrado con éxito',

            datos: reporte
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};

const eliminarReporteyDetalles = async (req, res) => {
    const { tim } = req.params;

    try {
        const fechaExpiracion = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 días
        const reporte = await reporteService.buscarReporte(tim);
        await detalleReporteService.marcarDetallesParaExpiracion(tim, fechaExpiracion);
        await reporteService.marcarReporteParaExpiracion(tim, fechaExpiracion);
        if (reporte.motivo === 'T') { motivo = 'TIM' }
        else { motivo = 'Donación' }
        await crearBitacoraAuditoria({
            dni: req.usuario.dni,
            tipo: "REPORTES",
            mensaje: `Usuario ${req.usuario.nombres} eliminó el reporte con #${tim} motivo: ${motivo}`
        });
        res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Reporte y detalles serán eliminados en 2 días',

            datos: null
        });
    } catch (error) {
        res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};

const reactivarTim = async (req, res) => {
    const { tim } = req.params;

    try {
        const reporte = await reporteService.buscarReporte(tim);
        if (!reporte) {
            return res.status(404).json({
                success: ENUMS.ERROR,
                message: 'Reporte no encontrado',
                datos: null
            });
        }

        await detalleReporteService.desMarcarDetallesParaExpiracion(tim);
        await reporteService.desMarcarReporteParaExpiracion(tim);
        if (reporte.motivo === 'T') { motivo = 'TIM' }
        else { motivo = 'Donación' }
        await crearBitacoraAuditoria({
            dni: req.usuario.dni,
            tipo: "REPORTES",
            mensaje: `Usuario ${req.usuario.nombres} reactivó el reporte con #${tim} motivo: ${motivo}`
        });
        res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Reporte y detalles activados correctamente',
            datos: null
        });
    } catch (error) {
        res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
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
                success: ENUMS.SUCCESS,
                message: 'No se encontraron reportes en el rango de fechas especificado',

                datos: []
            });
        }
        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Reportes encontrados con éxito',

            datos: resultados
        });
    }
    catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};

const buscarReportesPorFiltros = async (req, res) => {
    try {
        const filtros = req.body;
        const reportes = await reporteService.filtrarReportes(filtros);

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: "Reportes obtenidos",
            datos: reportes
        });

    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
}

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
    buscarPorMotivov2,
    buscarReporte,
    buscarPorFechas,
    eliminarReporteyDetalles,
    buscarReportesPorFiltros,
    reactivarTim
};