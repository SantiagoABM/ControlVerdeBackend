require('./database/database');
const { server } = require('./app');
const { PORT } = require('./config');

async function startServer() {

    server.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
}

startServer();
