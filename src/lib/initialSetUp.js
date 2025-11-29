const usuarioService = require('../services/usuarioService');
const Usuario = require('../models/Usuario');
const env = require('../config');

exports.createAdmin = async () => {
  // check for an existing admin user
  const userFound = await Usuario.findOne({ correo: env.ADMIN_EMAIL });
  console.log(userFound);
  if (userFound) return;
  const newUser = await usuarioService.registrarUsuario({
    nombre: env.ADMIN_NAME,
    apellido: env.ADMIN_LASTNAME,
    dni: env.ADMIN_DNI,
    correo: env.ADMIN_EMAIL,
    tienda: env.ADMIN_TIENDA,
    password: env.ADMIN_PASSWORD,
    rol: env.ADMIN_ROL,
    esAdmin: true
  });
  console.log(`new user created: ${newUser.correo}`);
};