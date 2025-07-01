const { config } = require("dotenv");
config();

const PORT = process.env.PORT || 3400;
const MONGOURI = process.env.URL_MONGO || "mongodb+srv://barbozamujica109:";


module.exports = {
    PORT,
    MONGOURI
}