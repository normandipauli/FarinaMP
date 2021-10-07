const express = require('express');
const helmet = require('helmet');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require("path");
const { log, errorHandler } = require('./lib');


//const bcrypt = require('bcrypt');
process.env.JWT_SECRET_KEY = 'FVending748596';
process.env.JWT_EXPIRES_IN = '1d';

// para usar factory
require('express-di');

const app = express();

//Analiza las solicitudes entranes, para el req.body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Seguridad Web
app.use(helmet());
app.disable('x-powered-by'); // deshabilitado por seguridad

//set mode
let mode = '';
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_ENV = 'development';
  mode = 'development';
}

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

//levanto el archivo .env
const basePath = path.join(__dirname, '..', `.env`);
const devPath = path.join(__dirname, '..', `.env${mode ? `.${mode}` : ``}`);
const env = dotenv.config({ path: devPath });
const envDev = dotenv.config({ path: basePath });
//console.log(basePath);
//console.log(process.env);

//agrego todas las rutas
const routes = require('./routes')(app);

// Manejador de Errores Global
app.use(errorHandler);

//MySql Connection
const pool  = mysql.createPool({
  connectionLimit : process.env.APP_DB_CONNECTIONLIMIT,
  host            : process.env.APP_DB_HOST, //'us-cdbr-east-02.cleardb.com',
  port            : process.env.APP_DB_PORT, //3306
  user            : process.env.APP_DB_USER,  // 'bda47a302213bb',
  password        : process.env.APP_DB_PASSWORD, //'674fe805',
  database        : process.env.APP_DB_DATABASE, // 'heroku_94c32ddaa223cec'
  multipleStatements: process.env.APP_DB_MULTIPLESTATEMENTS
});

//acquire This event emits a connection is acquired from pool.
//connection  This event is emitted when a new connection is added to the pool. Has a connection object parameter
//enqueue This event is emitted when a command cannot be satisfied immediately by the pool and is queued.
//release This event is emitted when a connection is released back into the pool. Has a connection object parameter
pool.on('acquire', function (connection) {
  //console.log(`[MySql][acquire]`);
});

pool.on('connection', function (connection) {
  //console.log(`[MySql][connection] ${connection.connectionId}`);
  connection.query('SET GLOBAL event_scheduler = 1;');
  //connection.query('SET SESSION auto_increment_increment=1')
});

pool.on('enqueue', function (connection) {
  //console.log(`[MySql][enqueue]`);
});

pool.on('release', function (connection) {
  //console.log(`[MySql][release]`);
});

app.factory('db', (req, res, next) => {
  next(null, pool);
});

/*
pool.getConnection((err, conn) => {
  app.factory('db', (req, res, next) => {
    next(null, conn);
  });
})
*/
/*
pool.getConnection((err, conn) => {
  log.defaultMeta = { Sistema: process.env.APP_ID_SISTEMA, db: conn };
});
*/
log.defaultMeta = { Sistema: process.env.APP_ID_SISTEMA, db: pool };

/*
pool.getConnection()
.then(conn => {
  //inyecta como db la conexion a MySql en todos los llamados 
  app.factory('db', (req, res, next) => {
    next(null, conn);
  });
  // Seteo usuario y pc activa
  log.defaultMeta = { Sistema: process.env.APP_ID_SISTEMA, db: conn };
}).catch(err => {
  //not connected
  console.log(`[MySql][ERROR] ${err}`);
});
*/
app.get('/', function(req, res, next) {
  res.send('funciona');
});

app.use(express.static('assets'));
app.use('/assets', express.static(__dirname + '/assets'));
var PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`El servidor está inicializado en el puerto ${PORT}`);
});
