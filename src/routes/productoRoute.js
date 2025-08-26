const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController.js');

// POST /api/productos
router.get('/buscar/:codigo', productoController.buscarProducto);
router.put('/productos/detalle', productoController.actualizarDetallePorSkus);
router.post('/por-subdptos', productoController.obtenerProductosPorSubdptos);
router.post('/add', productoController.insertarProducto);
router.post('/updatep', productoController.updateDatosProducto)
router.post('/lote', productoController.insertarLote);
router.post('/by-skus', productoController.getProductosBySkus);

module.exports = router;
