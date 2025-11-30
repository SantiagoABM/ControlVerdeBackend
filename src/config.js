const { config } = require("dotenv");
config();

const PORT = process.env.PORT || 3000;
const BANDERA = true;// true para produccion, false para desarrollo
// const MONGOURI = BANDERA ? process.env.MONGO_URI_PRODUCCION || "mongodb+srv://barbozamujica109:tysonryx123@tottus.tvsqbky.mongodb.net/controlverde?retryWrites=true&w=majority&appName=Tottus" : process.env.MONGO_URI_DESARROLLO || "mongodb://localhost:27017/tottus";
const MONGOURI = BANDERA ? process.env.MONGO_URI_SOLUCIONES || "mongodb+srv://barbozamujica109:tysonryx123@tottus.tvsqbky.mongodb.net/controlverdePrueba?retryWrites=true&w=majority&appName=Tottus" : process.env.MONGO_URI_DESARROLLO || "mongodb://localhost:27017/tottus";
const JWT_SECRET = process.env.JWT_SECRET || "22U312UI3Y12IU3Y12UEY1DYSN128Y1";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_NAME = process.env.ADMIN_NAME || "ADMIN";
const ADMIN_LASTNAME = process.env.ADMIN_LASTNAME || "PACASMAYO";
const ADMIN_DNI = process.env.ADMIN_DNI || "12345678";
const ADMIN_TIENDA = process.env.ADMIN_TIENDA || 352;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_ROL = process.env.ADMIN_ROL || "administrador";


module.exports = {
    PORT,
    JWT_SECRET,
    MONGOURI,
    ADMIN_EMAIL,
    BANDERA,
    ADMIN_TIENDA,
    ADMIN_PASSWORD,
    ADMIN_NAME,
    ADMIN_LASTNAME,
    ADMIN_DNI,
    ADMIN_ROL
}