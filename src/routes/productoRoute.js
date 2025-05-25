const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController.js');

// POST /api/productos
router.post('/agregar', productoController.insertarProducto);
router.get('/buscar/:codigo', productoController.buscarProducto);

module.exports = router;
