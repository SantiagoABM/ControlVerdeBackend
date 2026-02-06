const usuarioService = require('../services/usuarioService');
const crearBitacoraAuditoria = require('../middlewares/bitacoraMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const ENUMS = require('../utils/constantes');

exports.register = async (req, res) => {
    try {
        const user = req.usuario;
        const usuario = await usuarioService.registrarUsuario(req.body);
        if (!usuario) {
            return res.status(400).json({
                success: ENUMS.ERROR,
                message: 'No se ha podido crear el usuario.',
                datos: null
            });
        };
        // const token = await authMiddleware.generarToken(usuario);
        // if (!token) {
        //     return res.status(401).json({
        //         success: ENUMS.ERROR,
        //         message: 'Error al Crea el token.',
        //         datos: null
        //     });
        // };
        await crearBitacoraAuditoria({
            dni: user.dni,
            tipo: "USUARIOS",
            mensaje: `Usuario ${user.nombres} registró un nuevo usuario ${req.body.nombre} ${req.body.apellido}.`
        });
        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: 'Usuario creado exitosamente.',

            datos: {
                // token,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });
    } catch (error) {
        return res.status(401).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { correo, dni, password, admin } = req.body;
        let usuario;
        console.log(req.body)
        // 🔹 1. Login usando correo o DNI
        if (correo != null) {
            usuario = await usuarioService.autenticarUsuario(correo, password);
        } else if (dni != null) {
            usuario = await usuarioService.autenticarUsuarioPorDni(dni, password);
            console.log(usuario)
        } else {
            return res.status(200).json({
                success: ENUMS.ERROR,
                message: "Se requiere correo o DNI para iniciar sesión.",
                datos: null
            });
        }

        if (!usuario) {
            return res.status(200).json({
                success: ENUMS.ERROR,
                message: "Credenciales inválidas.",
                datos: null
            });
        }

        // // 🔒 2. Validar acceso de administrador → por rol
        // if (admin === true) {
        //     console.log("Validando acceso de administrador para:", usuario.correo);
        //     if (usuario.rol !== "administrador" || usuario.rol !== "supervisor") {
        //         console.log("Acceso denegado: el usuario no tiene rol de administrador.");
        //         return res.status(200).json({
        //             success: ENUMS.ERROR,
        //             message: "Acceso denegado: el usuario no tiene rol de administrador.",
        //             datos: null
        //         });
        //     }
        // }

        // 🔑 3. Generar token
        const token = await authMiddleware.generarToken(usuario);

        // 🗃 4. Guardar token vivo en servidor
        activeTokens.set(usuario._id.toString(), {
            token,
            expiresAt: Date.now() + 3600 * 1000 // 1 hora
        });

        console.log("Exito login usuario:", usuario.nombre);
        // 🚀 5. Respuesta final
        await crearBitacoraAuditoria({
            dni: usuario.dni,
            tipo: "AUTH",
            mensaje: `Usuario ${usuario.nombre} ${usuario.apellido} inició sesión.`
        });
        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: admin ? "Inicio de sesión administrador exitoso." : "Inicio de sesión exitoso.",
            datos: {
                token,
                nombre: usuario.nombre + " " + usuario.apellido,
                rol: usuario.rol,
                updatePass: usuario.updatePass
            }
        });

    } catch (error) {
        return res.status(401).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};

exports.buscarUsuarios = async (req, res) => {
    try {
        const filtros = req.body;

        const usuarios = await usuarioService.filtrarUsuarios(filtros);

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: "Usuarios obtenidos",
            datos: usuarios
        });

    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
}

exports.actualizarUsuario = async (req, res) => {
    try {
        const usuario = req.usuario;
        const { id } = req.params;
        const data = req.body;

        const usuarioActualizado = await usuarioService.actualizarUsuario(id, data);

        if (!usuarioActualizado) {
            return res.status(404).json({
                success: ENUMS.ERROR,
                message: "Usuario no encontrado",
                datos: null
            });
        }
        await crearBitacoraAuditoria({
            dni: usuario.dni,
            tipo: "USUARIOS",
            mensaje: `Usuario ${usuario.nombre} ${usuario.apellido} cambió datos del usuario ${usuarioActualizado.nombre} ${usuarioActualizado.apellido}.`
        });
        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: "Usuario actualizado correctamente",
            datos: usuarioActualizado
        });

    } catch (error) {
        return res.status(400).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
}
exports.obtenerListaUnica = async (req, res) => {
    try {
        const { campo } = req.params;

        // Validar campo permitido para evitar inyección
        const camposPermitidos = [
            "rol"
        ];

        if (!camposPermitidos.includes(campo)) {
            return res.status(400).json({
                success: ENUMS.ERROR,
                message: "Campo no permitido",
                datos: null
            });
        }

        const valores = await usuarioService.obtenerValoresUnicos(campo);

        return res.status(200).json({
            success: ENUMS.SUCCESS,
            message: "Valores obtenidos",
            datos: valores
        });

    } catch (error) {
        return res.status(500).json({
            success: ENUMS.ERROR,
            message: error.message,
            datos: null
        });
    }
};

