const detalleReporteService = require('../services/detalleReporteService.js');
const Producto = require('../models/Producto.js');
const reporteService = require('../services/reporteService.js');
const DetalleReporte = require('../models/DetalleReporte.js');
const ENUMS = require('../utils/constantes.js');

const insertarDetalleReporte = async (req, res) => {
    try {
        const { socketId, detalleReporte, salaId, usuario } = req.body; // <- salaId enviado desde frontend
        const result = await detalleReporteService.insertarDetalleReporte(detalleReporte);
        const resultado = await detalleReporteService.obtenerDetalleProductoServiceBySku(result.sku, result.tim);

        // Emitir a todos en la sala excepto al emisor
        req.io.to(salaId).except(socketId).emit('producto-agregado', resultado);

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Detalle del reporte insertado con éxito',

            datos: resultado
        });
    } catch (error) {
        return res.status(200).json({
            success: ENUMS.ERROR,
            message: error.message,

            datos: null
        });
    }
};


const insertarLoteReporte = async (req, res) => {
    try {
        const { reportes } = req.body;
        console.log(req.body)
        if (!Array.isArray(reportes) || reportes.length === 0) {
            return res.status(400).json({
                success: ENUMS.ERROR,
                message: 'Se requiere un arreglo de reportes',

                datos: null
            });
        }

        const skusLote = reportes.map(r => r.sku);
        const productosExistentes = await Producto.find({ sku: { $in: skusLote } }, { sku: 1 }).lean();
        const skusExistentes = new Set(productosExistentes.map(p => p.sku));

        const nuevosProductos = [];
        const detalles = [];

        for (const r of reportes) {
            const {
                sku, ean, subdpto, descripcion, casePack,
                costoPromedio, precioVigente, uMedida,
                tim, olpn, uEnviadas, uRecibidas,
                fechavencimiento, observacion, fastRegister
            } = r;

            // Crear nuevo producto si no existe
            if (!skusExistentes.has(sku)) {
                nuevosProductos.push({
                    sku,
                    ean: ean ?? '',
                    subdpto: subdpto ?? '',
                    descripcion: descripcion ?? '',
                    marca: '',
                    proveedor: '',
                    casePack: casePack ?? 0,
                    costoPromedio: costoPromedio ?? 0,
                    precioVigente: precioVigente ?? 0,
                    uMedida: uMedida ?? '',
                });
                skusExistentes.add(sku); // evitar repetirlo si viene más veces
            }

            // Crear detalleReporte
            detalles.push({
                tim,
                olpn,
                sku,
                uEnviadas,
                uRecibidas,
                fechavencimiento: fechavencimiento ?? '',
                observacion: observacion ?? 'PERTENECE',
                fastRegister: fastRegister ?? false,
            });
        }

        // Insertar nuevos productos
        if (nuevosProductos.length > 0) {
            await Producto.insertMany(nuevosProductos, { ordered: false }).catch(err => {
                console.warn('⚠️ Algunos productos ya existían o fallaron:', err.message);
            });
        }

        // Insertar detalles del reporte
        if (detalles.length > 0) {
            await DetalleReporte.insertMany(detalles, { ordered: false });
        }

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Lote insertado con éxito Productos y Detalles ' + nuevosProductos.length + ' - ' + detalles.length,

            datos: null
        });

    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,

            datos: null
        });
    }
};


const obtenerDetallesConProducto = async (req, res) => {
    try {
        const { tim } = req.params;
        const detalles = await detalleReporteService.obtenerDetallesConProductoService(tim);
        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Detalles obtenidos con éxito',

            datos: detalles
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,

            datos: null
        });
    }
};

const updateRecibidos = async (req, res) => {
    try {
        const usuario = req.usuario._id; // Obtener el ID del usuario autenticado
        const { id, uRecibidas, socketId, salaId } = req.body
        const result = await detalleReporteService.updateRecibidos(id, uRecibidas, usuario)

        if (!result) {
            return res.status(200).json({
                success: ENUMS.SUCCESS,
                message: 'No se encontró el reporte con ese ID',

                datos: null
            });
        }
        req.io.to(salaId).except(socketId).emit('producto-actualizado', result);

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Detalle del reporte actualizado con éxito',

            datos: result
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,

            datos: null
        });
    }
}

const updateDatosDetalle = async (req, res) => {
    try {
        const usuario = req.usuario._id; // Obtener el ID del usuario autenticado
        const { id, uRecibidas, fechavencimiento, socketId, salaId } = req.body
        const result = await detalleReporteService.updateDatos(id, uRecibidas, fechavencimiento, usuario);

        if (!result) {
            res.status(200).json({
                success: ENUMS.SUCCESS,
                message: 'No se encontró el reporte con ese ID',

                datos: null
            });
        }

        req.io.to(salaId).except(socketId).emit('producto-actualizado', result);

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Detalle del reporte actualizado con éxito',

            datos: result
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,

            datos: null
        });
    }
}


const obtenerDetalleProducto = async (req, res) => {
    try {
        const { tim } = req.params;
        const detalles = await detalleReporteService.obtenerDetallesConProductoService(tim);
        res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Detalles obtenidos con éxito',

            datos: detalles
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,

            datos: null
        });
    }
};
const actualizarDetallePorSkus = async (req, res) => {
    try {
        const { skus } = req.body;

        if (!Array.isArray(skus) || skus.length === 0) {
            return res.status(200).json({
                success: ENUMS.ERROR,
                message: 'Lista de SKUs vacía o inválida',

                datos: resultado
            });
        }

        const resultado = await detalleReporteService.actualizarProductosPorSkus(skus);

        res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Detalles del reporte actualizados correctamente.',

            datos: resultado
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};
const obtenerDetalleProductosBySkuYMotivo = async (req, res) => {
    try {
        const { sku, motivo } = req.body;
        console.log(sku, motivo)
        const tims = await reporteService.buscarReportePorMotivo(motivo); // deber ser un array de tims
        if (!Array.isArray(tims) || tims.length === 0) {
            return res.status(200).json({
                success: ENUMS.SUCCESS,
                message: 'No se encontraron reportes con ese motivo',

                datos: null
            });
        }

        const detalles = await detalleReporteService.obtenerDetalleProductoServiceBySkuYTims(sku, tims);
        if (!detalles || detalles.length === 0) {
            res.status(200).json({
                success: ENUMS.SUCCESS,
                message: 'No se encontraron detalles para ese SKU y motivo',

                datos: null
            });
        }

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Detalles obtenidos con éxito',

            datos: detalles
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};


const deleteDetalleReporte = async (req, res) => {
    try {
        const { id } = req.params;
        const { socketId, salaId } = req.body;
        await detalleReporteService.deleteDetalleRep(id);
        req.io.to(salaId).except(socketId).emit('producto-eliminado', id);
        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Detalle del reporte eliminado con éxito',

            datos: null
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,

            datos: null
        });
    }
}

module.exports = {
    insertarDetalleReporte,
    insertarLoteReporte,
    actualizarDetallePorSkus,
    updateRecibidos,
    updateDatosDetalle,
    deleteDetalleReporte,
    obtenerDetallesConProducto,
    obtenerDetalleProducto,
    obtenerDetalleProductosBySkuYMotivo
};