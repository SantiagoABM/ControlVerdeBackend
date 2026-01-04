const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'secreto';
const bcrypt = require('bcryptjs');
const ENUMS = require('../utils/constantes.js');

exports.encriptarPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

exports.verificarPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
}

exports.obtenerNombreUsuarioDesdeToken = () => {
  try {
    const serverToken = activeTokens.get(userId);

    const decoded = jwt.verify(serverToken, SECRET);
    return decoded.nombre;
  } catch (err) {
    return res.status(403).json({
      success: ENUMS.ERROR,
      message: "Token inválido",
      datos: null
    });
  }
}

exports.generarToken = (usuario) => {
  return jwt.sign({ id: usuario._id, rol: usuario.rol }, SECRET, { expiresIn: '2h' });
}

exports.verificarToken = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(402).json({ mensaje: "Token no proporcionado" });
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
      return res.status(403).json({
        success: ENUMS.ERROR,
        message: "Token inválido",

        datos: null
      });
    }

    // Verificar que el token coincida exactamente
    if (serverToken.token !== token) {
      return res.status(403).json({
        success: ENUMS.ERROR,
        message: 'Token inválido: Inicie sesión nuevamente',
        
        datos: null
      });
    }

    // Verificar expiración manual del servidor
    if (Date.now() > serverToken.sAt) {
      activeTokens.delete(userId);
      return res.status(403).json({
        success: ENUMS.ERROR,
        message: 'Su sesión ha expirado, por favor inicie sesión nuevamente',
        
        datos: null
      });
    }

    // Todo correcto: pasamos el usuario al request
    req.usuario = decoded;
    next();

  } catch (err) {
    return res.status(403).json({
      success: ENUMS.ERROR,
      message: err.message,
      
      datos: null
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
