const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController.js');
const { verificarToken, requiereRol } = require('../middlewares/authMiddleware.js');


router.get('/unico/:campo', usuarioController.obtenerListaUnica);
router.post('/login', usuarioController.login);
router.post('/crear', verificarToken, requiereRol("administrador", "supervisor"), usuarioController.register);
router.post('/filtros', usuarioController.buscarUsuarios);
router.post('/update/:id', usuarioController.actualizarUsuario);

module.exports = router; 