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
    return await Producto.find({ subdpto: { $in: subdptos } });
}

async function filtrarProductos({
    ean,
    sku,
    subdpto,
    precio,
    casePack,
    descripcion,
    proveedor,
    marca
}) {
    const filtro = {};

    // Exact match para numéricos
    if (sku !== undefined && sku !== null && sku !== '') {
        filtro.sku = { $regex: sku.trim(), $options: 'i' };
    }
    if (ean !== undefined && ean !== null && ean !== '') {
        filtro.ean = { $regex: ean.trim(), $options: 'i' };
    }
    if (subdpto !== undefined && subdpto !== null && subdpto !== '') {
        filtro.subdpto = { $regex: subdpto.trim(), $options: 'i' };
    }
    if (precio !== undefined && precio !== null && precio !== '') {
        filtro.precioVigente = Number(precio);
    }

    if (casePack !== undefined && casePack !== null && casePack !== '') {
        filtro.casePack = Number(casePack);
    }

    // Búsquedas "contains" case-insensitive para strings
    if (descripcion && descripcion.trim() !== '') {
        filtro.descripcion = { $regex: descripcion.trim(), $options: 'i' };
    }

    if (proveedor && proveedor.trim() !== '') {
        filtro.proveedor = { $regex: proveedor.trim(), $options: 'i' };
    }

    if (marca && marca.trim() !== '') {
        filtro.marca = { $regex: marca.trim(), $options: 'i' };
    }
    console.log('Filtro construido:', filtro);
    // Si no se envía nada, devolverá todos (cuidado, puedes limitar si quieres)
    const productos = await Producto.find(filtro).lean();
    return productos;
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
    return await Producto.insertMany(productos, { ordered: false });
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

async function updateProducto(sku, ean, uMedida, costoPromedio, precioVigente, marca, proveedor, subdpto,descripcion, marcaSensible) {
    return Producto.findOneAndUpdate(
        { sku },
        { ean, uMedida, costoPromedio, precioVigente, marca, proveedor, subdpto, descripcion, marcaSensible },
        { new: true } // devuelve el documento actualizado
    );
}

const actualizarProductosPorSkus = async (skus) => {
    const resultado = await Producto.updateMany(
        { sku: { $in: skus } },
        { $set: { detalle: 'MARCA SENSIBLE' } }
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
    eliminarProducto
};
