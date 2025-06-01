const DetalleReporte = require('../models/DetalleReporte.js');

async function insertarDetalleReporte(skus) {
    return await Producto.find({ sku: { $in: skus } }).select('sku');
}

async function insertarDetalleReporteEnLote(detalleReportes) {
    return await DetalleReporte.insertMany(detalleReportes, { ordered: false });
}

const obtenerDetallesConProductoService = async (tim) => {
    console.log(tim);
    const resultados = await DetalleReporte.aggregate([
        { $match: { tim: parseInt(tim) } },
        {
            $lookup: {
                from: 'productos',
                localField: 'sku',
                foreignField: 'sku',
                as: 'productoInfo'
            }
        },
        {
            $unwind: {
                path: '$productoInfo',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                cEnviadas: {
                    $multiply: ['$uEnviadas', '$casePack']
                }
            }
        },
        {
            $project: {
                id: '$_id', // opcional si lo quieres como id
                tim: 1,
                olpn: 1,
                sku: 1,
                ean: { $ifNull: ['$productoInfo.ean', ''] },
                subdpto: { $ifNull: ['$productoInfo.supdpto', ''] },
                descripcion: { $ifNull: ['$productoInfo.descripcion', ''] },
                casePack: { $ifNull: ['$productoInfo.casePack', ''] },
                uMedida: { $ifNull: ['$productoInfo.uMedida', ''] },
                precioVigente: { $ifNull: ['$productoInfo.precioVigente', 0] },
                costoPromedio: { $ifNull: ['$productoInfo.costoPromedio', 0] },
                uEnviadas: 1,
                uRecibidas: 1,
                fechavencimiento: 1,
                observacion: 1,
                fastRegister: 1
            }
        }
    ]);

    return resultados;
};

const obtenerDetalleProductoService = async (tim) => {
    console.log(tim);
    const resultados = await DetalleReporte.aggregate([
        { $match: { tim: parseInt(tim) } },
        {
            $lookup: {
                from: 'productos',
                localField: 'sku',
                foreignField: 'sku',
                as: 'productoInfo'
            }
        },
        {
            $unwind: {
                path: '$productoInfo',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                cEnviadas: {
                    $multiply: ['$uEnviadas', '$casePack']
                }
            }
        },
        {
            $project: {
                id: '$_id', // opcional si lo quieres como id
                tim: 1,
                olpn: 1,
                sku: 1,
                ean: '$productoInfo.ean',
                subdpto: '$productoInfo.subdpto',
                descripcion: '$productoInfo.descripcion',
                casePack: 1,
                uMedida: '$productoInfo.uMedida',
                precioVigente: { $ifNull: ['$productoInfo.precioVigente', 0] },
                costoPromedio: { $ifNull: ['$productoInfo.costoPromedio', 0] },
                uEnviadas: 1,
                uRecibidas: 1,
                fechavencimiento: 1,
                observacion: 1,
                fastRegister: 1
            }
        }
    ]);

    return resultados;
};

module.exports = {
    insertarDetalleReporte,
    insertarDetalleReporteEnLote,
    
    obtenerDetallesConProductoService,
    obtenerDetalleProductoService
};
