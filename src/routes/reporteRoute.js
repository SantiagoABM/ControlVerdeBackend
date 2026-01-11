const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reportev2.controller.js');
const { verificarToken } = require('../middlewares/authMiddleware.js');

// POST /api/reportes
router.get('/buscar', verificarToken, reporteController.buscarPorMotivo);
router.get('/buscarv2', verificarToken, reporteController.buscarPorMotivov2);
router.get('/reporte/:tim', verificarToken, reporteController.buscarReporte);
router.post('/add', verificarToken, reporteController.insertarReporte);
router.post('/filtros', verificarToken, reporteController.buscarReportesPorFiltros);
router.get('/deleterdr/:tim', verificarToken, reporteController.eliminarReporteyDetalles);

module.exports = router;
