const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController.js');
const { verificarToken, requiereRol } = require('../middlewares/authMiddleware.js');


router.get('/unico/:campo', verificarToken, usuarioController.obtenerListaUnica);
router.post('/login', usuarioController.login);
router.post('/crear',verificarToken,usuarioController.register);
router.post('/filtros', verificarToken, usuarioController.buscarUsuarios);
router.post('/update/:id', usuarioController.actualizarUsuario);

module.exports = router;    