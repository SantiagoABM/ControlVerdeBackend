const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController.js');
const { verificarToken } = require('../middlewares/authMiddleware.js');

// POST /api/productos
router.get('/buscar/:codigo', verificarToken, productoController.buscarProducto);
router.put('/productos/detalle', verificarToken, productoController.actualizarDetallePorSkus);
router.post('/por-subdptos', verificarToken, productoController.obtenerProductosPorSubdptos);
router.post('/add', verificarToken, productoController.insertarProducto);
router.post('/updatep', productoController.updateDatosProducto)
router.post('/lote', productoController.insertarLote);
router.post('/by-skus', productoController.getProductosBySkus);

module.exports = router;
