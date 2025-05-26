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

const insertarLote = async (req, res) => {
  try {
    const productos = req.body.productos;
    console.log(`Productos recibidos: ${JSON.stringify(productos.JSON)}`);
    if (!Array.isArray(productos)) {
      return res.status(400).json({ error: 'Se esperaba un arreglo de productos' });
    }

    const insertados = await productoService.insertarProducto(productos);
    res.status(201).json({ message: 'Lote insertado', total: insertados.length });
  } catch (error) {
    console.error('Error al insertar lote:', error);
    res.status(500).json({ error: 'Error en la inserción del lote', detalle: error.message });
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
  buscarProducto,
  insertarLote
};
