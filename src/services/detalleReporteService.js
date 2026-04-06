const DetalleReporte = require('../models/DetalleReporte.js');

async function insertarDetalleReporte(detalleReporte) {
    return await DetalleReporte.create(detalleReporte);
}

async function insertarDetalleReporteEnLote(detalleReportes) {
    return await DetalleReporte.insertMany(detalleReportes, { ordered: false });
}

async function updateRecibidos(id, unidadesRecibidas, modificadoPor) {
    return DetalleReporte.findByIdAndUpdate(
        id,
        { $set: { uRecibidas: unidadesRecibidas, modificadoPor } }, // Asegúrate de que 'usuario' esté definido en el contexto
        { new: true } // devuelve el documento actualizado
    );
}

async function updateDatos(id, uRecibidas, fechavencimiento, modificadoPor, olpn) {
    const updateData = { uRecibidas, fechavencimiento, modificadoPor };
    if (olpn !== undefined) updateData.olpn = olpn;
    
    return DetalleReporte.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true } // devuelve el documento actualizado
    );
}

async function verificarDuplicadoOLPN(olpn, tim, excludeId) {
    if (!olpn || !tim) return null;
    
    // Buscar si existe otra caja con el mismo OLPN en el mismo TIM
    const query = { olpn, tim: Number(tim) };
    if (excludeId) query._id = { $ne: excludeId };
    
    return await DetalleReporte.findOne(query).lean();
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
                marcaSensible: { $ifNull: ['$productoInfo.marcaSensible', false] },
                isContable: { $ifNull: ['$productoInfo.isContable', false] },
                fastRegister: 1,
                modificadoPor: 1
            }
        }
    ]);

    return resultados;
};

const obtenerDetalleProductoServiceBySkuYTims = async (sku, tims) => {
    const resultados = await DetalleReporte.aggregate([
        {
            $match: {
                sku: String(sku),
                tim: { $in: tims.map(Number) }  // Asegúrate de que los tims sean números
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

    return resultados;
};



const obtenerDetalleProductoServiceBySku = async (sku, tim) => {
    const resultados = await DetalleReporte.aggregate([
        {
            $match: {
                sku: String(sku),
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
                fastRegister: 1,
                marcaSensible: { $ifNull: ['$productoInfo.marcaSensible', false] },
                isContable: { $ifNull: ['$productoInfo.isContable', false] }
            }
        }
    ]);

    return resultados[0] || null;
};

async function marcarDetallesParaExpiracion(tim, fecha) {
    return await DetalleReporte.updateMany({ tim }, { $set: { expireAt: fecha } });
}

async function desMarcarDetallesParaExpiracion(tim) {
    return await DetalleReporte.updateMany({ tim }, { $set: { expireAt: null } });
}

async function deleteDetalleRep(id) {
    await DetalleReporte.findByIdAndDelete(id);
}

async function deleteDetallesReporte(tim) {
    return await DetalleReporte.deleteMany({ tim: tim });
}

async function cambiarEstadoEdicion(id, isEditing, editadoPor) {
    if (isEditing) {
        // 🔒 Intentar bloquear: solo si no está ya siendo editado por otro
        return await DetalleReporte.findOneAndUpdate(
            { _id: id, isEditing: false },
            { $set: { isEditing: true, editadoPor } },
            { new: true }
        );
    } else {
        // 🔓 Liberar: lo liberamos y limpiamos el nombre
        return await DetalleReporte.findByIdAndUpdate(
            id,
            { $set: { isEditing: false, editadoPor: '' } },
            { new: true }
        );
    }
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
    obtenerDetalleProductoServiceBySkuYTims,
    marcarDetallesParaExpiracion,
    desMarcarDetallesParaExpiracion,
    verificarDuplicadoOLPN,
    cambiarEstadoEdicion
};
