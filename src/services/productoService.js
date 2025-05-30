const Producto = require('../models/Producto.js');

async function insertarProducto(data) {
    const producto = new Producto(data);
    return await producto.save();
}

async function buscarProductoPorCodigo(codigo) {
    if (!codigo) throw new Error('Código requerido');

    let columna = null;
    if (codigo.length === 8) {
        columna = 'sku';
    } else if (codigo.length > 8) {
        columna = 'ean';
    } else {
        throw new Error('Código inválido o muy corto');
    }

    const query = {};
    query[columna] = { $regex: codigo, $options: 'i' };
    const producto = await Producto.findOne(query);

    return producto;
}

async function insertarProductosEnLote(productos) {
    return await Producto.insertMany(productos, { ordered: false });
}

const getProductosBySkus = async (skus) => {
    return await Producto.find(
        { sku: { $in: skus } },
        'sku ean costoPromedio precioVigente uMedida' // Solo estos campos
    );
};


module.exports = {
    insertarProducto,
    buscarProductoPorCodigo,
    insertarProductosEnLote,
    getProductosBySkus
};
