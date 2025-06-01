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
        const detalleReportes = req.body;
        console.log('Lote recibido:', JSON.stringify(detalleReportes.length));

        if (!detalleReportes || !Array.isArray(detalleReportes) || detalleReportes.length === 0) {
            return res.status(400).json({ error: 'Se esperaba un arreglo de los detalles del reporte' });
        }

        // 1. Obtener todos los SKUs únicos del lote
        const skus = [...new Set(detalleReportes.map(p => p.sku))];

        // 2. Buscar qué productos ya existen
        const productosExistentes = await productoService.buscarProductosPorSkus;
        const skusExistentes = new Set(productosExistentes.map(p => p.sku));

        // 3. Preparar productos nuevos que no existen aún
        const nuevosProductos = detalleReportes
            .filter(p => !skusExistentes.has(p.sku))
            .map(p => ({
                sku: p.sku,
                descripcion: p.descripcion || '',
                categoria: p.categoria || null,
                validado: false,
                creadoEn: new Date(),
                fuente: 'reporteExcel'
            }));

        // 4. Insertar productos nuevos si hay alguno
        if (nuevosProductos.length > 0) {
            await productoService.insertarProductosEnLote(nuevosProductos);
            console.log(`Se insertaron ${nuevosProductos.length} nuevos productos.`);
        }

        // 5. Insertar los detalles del reporte
        const insertados = await detalleReporteService.insertarDetalleReporteEnLote(detalleReportes);

        res.status(201).json({ message: 'Lote insertado', total: insertados.length });
    } catch (error) {
        console.error('Error al insertar lote:', error);
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