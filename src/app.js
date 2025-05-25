const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const pkg = require('../package.json');
const helmet = require("helmet");
//rutas
const productoRoute = require("./routes/productoRoute.js");


const app = express();

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
app.use("/api/productos", productoRoute);

module.exports = app;