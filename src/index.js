require('./database/database');
const app = require('./app');
const { PORT } = require('./config');

async function startServer() {

    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
}

startServer();
