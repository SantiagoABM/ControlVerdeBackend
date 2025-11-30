const usuarioService = require('../services/usuarioService');
const authMiddleware = require('../middlewares/authMiddleware');
const ENUMS = require('../utils/constantes');

exports.register = async (req, res) => {
    try {
        const usuario = await usuarioService.registrarUsuario(req.body);
        if (!usuario) {
            res.status(400).json({
                status: ENUMS.ERROR,
                message: 'No se ha podido crear el usuario.',
                isError: true,
                datos: null
            });
        };
        const token = await authMiddleware.generarToken(usuario);
        if (!token) {
            res.status(401).json({
                status: ENUMS.ERROR,
                message: 'Error al Crea el token.',
                isError: true,
                datos: null
            });
        };
        res.status(200).json({
            status: ENUMS.SUCCESS,
            message: 'Usuario creado exitosamente.',
            isError: false,
            datos: {
                token,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });
    } catch (error) {
        res.status(401).json({
            status: ENUMS.ERROR,
            message: error.message,
            isError: true,
            datos: null
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { correo, dni, password, admin } = req.body;
        let usuario;

        // 🔹 1. Login usando correo o DNI
        if (correo != null) {
            usuario = await usuarioService.autenticarUsuario(correo, password);
        } else if (dni != null) {
            usuario = await usuarioService.autenticarUsuarioPorDni(dni, password);
        } else {
            throw new Error('Debe proporcionar un correo o un DNI para iniciar sesión.');
        }

        if (!usuario) {
            return res.status(200).json({
                status: ENUMS.ERROR,
                message: "Credenciales inválidas.",
                isError: true,
                datos: null
            });
        }

        // 🔒 2. Validar acceso de administrador → por rol
        if (admin === true) {
            if (usuario.rol !== "administrador") {
                return res.status(200).json({
                    status: ENUMS.ERROR,
                    message: "Acceso denegado: el usuario no tiene rol de administrador.",
                    isError: true,
                    datos: null
                });
            }
        }

        // 🔑 3. Generar token
        const token = await authMiddleware.generarToken(usuario);

        // 🗃 4. Guardar token vivo en servidor
        activeTokens.set(usuario._id.toString(), {
            token,
            expiresAt: Date.now() + 3600 * 1000 // 1 hora
        });

        // 🚀 5. Respuesta final
        res.status(200).json({
            status: ENUMS.SUCCESS,
            message: admin ? "Inicio de sesión administrador exitoso." : "Inicio de sesión exitoso.",
            isError: false,
            datos: {
                token,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });

    } catch (error) {
        res.status(401).json({
            status: ENUMS.ERROR,
            message: error.message,
            isError: true,
            datos: null
        });
    }
};

