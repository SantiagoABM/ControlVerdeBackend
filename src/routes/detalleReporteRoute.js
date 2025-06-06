const express = require('express');
const router = express.Router();
const detalleReporteController = require('../controllers/detalleReporteController.js');

//api/detallereportes
router.get('/productos/:tim' , detalleReporteController.obtenerDetallesConProducto);

router.post('/add', detalleReporteController.insertarDetalleReporte);
router.post('/update', detalleReporteController.updateRecibidos);
router.post('/updatedr', detalleReporteController.updateDatosDetalle);
router.post('/lote', detalleReporteController.insertarLoteReporte);

router.delete('/delete/:id' , detalleReporteController.deleteDetalleReporte);

module.exports = router;
