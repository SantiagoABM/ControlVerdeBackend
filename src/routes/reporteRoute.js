const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reportev2.controller.js');
const { verificarToken } = require('../middlewares/authMiddleware.js');

// POST /api/reportes
router.get('/buscar', verificarToken, reporteController.buscarPorMotivo);
router.get('/reporte/:tim', reporteController.buscarReporte);

router.post('/add', reporteController.insertarReporte);

router.get('/deleterdr/:tim', reporteController.eliminarReporteyDetalles);

module.exports = router;
