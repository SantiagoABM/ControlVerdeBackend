const express = require('express');
const http = require('http');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const pkg = require('../package.json');
const { Server } = require('socket.io');
const helmet = require("helmet");
//rutas
const testRoute = require('./routes/testRoute');
const productoRoute = require("./routes/productoRoute.js");
const reporteRoute = require("./routes/reporteRoute.js");
const detalleReporteRoute = require("./routes/detalleReporteRoute.js");


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: '*' }
});
    
io.on('connection', (socket) => {
    console.log('Nuevo socket conectado:', socket.id);
    socket.on('joinSala', (salaId) => {
        socket.join(salaId);
        console.log(`Socket ${socket.id} se unió a la sala ${salaId}`);
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
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.urlencoded({ extend: false }));

//rutas
app.use((req, res, next) => {
    req.io = io;
    next();
});
app.use('/api', testRoute);
app.use("/api/productos", productoRoute);
app.use("/api/reportes", reporteRoute);
app.use("/api/detallereportes", detalleReporteRoute);

module.exports = { app, server };
