const mongoose = require('mongoose');
const config = require('../config');

const uri = config.MONGOURI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ Conectado a MongoDB Atlas " + uri))
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err));



