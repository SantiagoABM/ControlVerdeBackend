const detalleReporteService = require('../services/detalleReporteService.js');
const productoService = require('../services/productoService.js');
const Producto = require('../models/Producto.js');
const DetalleReporte = require('../models/DetalleReporte.js');



const insertarDetalleReporte = async (req, res) => {
    try {
        await detalleReporteService.insertarDetalleReporte(req.body);
        res.status(201).json({
            message: 'Detalle del reporte insertado con éxito'
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar el detalle del reporte', detalle: error.message });
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

        res.status(201).json({
            message: 'Lote procesado correctamente',
            total: reportes.length,
            productosAgregados: nuevosProductos.length,
            detallesGuardados: detalles.length
        });

    } catch (error) {
        console.error('❌ Error al procesar lote:', error);
        res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
    }
};


const obtenerDetallesConProducto = async (req, res) => {
    try {
        const { tim } = req.params;
        console.log(tim);
        const detalles = await detalleReporteService.obtenerDetallesConProductoService(tim);
        res.json(detalles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los detalles con información de productos' });
    }
};

const obtenerDetalleProducto = async (req, res) => {
    try {
        const { tim } = req.params;
        console.log(tim);
        const detalles = await detalleReporteService.obtenerDetallesConProductoService(tim);
        res.json(detalles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los detalles con información de productos' });
    }
};

module.exports = {
    insertarDetalleReporte,
    insertarLoteReporte,
    obtenerDetallesConProducto,
    obtenerDetalleProducto
};