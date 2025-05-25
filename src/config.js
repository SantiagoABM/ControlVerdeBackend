const { config } = require("dotenv");
config();

const PORT = process.env.PORT || 3400;

module.exports = {
    PORT
}