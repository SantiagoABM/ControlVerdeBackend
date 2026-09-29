<<<<<<< HEAD
const { config } = require("dotenv");
config();

const PORT = process.env.PORT || 4000;
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
=======
const path = require("path");
const { config } = require("dotenv");

// Cargar el archivo .env desde la raíz del proyecto
config({ path: path.resolve(__dirname, "../.env") });

const NODE_ENV = (process.env.NODE_ENV || "desarrollo").toLowerCase().trim();

// Selección dinámica de la base de datos según el entorno
let MONGOURI;
switch (NODE_ENV) {
    case "produccion":
    case "production":
        MONGOURI = process.env.MONGO_URI_PRODUCCION;
        break;
    case "soluciones":
    case "pruebas":
    case "test":
        MONGOURI = process.env.MONGO_URI_SOLUCIONES;
        break;
    case "desarrollo":
    case "development":
    default:
        MONGOURI = process.env.MONGO_URI_DESARROLLO || "mongodb://localhost:27017/tottus";
        break;
}

if (!MONGOURI) {
    console.warn(`⚠️ Advertencia: No se encontró URI para el entorno '${NODE_ENV}'. Usando desarrollo por defecto.`);
    MONGOURI = process.env.MONGO_URI_DESARROLLO || "mongodb://localhost:27017/tottus";
}

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "22U312UI3Y12IU3Y12UEY1DYSN128Y1";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_NAME = process.env.ADMIN_NAME || "ADMIN";
const ADMIN_LASTNAME = process.env.ADMIN_LASTNAME || "PACASMAYO";
const ADMIN_DNI = process.env.ADMIN_DNI || "12345678";
const ADMIN_TIENDA = process.env.ADMIN_TIENDA || 352;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_ROL = process.env.ADMIN_ROL || "administrador";

module.exports = {
    NODE_ENV,
    PORT,
    JWT_SECRET,
    MONGOURI,
    ADMIN_EMAIL,
    ADMIN_TIENDA,
    ADMIN_PASSWORD,
    ADMIN_NAME,
    ADMIN_LASTNAME,
    ADMIN_DNI,
    ADMIN_ROL
};
>>>>>>> origin/soluciones
