const moment = require('moment-timezone');
const { createLogger, format, transports } = require("winston");
const dbTransport = require("./logDBTransport");

const {
  combine,
  colorize,
  timestamp,
  simple,
  errors,
  json,
  printf
} = format;

const myFormat =  printf (
          // info => `${info.timestamp} ${info.userName}@${info.pcName} [${info.level}]: ${info.message}`
          info => {
            const { timestamp, level, message, req } = info;

            if (req) {
              const pcName = req.machineName || req.ip.split(':').pop();
              const {originalUrl} = req;
              let userName = '';
              if (req.session  && req.session.user) {
                userName = req.session.user.username || req.body.user_Id || 'NoSeteado';
              } else {
                userName = req.body.username || req.body.user_Id || 'NoSeteado';
              }
              return `${timestamp} ${userName}@${pcName} [${level}]:${message} [url]:${originalUrl}`;
            }
            else
              return `${info.timestamp} [${info.level}]: ${info.message}`;
          }
        )

const appendTimestamp = format((info, opts) => {
  if(opts.tz)
    info.timestamp = moment().tz(opts.tz).format();
  return info;
});

const logger = createLogger({
  level: "info",
  defaultMeta: { userName: "undefined", pcName: "undefined" },
  format: combine(
    errors({ stack: true }),
    /* timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }), */
    appendTimestamp({ tz: 'America/Argentina/Buenos_Aires' }),
    json()
  )

});


if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      handleExceptions: true,
      format: combine(
        errors({ stack: true }),
        appendTimestamp({ tz: 'America/Argentina/Buenos_Aires' }),
        /*
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss"
        }),
        */
        colorize(),
        simple(),
        myFormat,
      )
    })
  );
} else {
  //Agrego el log en la db
  logger.add(
    new dbTransport({
      handleExceptions: true
    })
  );
  //Agrego un log x consola, solo errores
  logger.add(
    new transports.Console({
      handleExceptions: true,
      level: "error",
      format: combine(
        errors({ stack: true }),
        appendTimestamp({ tz: 'America/Argentina/Buenos_Aires' }),
        /*
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss"
        }),
        */
        colorize(),
        simple(),
        myFormat,
        /*
        printf(
          // info => `${info.timestamp} ${info.userName}@${info.pcName} [${info.level}]: ${info.message}`
          info => {
            const { timestamp, level, message, req } = info;

            if (req) {
              const pcName = req.machineName || req.ip.split(':').pop();
              const {originalUrl} = req;
              let userName = '';
              if (req.session && req.session.user) {
                userName = req.session.user.username || req.body.user_Id || 'NoSeteado';
              } else {
                userName = req.body.username || req.body.user_Id || 'NoSeteado';
              }
              return `${timestamp} ${userName}@${pcName} [${level}]:${message} [url]:${originalUrl}`;
            }
            else
              return `${info.timestamp} [${info.level}]: ${info.message}`;
          }
        )
        */
      )
    })
  );
}

//Agregar
class Logger {
  constructor() {
    if (Logger.prototype.instance) {
      return Logger.prototype.instance;
    }
    this.logger = logger;
    Logger.prototype.instance = this;
  }
}

module.exports = (() => {
  if (Logger.prototype.instance) {
    return Logger.prototype.instance;
  }
  Logger.prototype.instance = logger;
  return logger;
})();

