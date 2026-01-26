const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productov2.controller.js');
const { verificarToken } = require('../middlewares/authMiddleware.js');

// POST /api/productos
router.get('/unico/:campo',
    verificarToken,
    productoController.obtenerListaUnica
);
router.get('/buscar/:codigo',
    productoController.buscarProducto
);
router.get("/subdptos/flags",
    verificarToken,
    productoController.listarSubdptosConFlags
);
router.post('/filtrar',
    verificarToken,
    productoController.buscarProductosFiltrados
);
router.post('/productos/detalle',
    verificarToken,
    productoController.actualizarDetallePorSkus
);
router.get('/por-subdptos',
    // verificarToken,
    productoController.obtenerProductosPorSubdptos
);
router.post('/add',
    verificarToken,
    productoController.insertarProducto
);
router.post('/actualizarFlag',
    verificarToken,
    productoController.actualizarFlagsPorSubdpto
);
router.post('/actualizarSkusFlags',
    verificarToken,
    productoController.importarSkusController
);
router.post('/updatep',
    verificarToken,
    productoController.updateDatosProducto
);
router.post('/lote',
    verificarToken,
    productoController.insertarLote
);
router.post('/by-skus',
    verificarToken,
    productoController.getProductosBySkus
);
router.post('/:id',
    verificarToken,
    productoController.eliminarProducto
);

module.exports = router;
