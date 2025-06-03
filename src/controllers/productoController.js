const productoService = require('../services/productoService.js');

const insertarProducto = async (req, res) => {
    try {
        await productoService.insertarProducto(req.body);
        return res.status(201).json({
            message: 'Producto insertado con éxito'
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error al insertar el producto', detalle: error.message });
    }
};

const insertarLote = async (req, res) => {
    try {
        const productos = req.body;
        console.log('Lote recibido:', JSON.stringify(req.body));
        if (!productos || !Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({ error: 'Se esperaba un arreglo de productos' });
        }

        const insertados = await productoService.insertarProductosEnLote(productos);
        return res.status(201).json({ message: 'Lote insertado', total: insertados.length });
    } catch (error) {
        console.error('Error al insertar lote:', error);
        return res.status(500).json({ error: 'Error en la inserción del lote', detalle: error.message });
    }
};


const buscarProducto = async (req, res) => {
    const { codigo } = req.params;

    try {
        const producto = await productoService.buscarProductoPorCodigo(codigo);

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        return res.status(200).json({
            message: 'Producto encontrado',
            producto: producto
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const getProductosBySkus = async (req, res) => {
  const { skus } = req.body;

  if (!Array.isArray(skus)) {
    return res.status(400).json({ message: 'SKUs inválidos' });
  }

  try {
    const productos = await productoService.getProductosBySkus(skus);
    return res.status(200).json(productos);
  } catch (error) {
    console.error('Error en getProductosBySkus:', error);
    return res.status(500).json({ message: 'Error al obtener productos' });
  }
};


module.exports = {
    insertarProducto,
    buscarProducto,
    insertarLote,
    getProductosBySkus
};
