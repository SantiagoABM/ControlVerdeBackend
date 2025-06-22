// archivo: routes/testRoute.js
const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => {
  try {
    return res.status(200).json({ mensaje: '✅ Conexión exitosa' });
  } catch (error) {
    console.error('❌ Error en /ping:', error);
    return res.status(400).json({ mensaje: '❌ Error de conexión' });
  }
});

module.exports = router;
