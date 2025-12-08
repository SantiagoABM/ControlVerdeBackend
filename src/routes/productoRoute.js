const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productov2.controller.js');
const { verificarToken } = require('../middlewares/authMiddleware.js');

// POST /api/productos
router.get('/unico/:campo', verificarToken, productoController.obtenerListaUnica);
router.get('/buscar/:codigo', verificarToken, productoController.buscarProducto);
router.post('/filtrar', verificarToken, productoController.buscarProductosFiltrados);
router.post('/productos/detalle', verificarToken, productoController.actualizarDetallePorSkus);
router.post('/por-subdptos', verificarToken, productoController.obtenerProductosPorSubdptos);
router.post('/add', verificarToken,productoController.insertarProducto);
router.post('/updatep', verificarToken,productoController.updateDatosProducto)
router.post('/lote', verificarToken, productoController.insertarLote);
router.post('/by-skus', verificarToken,productoController.getProductosBySkus);
router.post('/:id', verificarToken,productoController.eliminarProducto);

module.exports = router;
