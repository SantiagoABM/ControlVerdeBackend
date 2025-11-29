const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'secreto';
const bcrypt = require('bcryptjs');

exports.encriptarPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

exports.verificarPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
}

exports.generarToken = (usuario) => {
  return jwt.sign({ id: usuario._id, rol: usuario.rol }, SECRET, { expiresIn: '2h' });
}

exports.verificarToken = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  // Limpieza de formato: "Bearer xxxx"
  token = token.replace("Bearer ", "").trim();

  try {
    // Validar estructura y firma del JWT
    const decoded = jwt.verify(token, SECRET);
    const userId = decoded.id;

    // Buscar el token activo en el servidor
    const serverToken = activeTokens.get(userId);

    if (!serverToken) {
      return res.status(401).json({
        succes: false,
        code: 4,
        mensaje: "Token expirado, eliminado o no registrado en el servidor"
      });
    }

    // Verificar que el token coincida exactamente
    if (serverToken.token !== token) {
      return res.status(401).json({
        succes: false,
        code: 4,
        mensaje: "Token inválido: se ha generado un nuevo token. Inicia sesión nuevamente."
      });
    }

    // Verificar expiración manual del servidor
    if (Date.now() > serverToken.expiresAt) {
      activeTokens.delete(userId);
      return res.status(401).json({
        succes: false,
        code: 4,
        mensaje: "Token expirado"
      });
    }

    // Todo correcto: pasamos el usuario al request
    req.usuario = decoded;
    next();

  } catch (err) {
    return res.status(401).json({
      succes: false,
      code: 4,
      mensaje: "Token inválido o expirado"
    });
  }
};

// exports.ValidarAdmin = (req, res, next) => {
//   const rolesUsuario = 
//   if (!rolesUsuario.includes('administrador')) {
//     return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol de administrador' });
//   }
//   next();
// }

exports.requiereRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    console.log(req.usuario)
    const rolUsuario = req.usuario.rol;
    const autorizado = rolesPermitidos.includes(rolUsuario);

    if (!autorizado) {
      return res.status(403).json({ succes: false, code: 5, mensaje: 'Acceso denegado' });
    }

    next();
  };
};
