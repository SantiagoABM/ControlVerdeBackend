const Producto = require('../models/Producto.js');

async function insertarProducto(data) {
    const producto = new Producto(data);
    return await producto.save();
}

module.exports = {
    insertarProducto,
};
