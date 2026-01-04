const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reportev2.controller.js');
const { verificarToken } = require('../middlewares/authMiddleware.js');

// POST /api/reportes
router.get('/buscar', reporteController.buscarPorMotivo);
router.get('/buscarv2', reporteController.buscarPorMotivov2);
router.get('/reporte/:tim', verificarToken, reporteController.buscarReporte);
router.post('/add', verificarToken, reporteController.insertarReporte);
router.post('/filtros', reporteController.buscarReportesPorFiltros);
router.get('/deleterdr/:tim', verificarToken, reporteController.eliminarReporteyDetalles);

module.exports = router;
