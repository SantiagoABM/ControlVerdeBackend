const detalleReporteService = require('../services/detalleReporteService.js');
const productoService = require('../services/productoService.js');


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

const insertarLote = async (req, res) => {
    try {
        const detalleReporte = req.body;
        console.log('Lote recibido:', detalleReporte.length);

        if (!detalleReporte || !Array.isArray(detalleReporte) || detalleReporte.length === 0) {
            return res.status(400).json({ error: 'Se esperaba un arreglo de los detalles del reporte' });
        }

        // 1. Obtener SKUs únicos del lote
        const skusUnicos = [...new Set(detalleReporte.map(p => p.sku))];

        // 2. Buscar los productos ya existentes
        const productosExistentes = await productoService.validateSkus(skusUnicos);
        const skusExistentes = new Set(productosExistentes.map(p => p.sku));

        // 3. Crear un mapa SKU -> datos (solo para los que no existen aún)
        const nuevosProductosMap = new Map();

        for (const detalle of detalleReporte) {
            if (!skusExistentes.has(detalle.sku) && !nuevosProductosMap.has(detalle.sku)) {
                nuevosProductosMap.set(detalle.sku, {
                    sku: detalle.sku,
                    descripcion: detalle.descripcion || '',
                    ean: detalle.ean || '',
                    marca: detalle.marca || '',
                    proveedor: detalle.proveedor || '',
                    subdpto: detalle.subdpto || '',
                    casePack: detalle.casePack || 1,
                    costoPromedio: detalle.costoPromedio || 0.0,
                    precioVigente: detalle.precioVigente || 0.0,
                    uMedida: detalle.uMedida || '',
                });
            }
        }

        // 4. Insertar productos nuevos si hay
        const nuevosProductos = Array.from(nuevosProductosMap.values());
        if (nuevosProductos.length > 0) {
            await Producto.insertMany(nuevosProductos, { ordered: false });
            console.log(`✅ Se insertaron ${nuevosProductos.length} nuevos productos.`);
        }

        // 5. Insertar detalles del reporte en lote
        const insertados = await detalleReporteService.insertarDetalleReporteEnLote(detalleReporte);

        res.status(201).json({ message: 'Lote insertado correctamente', total: insertados.length });
    } catch (error) {
        console.error('❌ Error al insertar lote:', error);
        res.status(500).json({ error: 'Error en la inserción del lote', detalle: error.message });
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
    insertarLote,
    obtenerDetallesConProducto,
    obtenerDetalleProducto
};