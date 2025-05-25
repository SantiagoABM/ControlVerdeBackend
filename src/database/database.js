const mongoose = require('mongoose');

const uri = "mongodb+srv://barbozamujica109:tysonryx123@tottus.tvsqbky.mongodb.net/controlverde?retryWrites=true&w=majority&appName=Tottus";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err));



