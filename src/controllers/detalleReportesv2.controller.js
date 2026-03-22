const detalleReporteService = require('../services/detalleReporteService.js');
const Producto = require('../models/Producto.js');
const reporteService = require('../services/reporteService.js');
const DetalleReporte = require('../models/DetalleReporte.js');
const crearBitacoraAuditoria = require('../middlewares/bitacoraMiddleware.js');
const ENUMS = require('../utils/constantes.js');

const insertarDetalleReporte = async (req, res) => {
    try {
        const { socketId, detalleReporte, salaId } = req.body; // <- salaId enviado desde frontend
        const result = await detalleReporteService.insertarDetalleReporte(detalleReporte);
        const resultado = await detalleReporteService.obtenerDetalleProductoServiceBySku(result.sku, result.tim);

        // Emitir a todos en la sala excepto al emisor
        if (salaId) {
            const io = socketId ? req.io.to(salaId).except(socketId) : req.io.to(salaId);
            io.emit('producto-agregado', resultado);
        }

        await crearBitacoraAuditoria({
            dni: req.usuario.dni,
            tipo: "REPORTES",
            mensaje: `Usuario ${req.usuario.nombres} agregó SKU ${resultado.sku} al reporte #${resultado.tim}.`
        });

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Detalle del reporte insertado con éxito',

            datos: resultado
        });
    } catch (error) {
        return res.status(200).json({
            success: ENUMS.ERROR,
            message: error.message,

            datos: null
        });
    }
};


const insertarLoteReporte = async (req, res) => {
    try {
        const { reportes } = req.body;

        if (!Array.isArray(reportes) || reportes.length === 0) {
            return res.status(400).json({
                success: ENUMS.ERROR,
                message: 'Se requiere un arreglo de reportes',

                datos: null
            });
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
                fechavencimiento, observacion, modificadoPor, fastRegister
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
                modificadoPor: modificadoPor ?? '',
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

        await crearBitacoraAuditoria({
            dni: req.usuario.dni,
            tipo: "REPORTES",
            mensaje: `Usuario ${req.usuario.nombres} cargó lote de ${detalles.length} detalles al reporte.`
        });

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Lote insertado con éxito Productos y Detalles ' + nuevosProductos.length + ' - ' + detalles.length,

            datos: null
        });

    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,

            datos: null
        });
    }
};


const obtenerDetallesConProducto = async (req, res) => {
    try {
        const { tim } = req.params;
        const detalles = await detalleReporteService.obtenerDetallesConProductoService(tim);
        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Detalles obtenidos con éxito',

            datos: detalles
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,

            datos: null
        });
    }
};

const updateRecibidos = async (req, res) => {
    try {
        const { id, uRecibidas, socketId, modificadoPor, salaId } = req.body

        // 🔍 Validar si la cantidad es la misma para evitar actualizaciones redundantes
        const actual = await DetalleReporte.findById(id);
        if (actual && actual.uRecibidas === uRecibidas) {
            return res.status(200).json({
                success: ENUMS.SUCCESS,
                message: 'El detalle ya tiene la misma cantidad registrada.',
                datos: actual
            });
        }

        const result = await detalleReporteService.updateRecibidos(id, uRecibidas, modificadoPor)

        if (!result) {
            return res.status(200).json({
                success: ENUMS.ERROR,
                message: 'No se encontró el reporte con ese ID',

                datos: null
            });
        }
        if (salaId) {
            const io = socketId ? req.io.to(salaId).except(socketId) : req.io.to(salaId);
            io.emit('producto-actualizado', result);
        }

        await crearBitacoraAuditoria({
            dni: req.usuario.dni,
            tipo: "REPORTES",
            mensaje: `Usuario ${req.usuario.nombres} actualizó unidades recibidas del SKU ${result.sku} en reporte #${result.tim}.`
        });

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Detalle del reporte actualizado con éxito',

            datos: result
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,

            datos: null
        });
    }
}

const updateDatosDetalle = async (req, res) => {
    try {
        const { id, uRecibidas, fechavencimiento, socketId, modificadoPor, salaId } = req.body
        const result = await detalleReporteService.updateDatos(id, uRecibidas, fechavencimiento, modificadoPor);

        if (!result) {
            return res.status(200).json({
                success: ENUMS.ERROR,
                message: 'No se encontró el reporte con ese ID',

                datos: null
            });
        }

        if (salaId) {
            const io = socketId ? req.io.to(salaId).except(socketId) : req.io.to(salaId);
            io.emit('producto-actualizado', result);
        }

        await crearBitacoraAuditoria({
            dni: req.usuario.dni,
            tipo: "REPORTES",
            mensaje: `Usuario ${req.usuario.nombres} actualizó datos del SKU ${result.sku} en reporte #${result.tim}.`
        });

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Detalle del reporte actualizado con éxito',

            datos: result
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,

            datos: null
        });
    }
}


const obtenerDetalleProducto = async (req, res) => {
    try {
        const { tim } = req.params;
        const detalles = await detalleReporteService.obtenerDetallesConProductoService(tim);
        res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Detalles obtenidos con éxito',

            datos: detalles
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,

            datos: null
        });
    }
};
const actualizarDetallePorSkus = async (req, res) => {
    try {
        const { skus } = req.body;

        if (!Array.isArray(skus) || skus.length === 0) {
            return res.status(200).json({
                success: ENUMS.ERROR,
                message: 'Lista de SKUs vacía o inválida',

                datos: resultado
            });
        }

        const resultado = await detalleReporteService.actualizarProductosPorSkus(skus);

        res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Detalles del reporte actualizados correctamente.',

            datos: resultado
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};
const obtenerDetalleProductosBySkuYMotivo = async (req, res) => {
    try {
        const { sku, motivo } = req.body;

        const tims = await reporteService.buscarReportePorMotivo(motivo); // deber ser un array de tims
        if (!Array.isArray(tims) || tims.length === 0) {
            return res.status(200).json({
                success: ENUMS.SUCCESS,
                message: 'No se encontraron reportes con ese motivo',

                datos: null
            });
        }

        const detalles = await detalleReporteService.obtenerDetalleProductoServiceBySkuYTims(sku, tims);
        if (!detalles || detalles.length === 0) {
            res.status(200).json({
                success: ENUMS.SUCCESS,
                message: 'No se encontraron detalles para ese SKU y motivo',

                datos: null
            });
        }

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Detalles obtenidos con éxito',

            datos: detalles
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};


const deleteDetalleReporte = async (req, res) => {
    try {
        const { id } = req.params;
        const { socketId, salaId } = req.body;
        const detalle = await DetalleReporte.findById(id);
        await detalleReporteService.deleteDetalleRep(id);
        if (salaId) {
            const io = socketId ? req.io.to(salaId).except(socketId) : req.io.to(salaId);
            io.emit('producto-eliminado', id);
        }

        if (detalle) {
            await crearBitacoraAuditoria({
                dni: req.usuario.dni,
                tipo: "REPORTES",
                mensaje: `Usuario ${req.usuario.nombres} eliminó SKU ${detalle.sku} del reporte #${detalle.tim}.`
            });
        }
        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Detalle del reporte eliminado con éxito',

            datos: null
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,

            datos: null
        });
    }
}


const cambiarEstadoEdicion = async (req, res) => {
    try {
        const { id, isEditing, salaId, socketId } = req.body;

        // 🛡️ Validación de Propiedad del Bloqueo:
        // Si intentan liberar (!isEditing), verificamos que este socket sea el que tiene el bloqueo
        if (!isEditing && socketId) {
            const lockInfo = global.activeLocks.get(socketId);
            if (!lockInfo || lockInfo.detailId !== id) {
                return res.status(200).json({
                    success: ENUMS.ERROR,
                    message: 'No tienes el permiso de este bloqueo originalmente',
                    datos: null
                });
            }
        }

        const editadoPor = isEditing ? req.usuario.nombres : '';

        const result = await detalleReporteService.cambiarEstadoEdicion(id, isEditing, editadoPor);

        if (!result) {
            if (isEditing) {
                // 🔍 Si falló el bloqueo, es porque alguien más lo ganó
                const ocupado = await DetalleReporte.findById(id);
                return res.status(200).json({
                    success: ENUMS.ERROR,
                    message: `El detalle ya está siendo editado por ${ocupado?.editadoPor || 'otro usuario'}`,
                    datos: ocupado
                });
            }
            return res.status(404).json({
                success: ENUMS.ERROR,
                message: 'Detalle no encontrado',
                datos: null
            });
        }

        // 📡 Notificar a otros usuarios
        if (salaId) {
            const eventName = isEditing ? 'detalle-bloqueado' : 'detalle-desbloqueado';
            const io = socketId ? req.io.to(salaId).except(socketId) : req.io.to(salaId);
            io.emit(eventName, { id, editadoPor });

            // 🏗️ Gestionar el rastro de bloqueos para auto-desbloqueo en desconexión
            if (isEditing && socketId) {
                global.activeLocks.set(socketId, { detailId: id, salaId });
            } else if (!isEditing && socketId) {
                global.activeLocks.delete(socketId);
            }
        }

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: isEditing ? 'Detalle bloqueado por edición' : 'Detalle liberado',
            datos: result
        });
    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};

module.exports = {
    insertarDetalleReporte,
    insertarLoteReporte,
    actualizarDetallePorSkus,
    updateRecibidos,
    updateDatosDetalle,
    deleteDetalleReporte,
    obtenerDetallesConProducto,
    obtenerDetalleProducto,
    obtenerDetalleProductosBySkuYMotivo,
    cambiarEstadoEdicion
};