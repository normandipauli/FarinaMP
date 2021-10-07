const Transport = require("winston-transport");
const LogSistemaRepository = require('../repositories/logSistemaRepository');

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
module.exports = class dbTransport extends Transport {
  log(info, callback) {
    const self = this;
    const { timestamp, level, message, Sistema, db, req } = info;

    const params = {
      Sistema: Sistema,
      FechaEvento: timestamp,
      Nivel: level,
      Mensaje: message,
      Usuario: '',
      Estacion: '',
      Ip: '',
    };

    if (req) {
      params.Estacion = req.machineName || req.ip.split(':').pop();
      params.Ip = req.ip.split(':').pop();
      params.Mensaje = `${params.Mensaje} [url]: ${req.originalUrl}`;
      if (req.session && req.session.user) {
        params.Usuario = req.session.user.username || req.body.user_Id || 'NoSeteado';
      } else {
        params.Usuario = req.body.username || req.body.user_Id || 'NoSeteado';
      }
    }

    if (db) {
        LogSistemaRepository.Agregar(db, params)
        .then(result => {
          self.emit("logged", info);
        })
        .catch(err => { // Error al Preparar Statement
          self.emit('error', err);
          console.error(`[SqlServer][ERROR] ${err}`);
        });
    }

    callback();

  }
};