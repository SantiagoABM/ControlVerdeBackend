const Usuario = require('../models/Usuario');
const authMiddleware = require('../middlewares/authMiddleware.js');

exports.registrarUsuario = async (datos) => {
    const { correo, password, rol } = datos;
    const existente = await Usuario.findOne({ correo });
    if (existente) throw new Error('El correo ya está registrado.');

    const hashedPassword = await authMiddleware.encriptarPassword(password);
    const nuevoUsuario = new Usuario({
        ...datos,
        password: hashedPassword,
        rol: rol
    });
    return await nuevoUsuario.save();
};


exports.autenticarUsuario = async ({ correo, password }) => {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) throw new Error('Credenciales inválidas.');

    const match = await authMiddleware.verificarPassword(password, usuario.password);
    if (!match) throw new Error('Credenciales inválidas.');
    return usuario;
};

exports.autenticarUsuarioPorDni = async (dni, password) => {
    const usuario = await Usuario.findOne({ dni });
    if (!usuario) throw new Error('Credenciales inválidas.');

    const match = await authMiddleware.verificarPassword(password, usuario.password);
    if (!match) throw new Error('Credenciales inválidas.');
    return usuario;
};

exports.autenticarAdmin = async ({ correo, password }) => {
    console.log(correo, password)
    const usuario = await Usuario.findOne({ correo: correo, esAdmin: true });
    if (!usuario) throw new Error('Credenciales de administrador inválidas.');
    const match = await authMiddleware.verificarPassword(password, usuario.password);
    if (!match) throw new Error('Credenciales de administrador inválidas.');
    return usuario;
}

exports.buscarUsuarioPorCorreo = async (correo) => {
    if (!correo) throw new Error('Correo de usuario requerido.');
    const usuario = await Usuario.findOne({ correo: correo });
    if (!usuario) throw new Error('Usuario no encontrado.');
    return usuario;
};

exports.buscarUsuarioPorDni = async (correo) => {
    if (!correo) throw new Error('Dni de usuario requerido.');
    const usuario = await Usuario.findOne({ dni: dni });
    if (!usuario) throw new Error('Usuario no encontrado.');
    return usuario;
};