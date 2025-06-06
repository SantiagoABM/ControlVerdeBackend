const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController.js');

// POST /api/reportes
router.get('/buscar', reporteController.buscarPorMotivo);
router.get('/reporte/:tim', reporteController.buscarReporte);

router.post('/add', reporteController.insertarReporte);

router.delete('/deleterdr/:tim', reporteController.eliminarReporteyDetalles);

module.exports = router;
