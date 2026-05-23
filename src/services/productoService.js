const Producto = require('../models/Producto.js');

async function insertarProducto(data) {
    const producto = new Producto(data);
    return await producto.save();
}

async function buscarProductoPorCodigo(codigo) {
    if (!codigo) throw new Error('Código requerido');

    // Buscar por SKU
    let producto = await Producto.findOne({ sku: codigo });

    // Si no se encontró, buscar por EAN
    if (!producto) {
        producto = await Producto.findOne({ ean: codigo });
    }

    return producto;
}

async function buscarProductoPorSubdpto(subdptos) {
    return await Producto.find({ subdpto: { $in: subdptos } }).select('-precioInv');;
}

async function filtrarProductos({
    ean,
    sku,
    subdpto,
    costoPromedio,
    casePack,
    descripcion,
    proveedor,
    marca
}) {
    const filtro = {};
    // Exact match para numéricos
    if (sku !== undefined && sku !== null && sku !== '') {
        const skuStr = typeof sku === 'object' ? '' : String(sku).trim();
        if (skuStr !== '') {
            filtro.sku = { $regex: skuStr, $options: 'i' };
        }
    }
    if (ean !== undefined && ean !== null && ean !== '') {
        const eanStr = typeof ean === 'object' ? '' : String(ean).trim();
        if (eanStr !== '') {
            filtro.ean = { $regex: eanStr, $options: 'i' };
        }
    }
    if (subdpto !== undefined && subdpto !== null && subdpto !== '') {
        const subdptoStr = typeof subdpto === 'object' ? '' : String(subdpto).trim();
        if (subdptoStr !== '') {
            filtro.subdpto = { $regex: subdptoStr, $options: 'i' };
        }
    }
    if (costoPromedio !== undefined && costoPromedio !== null && costoPromedio !== '') {
        filtro.costoPromedio = Number(costoPromedio);
    }

    if (casePack !== undefined && casePack !== null && casePack !== '') {
        filtro.casePack = Number(casePack);
    }

    // Búsquedas "contains" case-insensitive para strings
    if (descripcion !== undefined && descripcion !== null) {
        const descripcionStr = typeof descripcion === 'object' ? '' : String(descripcion).trim();
        if (descripcionStr !== '') {
            filtro.descripcion = { $regex: descripcionStr, $options: 'i' };
        }
    }

    if (proveedor !== undefined && proveedor !== null) {
        const proveedorStr = typeof proveedor === 'object' ? '' : String(proveedor).trim();
        if (proveedorStr !== '') {
            filtro.proveedor = { $regex: proveedorStr, $options: 'i' };
        }
    }

    if (marca !== undefined && marca !== null) {
        const marcaStr = typeof marca === 'object' ? '' : String(marca).trim();
        if (marcaStr !== '') {
            filtro.marca = { $regex: marcaStr, $options: 'i' };
        }
    }
    // Si no se envía nada, devolverá todos (cuidado, puedes limitar si quieres)
    const productos = await Producto.find(filtro).lean();
    return productos;
}

async function importarSkus(skus, marcaSensible, isContable) {
    const skusLimpios = skus
        .map(s => String(s).trim())
        .filter(Boolean);

    if (skusLimpios.length === 0) {
        throw new Error("No hay SKUs válidos");
    }

    // 🔍 Buscar existentes
    const productos = await Producto.find(
        { sku: { $in: skusLimpios } },
        { sku: 1, _id: 0 }
    );

    const skusEncontrados = productos.map(p => p.sku);

    const skusNoEncontrados = skusLimpios.filter(
        sku => !skusEncontrados.includes(sku)
    );

    let actualizados = 0;

    if (skusEncontrados.length > 0) {
        const result = await Producto.updateMany(
            { sku: { $in: skusEncontrados } },
            {
                $set: {
                    isContable: isContable,
                    marcaSensible: marcaSensible,
                },
            }
        );

        actualizados = result.modifiedCount;
    }

    return {
        enviados: skusLimpios.length,
        actualizados,
        noEncontrados: skusNoEncontrados,
    };
}

// async function buscarProductoPorCodigo(codigo) {
//     if (!codigo) throw new Error('Código requerido');

//     let columna = null;
//     if (codigo.length === 8) {
//         columna = 'sku';
//     } else if (codigo.length > 8 > codigo.length) {
//         columna = 'ean';
//     } else {
//         throw new Error('Código inválido o muy corto');
//     }

//     const query = {};
//     query[columna] = codigo;
//     // query[columna] = { $regex: codigo, $options: 'i' };
//     const producto = await Producto.findOne(query);
//     return producto;
// }

async function insertarProductosEnLote(productos) {
    const operaciones = productos.map(prod => ({
        updateOne: {
            filter: { sku: prod.sku }, // 👈 o ean, o el identificador único
            update: {
                $set: {
                    ...prod,
                    updatedAt: new Date()
                }
            },
            upsert: true
        }
    }));

    const resultado = await Producto.bulkWrite(operaciones, { ordered: false });

    return resultado;
}


const getProductosBySkus = async (skus) => {
    return await Producto.find(
        { sku: { $in: skus } },
        'sku ean costoPromedio precioVigente uMedida' // Solo estos campos
    );
};

async function obtenerValoresUnicos(campo) {
    return await Producto.distinct(campo);
}

async function updateProducto(sku, ean, uMedida, costoPromedio, precioVigente, marca, proveedor, subdpto, descripcion, marcaSensible, isContable) {

    return Producto.findOneAndUpdate(
        { sku },
        { ean, uMedida, costoPromedio, precioVigente, marca, proveedor, subdpto, descripcion, marcaSensible, isContable },
        { new: true } // devuelve el documento actualizado
    );
}

const actualizarProductosPorSkus = async (skus) => {
    const resultado = await Producto.updateMany(
        { sku: { $in: skus } },
        { $set: { marcaSensible: true } }
    );
    return resultado;
};

const validateSkus = async (skus) => {
    return await Producto.find({ sku: { $in: skusUnicos } }).select('sku');
};

async function eliminarProducto(id) {
    const deleted = await Producto.findByIdAndDelete(id);
    return deleted;
}

async function actualizarFlagsPorSubdpto(subdptos) {
    if (!Array.isArray(subdptos) || subdptos.length === 0) {
        return { modifiedCount: 0 };
    }

    const operaciones = [];

    for (const sub of subdptos) {
        const updateData = {};

        // 🧠 REGLAS DE NEGOCIO
        if (sub.marcaSensible === true) {
            updateData.marcaSensible = true;
            updateData.isContable = true;
        }

        if (sub.isContable === false) {
            updateData.isContable = false;
            updateData.marcaSensible = false;
        }

        // Casos independientes
        if (sub.marcaSensible === false && sub.isContable !== false) {
            updateData.marcaSensible = false;
        }

        if (sub.isContable === true && sub.marcaSensible !== true) {
            updateData.isContable = true;
        }

        if (Object.keys(updateData).length === 0) {
            continue; // nada que actualizar
        }

        operaciones.push({
            updateMany: {
                filter: { subdpto: sub.subdpto },
                update: { $set: updateData }
            }
        });
    }

    if (operaciones.length === 0) {
        return { modifiedCount: 0 };
    }

    const result = await Producto.bulkWrite(operaciones);

    return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        operationCount: operaciones.length
    };
}

async function listarSubdptosConFlags() {
    return Producto.aggregate([
        {
            $group: {
                _id: "$subdpto",
                marcaSensible: { $max: "$marcaSensible" },
                isContable: { $max: "$isContable" },
            },
        },
        {
            $project: {
                _id: 0,
                subdpto: "$_id",
                marcaSensible: 1,
                isContable: 1,
            },
        },
        {
            $sort: { subdpto: 1 },
        },
    ]);
};

module.exports = {
    insertarProducto,
    buscarProductoPorCodigo,
    filtrarProductos,
    insertarProductosEnLote,
    actualizarProductosPorSkus,
    getProductosBySkus,
    updateProducto,
    validateSkus,
    buscarProductoPorSubdpto,
    obtenerValoresUnicos,
    eliminarProducto,
    actualizarFlagsPorSubdpto,
    listarSubdptosConFlags,
    importarSkus
};
