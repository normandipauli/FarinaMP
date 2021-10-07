
const log = require('./log');
// const log = console;


function errorHandler(err, req, res, next) {

  // Seteo los valores actuales de usuario y pcName
  log.defaultMeta.req = req;
  log.defaultMeta.req = req;


  let msg = '';
  if (res.headersSent) {
    log.error(err, { label: 'ERROR', detalle: 'Headers ya enviados' });
    return next(err);
  }

  if (typeof (err) === 'string') {
    // custom application error
    log.error(err, { label: 'ERROR' });
    return res.status(400).json({ recordset: null, error: msg, msg });
  }

  if (err.message === 'UnauthorizedError') {
    // 401 (Unauthorized) Acceso no Autorizado (No tiene credenciales validas)
    msg = 'No tiene credenciales validas';
    log.error(`Acceso no Autorizado ${msg}`, { label: 'UnauthorizedError', err });
    return res.status(401).json({ recordset: null, error: msg, msg });
  }

  if (err.message === 'ForbiddenError') {
    // 403 (Forbidden) Acceso Prohibido (No tiene permisos suficientes)
    msg = `No tiene permisos suficientes`;
    log.error(`Acceso Prohibido ${msg}`, { label: 'ForbiddenError', err });
    return res.status(403).json({ recordset: null, error: msg, msg });
  }

  // default to 500 server error
  msg = err.message;
  log.error(err, { label: 'ERROR' });
  return res.status(500).json({ recordset: null, error: msg, msg });
}

module.exports = errorHandler;
