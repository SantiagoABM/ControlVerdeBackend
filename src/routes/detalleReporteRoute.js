const express = require('express');
const router = express.Router();
const detalleReporteController = require('../controllers/detalleReporteController.js');

// POST /api/detallereportes
router.post('/add', detalleReporteController.insertarDetalleReporte);
router.post('/lote', detalleReporteController.insertarLote);

module.exports = router;
