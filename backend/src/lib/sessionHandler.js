const session = require('express-session');
const RedisStore = require('connect-redis')(session);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const lport = parseInt(val, 10);

  if (Number.isNaN(lport)) {
    // named pipe
    return val;
  }

  if (lport >= 0) {
    // port number
    return lport;
  }

  return false;
}

const conf = {
  name: process.env.APP_SESSION_NAME,
  secret: process.env.APP_SESSION_SECRET,
  proxy: process.env.APP_SESSION_PROXY === 'true',
  saveUninitialized: process.env.APP_SESSION_SAVE_UNINITIALIZED  === 'true',
  resave: process.env.APP_SESSION_RESAVE === 'true',
  unset: process.env.APP_SESSION_UNSET,
  cookie: {
    httpOnly: process.env.APP_COOKIE_HTTPONLY === 'true',
    secure: process.env.APP_COOKIE_SECURE === 'true',
    sameSite: process.env.APP_COOKIE_SAMESITE,
    maxAge: parseInt(process.env.APP_COOKIE_MAXAGE),
  },
};
if (process.env.APP_REDIS_ENABLED === 'true') {
  conf.store = new RedisStore({
    host: process.env.APP_REDIS_HOST,
    port: normalizePort(process.env.APP_REDIS_PORT),
    prefix: process.env.APP_REDIS_PREFIX,
    pass: process.env.APP_REDIS_PASS,
  });
}
// Session Factory
function sessionHandler() {
  const sessionMiddleware = session(conf);
  // Middleware para reintentar si no se puede conectar al store de la session
  function middleware(req, res, next) {
    let tries = 3;
    const lookupSession = (error) => {
      if (error) {
        return next(error);
      }

      tries -= 1;

      if (req.session !== undefined) {
        return next();
      }

      if (tries < 0) {
        return next(new Error('oh no'));
      }
      return sessionMiddleware(req, res, lookupSession);
    };
    lookupSession();
  }
  return middleware;
}

module.exports = sessionHandler;
