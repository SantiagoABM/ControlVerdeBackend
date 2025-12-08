const express = require('express');
const router = express.Router();
const detalleReporteController = require('../controllers/detalleReportesv2.controller.js');
const { verificarToken } = require('../middlewares/authMiddleware.js');


//api/detallereportes
router.get('/productos/:tim', detalleReporteController.obtenerDetallesConProducto);
router.get('/skumotivo', verificarToken, detalleReporteController.obtenerDetalleProductosBySkuYMotivo);
router.post('/add', verificarToken, detalleReporteController.insertarDetalleReporte);
router.post('/update', verificarToken, detalleReporteController.updateRecibidos);
router.post('/updatedr', verificarToken, detalleReporteController.updateDatosDetalle);
router.post('/lote', verificarToken, detalleReporteController.insertarLoteReporte);
router.get('/delete/:id', verificarToken, detalleReporteController.deleteDetalleReporte);

module.exports = router;