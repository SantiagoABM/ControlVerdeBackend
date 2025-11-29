const productoService = require('../services/productoService.js');

const insertarProducto = async (req, res) => {
    try {
        const producto = await productoService.insertarProducto(req.body);
        if (!producto) {
            res.status(200).json({
                status: ENUMS.ERROR,
                message: 'No se ha podido crear el producto.',
                isError: true,
                datos: null
            });
        }
        res.status(200).json({
            status: ENUMS.SUCCESS,
            message: 'Se guardó el producto exitosamente.',
            isError: true,
            datos: null
        });
    } catch (error) {
        res.status(400).json({
            status: ENUMS.ERROR,
            message: error.message,
            isError: true,
            datos: null
        });
    }
};

const obtenerProductosPorSubdptos = async (req, res) => {
    try {
        const subdptos = [
            "J030101", "J030102", "J030104", "J030105", "J030106", "J030107", "J030201", "J030202", "J040101", "J040102", "J050101", "J050205", "J050301", "J050201", "J050306", "J050204", "J050202", "J050102", "J050302", "J060101", "J060102", "J060201", "J060202", "J070101", "J070102", "J070103", "J070107", "J070109"
        ];
        if (!Array.isArray(subdptos) || subdptos.length === 0) {
            res.status(200).json({
                status: ENUMS.ERROR,
                message: 'Lista de subdptos vacía o inválida',
                isError: true,
                datos: null
            });
        }
        const productos = await productoService.buscarProductoPorSubdpto(subdptos);
        res.status(200).json({
            status: ENUMS.SUCCESS,
            message: 'No se ha podido crear el usuario.',
            isError: false,
            datos: productos,
            total: productos.length
        });
    } catch (error) {
        res.status(400).json({
            status: ENUMS.ERROR,
            message: error.message,
            isError: true,
            datos: null
        });
    }
};

const insertarLote = async (req, res) => {
    try {
        const productos = req.body;
        if (!productos || !Array.isArray(productos) || productos.length === 0) {
            res.status(200).json({
                status: ENUMS.ERROR,
                message: 'Se esperaba un arreglo de productos',
                isError: true,
                datos: null
            });
        }

        const insertados = await productoService.insertarProductosEnLote(productos);
        res.status(200).json({
            status: ENUMS.SUCCESS,
            message: 'Lote insertado',
            isError: false,
            datos: null,
            total: insertados.length
        });
    } catch (error) {
        res.status(400).json({
            status: ENUMS.ERROR,
            message: error.message,
            isError: true,
            datos: null
        });
    }
};


const buscarProducto = async (req, res) => {
    const { codigo } = req.params;

    try {
        const producto = await productoService.buscarProductoPorCodigo(codigo);

        if (!producto) {
            res.status(200).json({
                status: ENUMS.SUCCESS,
                message: 'Producto no encontrado',
                isError: false,
                datos: null
            });
        }
        res.status(200).json({
            status: ENUMS.SUCCESS,
            message: 'Producto encontrado',
            isError: false,
            datos: producto
        });
    } catch (error) {
        res.status(400).json({
            status: ENUMS.ERROR,
            message: error.message,
            isError: true,
            datos: null
        });
    }
};

const updateDatosProducto = async (req, res) => {
    try {
        const { sku, ean, uMedida, costoPromedio, precioVigente, marca, proveedor, socketId } = req.body
        const result = await productoService.updateProducto(sku, ean, uMedida, costoPromedio, precioVigente, marca, proveedor);

        if (!result) {
            res.status(200).json({
                status: ENUMS.SUCCESS,
                message: 'No se encontró el reporte con ese ID',
                isError: false,
                datos: null
            });
        }

        req.io.sockets.sockets.forEach((socket) => {
            if (socket.id !== socketId) {
                socket.emit('producto-actualizado', result);
            }
        });
        res.status(200).json({
                status: ENUMS.SUCCESS,
                message: 'Se actualizó el producto correctamente',
                isError: false,
                datos: result
            });
    } catch (error) {
        res.status(400).json({
                status: ENUMS.ERROR,
                message: error.message,
                isError: true,
                datos: null
            });
    }
}
const actualizarDetallePorSkus = async (req, res) => {
    try {
        const { skus } = req.body;

        if (!Array.isArray(skus) || skus.length === 0) {
            res.status(400).json({
                status: ENUMS.ERROR,
                message: 'Lista de SKUs vacía o inválida',
                isError: true,
                datos: null
            });
        }

        const resultado = await productoService.actualizarProductosPorSkus(skus);

        res.status(200).json({
                status: ENUMS.SUCCESS,
                message: 'Productos actualizados correctamente.',
                isError: false,
                datos: resultado,
                rows: resultado.modifiedCount || resultado.nModified
            });
    } catch (error) {
        res.status(400).json({
                status: ENUMS.ERROR,
                message: error.message,
                isError: true,
                datos: null
            });
    }
};
const getProductosBySkus = async (req, res) => {
    const { skus } = req.body;

    if (!Array.isArray(skus)) {
        res.status(400).json({
                status: ENUMS.ERROR,
                message: 'sKUs inválidos',
                isError: true,
                datos: null
            });
    }

    try {
        const productos = await productoService.getProductosBySkus(skus);
        res.status(200).json({
                status: ENUMS.SUCCESS,
                message: 'Productos obtenidos correctamente.',
                isError: false,
                datos: productos
            });
    } catch (error) {
        res.status(400).json({
                status: ENUMS.ERROR,
                message: error.message,
                isError: true,
                datos: null
            });
    }
};


module.exports = {
    insertarProducto,
    buscarProducto,
    insertarLote,
    getProductosBySkus,
    updateDatosProducto,
    actualizarDetallePorSkus,
    obtenerProductosPorSubdptos
};
