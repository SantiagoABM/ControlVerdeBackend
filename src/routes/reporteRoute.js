const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController.js');

// POST /api/reportes
router.post('/add', reporteController.insertarReporte);
router.get('/buscar', reporteController.buscarPorMotivo);
router.get('/reporte/:tim', reporteController.buscarReporte);

module.exports = router;
