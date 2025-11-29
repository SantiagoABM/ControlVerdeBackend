const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController.js');
const { verificarToken, requiereRol } = require('../middlewares/authMiddleware.js');

router.post('/crear', verificarToken , requiereRol("administrador", "supervisor"),usuarioController.register);
router.post('/login', usuarioController.login);

module.exports = router; 