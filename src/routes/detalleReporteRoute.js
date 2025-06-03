const express = require('express');
const router = express.Router();
const detalleReporteController = require('../controllers/detalleReporteController.js');

//api/detallereportes
router.post('/add', detalleReporteController.insertarDetalleReporte);
router.post('/update', detalleReporteController.updateRecibidos);
router.post('/updatedt', detalleReporteController.updateDatosDetalle);
router.post('/lote', detalleReporteController.insertarLoteReporte);
router.get('/productos/:tim' , detalleReporteController.obtenerDetallesConProducto);


module.exports = router;
