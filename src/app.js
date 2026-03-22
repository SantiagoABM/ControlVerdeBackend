require('dotenv').config();
const express = require('express');
const http = require('http');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const pkg = require('../package.json');
const { Server } = require('socket.io');
const helmet = require("helmet");
//rutas
const initialSetUp = require('./lib/initialSetUp'); // Inicializa el usuario administrador si no existe
const testRoute = require('./routes/testRoute');
const usuarioRoute = require('./routes/usuarioRoute');
const productoRoute = require("./routes/productoRoute.js");
const reporteRoute = require("./routes/reporteRoute.js");
const detalleReporteRoute = require("./routes/detalleReporteRoute.js");
const bitacoraRoute = require("./routes/bitacoraRoute.js");
const emailRoute = require("./routes/emailRoute.js");


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: '*' }
});

initialSetUp.createAdmin(); // Llama a la función para inicializar el usuario administrador

io.on('connection', (socket) => {
    console.log('Nuevo socket conectado:', socket.id);
    socket.on('joinSala', (salaId) => {
        socket.join(salaId);
        console.log(`Socket ${socket.id} se unió a la sala ${salaId}`);
        // 🧪 Confirmación al cliente
        socket.emit('joined', salaId);
    });

    socket.on('leaveSala', (salaId) => {
        socket.leave(salaId);
        console.log(`Socket ${socket.id} abandonó la sala ${salaId}`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
});


//settings
app.set('pkg', pkg);
app.set("json spaces", 4);


//middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' }));
app.use(helmet({
    contentSecurityPolicy: false, // 🛠 Desactivar CSP temporalmente para descartar bloqueos de sockets
}));
app.use(morgan('dev'));
app.use(cors());
app.use(express.urlencoded({ extend: false }));
// Map<userId, { token, expiresAt }>
global.activeTokens = new Map();

//rutas
app.use((req, res, next) => {
    req.io = io;
    // Log para ver si los eventos se disparan con los datos correctos
    if (req.body && (req.body.salaId || req.body.socketId)) {
        console.log(`[API Request] ${req.method} ${req.url} - salaId: ${req.body.salaId}, socketId: ${req.body.socketId}`);
    }
    next();
});

app.use('/api', testRoute);
app.use("/api/email", emailRoute);
app.use("/api/bitacora", bitacoraRoute);
app.use("/api/productos", productoRoute);
app.use("/api/usuarios", usuarioRoute);
app.use("/api/reportes", reporteRoute);
app.use("/api/detallereportes", detalleReporteRoute);

module.exports = { app, server };
