const mongoose = require('mongoose');
const config = require('../config');

const uri = config.MONGOURI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ Conectado a Base de Datos" ))
  .catch((err) => console.error("❌ Error conectando a Base de Datos:", err));



