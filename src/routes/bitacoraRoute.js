const express = require('express');
const router = express.Router();
const bitacoraController = require('../controllers/bitacora.controller.js');
const { verificarToken } = require('../middlewares/authMiddleware.js');

//api/bitacora
router.get('/logs',
    verificarToken,
    bitacoraController.obtenerLogsByFilter);
router.get('/limpiar', 
    // verificarToken,
    bitacoraController.limpiarBitacora);

module.exports = router;
