const detalleReporteService = require('../services/detalleReporteService.js');
const Producto = require('../models/Producto.js');
const reporteService = require('../services/reporteService.js');
const DetalleReporte = require('../models/DetalleReporte.js');

const insertarDetalleReporte = async (req, res) => {
    try {
        const { socketId, detalleReporte, salaId } = req.body; // <- salaId enviado desde frontend
        const result = await detalleReporteService.insertarDetalleReporte(detalleReporte);
        const resultado = await detalleReporteService.obtenerDetalleProductoServiceBySku(result.sku, result.tim);

        // Emitir a todos en la sala excepto al emisor
        req.io.to(salaId).except(socketId).emit('producto-agregado', resultado);
        
        return res.status(201).json({
            message: 'Detalle del reporte insertado con éxito',
            resultado: resultado
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Error al insertar el detalle del reporte',
            detalle: error.message
        });
    }
};


const insertarLoteReporte = async (req, res) => {
    try {
        const reportes = req.body;

        if (!Array.isArray(reportes) || reportes.length === 0) {
            return res.status(400).json({ error: 'Se requiere un arreglo de reportes' });
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

        return res.status(201).json({
            message: 'Lote procesado correctamente',
            total: reportes.length,
            productosAgregados: nuevosProductos.length,
            detallesGuardados: detalles.length
        });

    } catch (error) {
        return res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
    }
};


const obtenerDetallesConProducto = async (req, res) => {
    try {
        const { tim } = req.params;
        const detalles = await detalleReporteService.obtenerDetallesConProductoService(tim);
        return res.json(detalles);
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al obtener los detalles con información de productos' });
    }
};

const updateRecibidos = async (req, res) => {
    try {
        const { id, uRecibidas, socketId, salaId } = req.body
        const result = await detalleReporteService.updateRecibidos(id, uRecibidas)

        if (!result) {
            return res.status(404).json({ mensaje: '❌ No se encontró el reporte con ese ID' });
        }
        req.io.to(salaId).except(socketId).emit('producto-actualizado', result);

        return res.status(200).json(result);
    } catch (error) {
        console.error('❌ Error al actualizar uRecibidas:', error);
        return res.status(500).json({ mensaje: 'Error al actualizar el producto' });
    }
}

const updateDatosDetalle = async (req, res) => {
    try {
        const { id, uRecibidas, fechavencimiento, socketId, salaId } = req.body
        const result = await detalleReporteService.updateDatos(id, uRecibidas, fechavencimiento);

        if (!result) {
            return res.status(404).json({ mensaje: '❌ No se encontró el reporte con ese ID' });
        }

        req.io.to(salaId).except(socketId).emit('producto-actualizado', result);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al actualizar el producto' });
    }
}


const obtenerDetalleProducto = async (req, res) => {
    try {
        const { tim } = req.params;
        const detalles = await detalleReporteService.obtenerDetallesConProductoService(tim);
        return res.json(detalles);
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al obtener los detalles con información de productos' });
    }
};

const obtenerDetalleProductosBySkuYMotivo = async (req, res) => {
    try {
        const { sku, motivo } = req.body;
        console.log(sku, motivo)
        const tims = await reporteService.buscarReportePorMotivo(motivo); // deber ser un array de tims
        console.log(tims);
        if (!Array.isArray(tims) || tims.length === 0) {
            return res.status(404).json({ mensaje: 'No hay TIMs para ese motivo' });
        }

        const detalles = await detalleReporteService.obtenerDetalleProductoServiceBySkuYTims(sku, tims);
        console.log(detalles);
        if (!detalles || detalles.length === 0) {
            return res.status(404).json({ mensaje: 'Detalle no encontrado' });
        }

        return res.status(204).json(detalles);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al obtener el producto' });
    }
};


const deleteDetalleReporte = async (req, res) => {
    try {
        const { id } = req.params;
        const { socketId, salaId } = req.body;
        await detalleReporteService.deleteDetalleRep(id);
        req.io.to(salaId).except(socketId).emit('producto-eliminado', id);
        return res.status(200).json({
            message: 'Producto Eliminado Correctamente'
        });
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al eliminar el producto' });
    }
}

module.exports = {
    insertarDetalleReporte,
    insertarLoteReporte,
    updateRecibidos,
    updateDatosDetalle,
    deleteDetalleReporte,
    obtenerDetallesConProducto,
    obtenerDetalleProducto,
    obtenerDetalleProductosBySkuYMotivo
};