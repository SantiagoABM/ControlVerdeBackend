const jwt = require("jsonwebtoken");
const { getUserToken } = require("../utils/token-store");

function authorize(req, res, next) {
  const auth = req.headers["authorization"];

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token requerido" });
  }

  const token = auth.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Validar que el token coincida con el almacenado en el servidor
    const serverToken = getUserToken(payload.id);

    if (!serverToken || serverToken.token !== token)
      return res.status(401).json({ message: "Token inválido o reemplazado" });

    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

function allowAnonymous(req, res, next) {
  next(); // simple
}

module.exports = {
  authorize,
  allowAnonymous
};
