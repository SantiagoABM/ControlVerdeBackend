const { authorize, allowAnonymous } = require("../middleware/auth");

// Decorador estilo ASP.NET
function Authorize(handler) {
  return [authorize, handler];
}

function AllowAnonymous(handler) {
  return [allowAnonymous, handler];
}

module.exports = {
  Authorize,
  AllowAnonymous,
};
