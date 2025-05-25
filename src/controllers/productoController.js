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

const buscarProducto = async (req, res) => {
  const { codigo } = req.params;

  try {
    const producto = await productoService.buscarProductoPorCodigo(codigo);

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json({
        message: 'Producto encontrado',
        producto:producto});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  insertarProducto,
  buscarProducto
};
