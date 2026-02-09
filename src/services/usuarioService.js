const Usuario = require('../models/Usuario');
const authMiddleware = require('../middlewares/authMiddleware.js');

exports.registrarUsuario = async (datos) => {
    const { dni, rol } = datos;

    // 1. Validación
    const existente = await Usuario.findOne({ dni });
    if (existente) throw new Error('El DNI ya está registrado.');

    // 2. Generar password temporal (dni sin los últimos 2 dígitos)
    const generarPassword = (doc) => String(doc).slice(0, -2);

    const passwordPlano = generarPassword(dni);

    // 3. Hashear contraseña
    const hashedPassword = await authMiddleware.encriptarPassword(passwordPlano);

    // 4. Crear nuevo usuario
    const nuevoUsuario = new Usuario({
        ...datos,
        password: hashedPassword,
        rol
    });

    return await nuevoUsuario.save();
};


exports.autenticarUsuario = async ({ correo, password }) => {
    const usuario = await Usuario.findOne({ correo, activo: true });
    if (!usuario) throw new Error('Credenciales por correo inválidas.');

    const match = await authMiddleware.verificarPassword(password, usuario.password);
    if (!match) throw new Error('Credenciales por correop inválidas.');
    return usuario;
};

exports.autenticarUsuarioPorDni = async (dni, password) => {
    const usuario = await Usuario.findOne({ dni, activo: true });
    if (!usuario) throw new Error('Credenciales por dni inválidas.');

    const match = await authMiddleware.verificarPassword(password, usuario.password);
    if (!match) throw new Error('Credenciales por dnip inválidas.');
    return usuario;
};

exports.autenticarAdmin = async ({ correo, password }) => {

    const usuario = await Usuario.findOne({ correo: correo, esAdmin: true, activo: true });
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

exports.obtenerValoresUnicos = async (campo) => {
    return await Usuario.distinct(campo);
}

exports.buscarUsuarioPorDni = async (correo) => {
    if (!correo) throw new Error('Dni de usuario requerido.');
    const usuario = await Usuario.findOne({ dni: dni });
    if (!usuario) throw new Error('Usuario no encontrado.');
    return usuario;
};
exports.filtrarUsuarios = async (filtros) => {
    const { nombre, correo, rol, activo, dni } = filtros;

    const query = {};

    if (nombre) query.nombre = { $regex: nombre, $options: "i" };
    if (correo) query.correo = { $regex: correo, $options: "i" };
    if (rol) query.rol = rol;
    if (dni) query.dni = dni;
    if (activo !== undefined) query.activo = activo;
    const usuarios = await Usuario.find(query).select('-password'); // No devolver password

    return usuarios;
}

exports.actualizarUsuario = async (id, data) => {
    const camposPermitidos = [
        "dni",
        "telefono",
        "tienda",
        "correo",
        "nombre",
        "apellido",
        "rol",
        "esAdmin",
        "activo"
    ];

    // Filtrar campos no permitidos (evitar sobreescritura de password o dni)
    const datosActualizados = {};
    for (const key of camposPermitidos) {
        if (data[key] !== undefined) {
            datosActualizados[key] = data[key];
        }
    }

    const usuario = await Usuario.findByIdAndUpdate(id, datosActualizados, {
        new: true,
        runValidators: true,
    }).select('-password');

    return usuario;
}