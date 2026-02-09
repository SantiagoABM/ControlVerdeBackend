const productoService = require('../services/productoService.js');
const crearBitacoraAuditoria = require('../middlewares/bitacoraMiddleware.js');
const ENUMS = require('../utils/constantes.js');


const insertarProducto = async (req, res) => {
    try {
        const producto = await productoService.insertarProducto(req.body);

        if (!producto) {
            res.status(200).json({
                success: ENUMS.ERROR,
                message: 'No se ha podido crear el producto.',
                datos: null
            });
        }
        await crearBitacoraAuditoria({
            dni: req.usuario.dni,
            tipo: "PRODUCTOS",
            mensaje: `Usuario ${req.usuario.nombres} insertó el producto con sku ${req.body.sku}.`
        });
        res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Se guardó el producto exitosamente.',
            datos: null
        });
    } catch (error) {
        res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};

const obtenerListaUnica = async (req, res) => {
    try {
        const { campo } = req.params;

        // Validar campo permitido para evitar inyección
        const camposPermitidos = [
            "marca",
            "proveedor",
            "subdpto",
            "uMedida"
        ];

        if (!camposPermitidos.includes(campo)) {
            return res.status(400).json({
                success: ENUMS.ERROR,
                message: "Campo no permitido",
                datos: null
            });
        }

        const valores = await productoService.obtenerValoresUnicos(campo);

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: "Valores obtenidos",
            datos: valores
        });

    } catch (error) {
        return res.status(500).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};

const obtenerProductosPorSubdptos = async (req, res) => {
    try {
        const subdptos = [
            "J030101", "J030102", "J030104", "J030105", "J030106", "J030107", "J030201", "J030202",
            "J040101", "J040102", "J050101", "J050205", "J050301", "J050201", "J050306", "J050204",
            "J050202", "J050102", "J050302", "J060101", "J060102", "J060201", "J060202", "J070101",
            "J070102", "J070103", "J070107", "J070109"
        ];
        if (!Array.isArray(subdptos) || subdptos.length === 0) {
            res.status(200).json({
                success: ENUMS.ERROR,
                message: 'Lista de subdptos vacía o inválida',
                datos: null
            });
        }
        const productos = await productoService.buscarProductoPorSubdpto(subdptos);
        res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Se encontraron los siguientes productos.',
            datos: productos,
            total: productos.length
        });
    } catch (error) {
        res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};

const insertarLote = async (req, res) => {
    try {
        const productos = req.body;

        if (!Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({
                success: ENUMS.ERROR,
                message: 'Se esperaba un arreglo de productos',
                datos: null
            });
        }

        const resultado = await productoService.insertarProductosEnLote(productos);

        await crearBitacoraAuditoria({
            dni: req.usuario.dni,
            tipo: "PRODUCTOS",
            mensaje: `Usuario ${req.usuario.nombres} cargó/actualizó la profundidad por lotes.`
        });

        res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Productos insertados / actualizados correctamente',
            datos: {
                insertados: resultado.upsertedCount,
                actualizados: resultado.modifiedCount
            }
        });

    } catch (error) {
        res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};


const buscarProducto = async (req, res) => {
    const { codigo } = req.params;

    try {
        const producto = await productoService.buscarProductoPorCodigo(codigo);

        if (!producto) {
            return res.status(200).json({
                success: ENUMS.ERROR,
                message: 'Producto no encontrado',

                datos: null
            });
        }
        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Producto encontrado',

            datos: producto
        });
    } catch (error) {
        res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,

            datos: null
        });
    }
};

const buscarProductosFiltrados = async (req, res) => {
    try {
        const {
            ean,
            sku,
            subdpto,
            costoPromedio,
            casePack,
            descripcion,
            proveedor,
            marca
        } = req.body;

        const productos = await productoService.filtrarProductos({
            ean,
            sku,
            subdpto,
            costoPromedio,
            casePack,
            descripcion,
            proveedor,
            marca
        });

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: productos.length > 0
                ? 'Productos encontrados'
                : 'No se encontraron productos con los filtros especificados',
            datos: productos
        });

    } catch (error) {
        console.error(error);
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message || 'Error al buscar productos',
            datos: null
        });
    }
};

const updateDatosProducto = async (req, res) => {
    try {
        const { sku, ean, uMedida, costoPromedio, precioVigente, marca, proveedor, socketId, subdpto, descripcion, marcaSensible, isContable } = req.body
        const result = await productoService.updateProducto(sku, ean, uMedida, costoPromedio, precioVigente, marca, proveedor, subdpto, descripcion, marcaSensible, isContable);

        if (!result) {
            res.status(200).json({
                success: ENUMS.SUCCESS,
                message: 'No se encontró el reporte con ese ID',
                datos: null
            });
        }

        req.io.sockets.sockets.forEach((socket) => {
            if (socket.id !== socketId) {
                socket.emit('producto-actualizado', result);
            }
        });
        res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Se actualizó el producto correctamente',
            datos: result
        });
    } catch (error) {
        res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,

            datos: null
        });
    }
}

const actualizarDetallePorSkus = async (req, res) => {
    try {
        const { skus } = req.body;

        if (!Array.isArray(skus) || skus.length === 0) {
            res.status(400).json({
                success: ENUMS.ERROR,
                message: 'Lista de SKUs vacía o inválida',

                datos: null
            });
        }

        const resultado = await productoService.actualizarProductosPorSkus(skus);

        res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Productos actualizados correctamente.',
            datos: resultado,
            rows: resultado.modifiedCount || resultado.nModified
        });
    } catch (error) {
        res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};

const getProductosBySkus = async (req, res) => {
    const { skus } = req.body;

    if (!Array.isArray(skus)) {
        res.status(400).json({
            success: ENUMS.ERROR,
            message: 'sKUs inválidos',
            datos: null
        });
    }

    try {
        const productos = await productoService.getProductosBySkus(skus);
        res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Productos obtenidos correctamente.',

            datos: productos
        });
    } catch (error) {
        res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await productoService.eliminarProducto(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado",
            });
        }
        await crearBitacoraAuditoria({
            dni: req.usuario.dni,
            tipo: "PRODUCTOS",
            mensaje: `Usuario ${req.usuario.nombres} eliminó el producto con sku ${id}.`
        });
        return res.json({
            success: true,
            message: "Producto eliminado correctamente",
        });
    } catch (error) {
        console.error("Error eliminando producto:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
        });
    }
};

const actualizarFlagsPorSubdpto = async (req, res) => {
    try {
        const { subdptos } = req.body;

        // 🧪 Validación
        if (!Array.isArray(subdptos) || subdptos.length === 0) {
            return res.status(400).json({
                success: ENUMS.ERROR,
                message: 'Lista de subdepartamentos requerida',
                datos: null
            });
        }

        const result = await productoService.actualizarFlagsPorSubdpto(subdptos);
        const listaSubdptos = subdptos.join(", ");

        // 🔹 Bitácora
        await crearBitacoraAuditoria({
            dni: req.usuario.dni,
            tipo: "PRODUCTOS",
            mensaje: `Usuario ${req.usuario.nombres} actualizó a MS ${subdptos.length} subdepartamentos : ${listaSubdptos}).`
        });
        res.json({
            success: ENUMS.SUCCESS,
            message: `Flags actualizados correctamente (${result.modifiedCount} registros)`,
            datos: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: ENUMS.ERROR,
            message: 'Error al actualizar flags',
            datos: null
        });
    }
};

const listarSubdptosConFlags = async (req, res) => {
    try {
        const data = await productoService.listarSubdptosConFlags();

        res.json({
            success: ENUMS.SUCCESS,
            message: 'Flags obtenidos correctamente',
            datos: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: ENUMS.ERROR,
            message: "Error al listar subdepartamentos",
            datos: null
        });
    }
};

const importarSkusController = async (req, res) => {
    try {
        const { skus, marcaSensible, isContable } = req.body;

        if (!Array.isArray(skus) || skus.length === 0) {
            return res.status(400).json({
                success: ENUMS.ERROR,
                message: "Lista de SKUs inválida",
                datos: null
            });
        }

        const result = await productoService.importarSkus(skus, marcaSensible, isContable);

        const { enviados, actualizados, noEncontrados } = result;

        const mensaje =
            noEncontrados.length > 0
                ? `Se actualizaron ${actualizados} de ${enviados} SKUs. Algunos no fueron encontrados.`
                : `Se actualizaron correctamente ${actualizados} SKUs.`;
        await crearBitacoraAuditoria({
            dni: req.usuario.dni,
            tipo: "PRODUCTOS",
            mensaje: `Usuario ${req.usuario.nombres} actualizó ${actualizados} de ${enviados} SKUs. No encontrados: ${noEncontrados.join(", ")}.`
        });
        return res.json({
            success: ENUMS.SUCCESS,
            message: mensaje,
            datos: noEncontrados, // 👈 SOLO LOS NO ENCONTRADOS
        });

    } catch (error) {
        return res.status(500).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
}

module.exports = {
    obtenerListaUnica,
    insertarProducto,
    buscarProducto,
    insertarLote,
    getProductosBySkus,
    updateDatosProducto,
    actualizarDetallePorSkus,
    obtenerProductosPorSubdptos,
    buscarProductosFiltrados,
    eliminarProducto,
    actualizarFlagsPorSubdpto,
    listarSubdptosConFlags,
    importarSkusController
};
