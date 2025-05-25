const productoService = require('../services/productoService.js');

const insertarProducto = async (req, res) => {
  try {
    const productoGuardado = await productoService.insertarProducto(req.body);
    res.status(201).json({
      message: 'Producto insertado con éxito',
      producto: productoGuardado,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al insertar el producto', detalle: error.message });
  }
};

module.exports = {
  insertarProducto,
};
