const DetalleReporte = require('../models/DetalleReporte.js');

async function insertarDetalleReporte(detalleReporte) {
    return await DetalleReporte.insertOne(detalleReporte);
}

async function insertarDetalleReporteEnLote(detalleReportes) {
    return await DetalleReporte.insertMany(detalleReportes, { ordered: false });
}

async function updateRecibidos(id, unidadesRecibidas) {
    return DetalleReporte.findByIdAndUpdate(
        id,
        {$set :{ uRecibidas: unidadesRecibidas }},
        { new: true } // devuelve el documento actualizado
    );
}

async function updateDatos(id, uRecibidas, fechavencimiento) {
    return DetalleReporte.findByIdAndUpdate(
        id,
        {$set:{ uRecibidas, fechavencimiento}},
        { new: true } // devuelve el documento actualizado
    );
}


const obtenerDetallesConProductoService = async (tim) => {
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
                tim: 1,
                olpn: 1,
                sku: 1,
                ean: { $ifNull: ['$productoInfo.ean', ''] },
                subdpto: { $ifNull: ['$productoInfo.subdpto', ''] },
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

const obtenerDetalleProductoServiceBySku = async (sku) => {
    const resultados = await DetalleReporte.aggregate([
        { $match: { sku: String(sku),
            tim: Number(tim)
         }
        
    },
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
                _id: 1,
                tim: 1,
                olpn: 1,
                sku: 1,
                ean: '$productoInfo.ean',
                subdpto: '$productoInfo.subdpto',
                descripcion: '$productoInfo.descripcion',
                casePack: '$productoInfo.casePack',
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

    return resultados[0] || null;
};

async function marcarDetallesParaExpiracion(tim, fecha) {
    return await DetalleReporte.updateMany({ tim }, { $set: { expireAt: fecha } });
}

async function deleteDetalleRep(id) {
    await DetalleReporte.findByIdAndDelete(id);
}

async function deleteDetallesReporte(tim) {
    return await DetalleReporte.deleteMany({ tim:tim });
}

module.exports = {
    insertarDetalleReporte,
    insertarDetalleReporteEnLote,
    deleteDetallesReporte,
    deleteDetalleRep,
    updateRecibidos,
    updateDatos,
    obtenerDetallesConProductoService,
    obtenerDetalleProductoServiceBySku,
    marcarDetallesParaExpiracion
};
