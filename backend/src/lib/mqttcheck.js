const moment = require('moment-timezone');
const mqtt = require('mqtt');
const log = require('./log');
const alertcli = require('./alertcli');
const mqttcli = require('./mqttcli');
const PosRepository = require('../repositories/PosRepository');
const ComunicacionAuditRepository = require('../repositories/ComunicacionAuditRepository');


const checker = {
  client: null,
  db: null,
  listPos: [],
  monitorProc: null,
  isMonitor: false,
  timeIntervalPos: 0,

  gettimeIntervalPos() {
    return this.timeIntervalPos ? this.timeIntervalPos : parseInt(process.env.APP_MQTT_CHECKPOSTIME);
  },

  isConnected() {
    if (!this.client) {
      return false;
    }
    return this.client.connected;
  },

  isSubscribe() {
    const subscribeTopic = `${process.env.APP_MQTT_SUBSRIBEPATH}#`;
    if (!this.client) {
      return false;
    }
    return (subscribeTopic in this.client._resubscribeTopics);
  },

  bufferToString(buffer) {
    let result = '';
    for (var i = 0; i < buffer.length; i++) {
      result += `${buffer[i].toString()}|`;
    }
    return result;
  },

  //connect ***********************************************************************
  connect(dbParam) {
    const self = this;
    this.db = dbParam;
    return new Promise((resolve, reject) => {
      self.client = mqtt.connect(
        process.env.APP_MQTT_HOST,
        { 
          username: process.env.APP_MQTT_USERNAME, 
          password: process.env.APP_MQTT_PASSWORD,
        }
      )
      self.client.on('connect', () => {
        resolve(self.client);
      });
      self.client.on('fail', (err) => {
        log.error(`[MQTT][connect] ${err}`);
        reject(err);
      });
    });
  },

  end() {
    const self = this;
    return new Promise((resolve, reject) => {

      self.listPos.forEach(el => {
        clearInterval(el.checkProc);
        clearInterval(el.evaluateProc);
        el.checkProc = null;
        el.evaluateProc = null;
      });
      self.listPos = [];

      clearInterval(self.monitorProc);//stop proce
      self.isMonitor = false;

      self.client.end();
      self.client.on('end', () => {
        resolve();
      });
      self.client.on('error', (err) => {
        reject(err);
      });
    });
  },

  onMessage(self, topic, bufferRta) {
    //const fecha = new Date();
    const FechaHoraFin = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss'); //fecha.toISOString().replace('T', ' ').replace('Z', '')
    const MsgRecibido = self.bufferToString(bufferRta);
    const mqttCommandRta = String.fromCharCode(bufferRta.readUInt8(0));

    if (mqttCommandRta !== process.env.APP_MQTT_COMSTATUS) return; //solo acepto mensajes de status.

    if (bufferRta.length !== parseInt(process.env.APP_MQTT_COMSTATUSLENGTH)) {
      log.error(`[MQTT][onMessage] ${topic} longitud incorrecta ${MsgRecibido}`);
      return;
    }

    const idComunicacionRta = parseInt(bufferRta.readUInt32LE(1));
    const WifiGsm = String.fromCharCode(bufferRta.readUInt8(5));
    const Resultado = 'S';

    const paramsRta = {
      idComunicacion: idComunicacionRta,
      FechaHoraFin,
      Resultado,
      WifiGsm,
      MsgRecibido,
    }

    ComunicacionAuditRepository.ModificarFin(self.db, paramsRta)
    .catch((err) => {
      log.error(`[MQTT][onMessage] ${topic} ${err}`);
    });

    mqttcli.eventoParse(self.db, topic, FechaHoraFin, bufferRta)
    .catch((err) => {
      log.error(`[MQTT][onMessage] ${topic} ${err}`);
    });

  },

  subscribe() {
    const subscribeTopic = `${process.env.APP_MQTT_SUBSRIBEPATH}#`;
    const self = this;
    return new Promise((resolve, reject) => {
      if (!self.isConnected) reject('No se encuentra conectado');

      //Se subscribe
      self.client.subscribe(subscribeTopic, {qos: 0}, function (err) {
        if (!err) {
          self.client.on('message', (topic, message) => {
            self.onMessage(self, topic, message);
          });
          resolve();
        } else {
          log.error(`[MQTT][subscribe] ${err}`);
          reject(err);
        }
      });
    });
  },

  checkPos(self, pos) {
    //const fecha = new Date();
    const FechaHoraInicio = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss'); // fecha.toISOString().replace('T', ' ').replace('Z', '')
    const mqttCommand = process.env.APP_MQTT_COMSTATUS;
    const bufferMsg = Buffer.alloc(5);

    bufferMsg.write(mqttCommand, 0);
    bufferMsg.writeUInt32LE(0, 1);
    let MsgEnviado = self.bufferToString(bufferMsg);


    const params = {
      idComunicacion: 0,
      idPos: pos.idPos,
      FechaHoraInicio,
      MsgEnviado,
      SYSSincronizado: 0,
      SYSBajaLogica: 0,
    }

    ComunicacionAuditRepository.Agregar(self.db, params)
    .then((result) => {

      const idComunicacion = result[0][0].idComunicacion;
      const NroSerie = result[0][0].NroSerie;
      bufferMsg.writeUInt32LE(idComunicacion, 1);
      MsgEnviado = self.bufferToString(bufferMsg);
      const publishTopic = `${process.env.APP_MQTT_PUBLISHPATH}${NroSerie}`;
      //Send Status
      self.client.publish(publishTopic, bufferMsg, {qos: 1}, (err) => {
        if (!err) {
          //en caso de lograr establecer 
        } else {
          log.error(`[MQTT][publish] ${publishTopic} ${err}`);
        }
      });
    })
    .catch((err) => {
      log.error(`[MQTT][publish] ${err}`);
    });
  },

  evaluetePos(self, pos) {
    //obtiene los ultimos x mensajes
    //evalua si debe detener el proceso de testing
    //evalua errores
    //evalua si debe cambiar la frecuencia con la que se ejecuta el hilo de testing.
    //const fecha = new Date();
    const FechaHora = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss'); // fecha.toISOString().replace('T', ' ').replace('Z', '')

    const params = {
      idPos: pos.idPos,
      Last: parseInt(process.env.APP_MQTT_EVALUATELAST),
    }

    ComunicacionAuditRepository.Last(self.db, params)
    .then((result) => {

      let cantSinRta = 0;
      let cantGPRS = 0
      result[0].forEach((el) => {
        if (!el.FechaHoraFin) {
          cantSinRta += 1;
        }
        if (el.WifiGsm === 'G') {
          cantGPRS += 1;
        }
      })

      let Notas = '';
      if (cantSinRta === params.Last) {
        Notas = `El Pos: ${pos.Descripción} con NroSerie: ${pos.NroSerie} NO esta reportadondo STATUS durante los últimos ${process.env.APP_MQTT_EVALUATELAST} mensajes`;
        alertcli.sendAlert(self.db, pos, Notas, 'StatusTimeOut')
      }

      if (cantGPRS >= parseInt(process.env.APP_MQTT_GPRSALARM)) {
        Notas = `El Pos: ${pos.Descripción} con NroSerie: ${pos.NroSerie} reporta status por GPRS durante los últimos ${process.env.APP_MQTT_GPRSALARM} mensajes`;
        alertcli.sendAlert(self.db, pos, Notas, 'StatusGPRS')       
      }

    })
    .catch((err) => {
      log.error(`[MQTT][evaluetePos] ${err}`);
    })

  },

  monitorPos(self) {
    //obtiene todos los pos de la db
    //evalua si debe o no disparar un proceso de testing
      //si lo dispara o verifica si esta andando
      //no lo detiene
    
    if (!self.isConnected()) {
      return;
    }

    //Obtener de la lista completa de post, no importa si estan activo o no.
    //ya que debo mostrar la situación de todos
    PosRepository.All(self.db, [])
    .then((result) => {

      //recorro el resultado de los objetos encontrados
      result[0].forEach((el) => {
        const pos = self.listPos.findIndex((obj) => obj.idPos === el.idPos);

        if (pos === -1) {
          //No existe, si se corresponde con un pos activo, debo agregar, y disparar el proceso de evaluacion
          self.listPos.push(el);
        } else {
          //actualizo el estado y reportar eventos
          self.listPos[pos].idPOSEstado = el.idPOSEstado;
          self.listPos[pos].ReportaEventos = el.ReportaEventos;
          self.listPos[pos].NroSerie = el.NroSerie;
        }

      });

      //recorro la lista generada y determino si debo o no startar
      const cantPos = (self.listPos.length * 2);
      let cantSegInterval = 0;
      self.listPos.forEach((el) => {
        if ((el.idPOSEstado === process.env.APP_MQTT_ESTADOPOSPRO) && (el.SYSBajaLogica === 0)) {
          if (!el.checkProc) {

            setTimeout(() => {
              el.checkProc = setInterval(self.checkPos, 1000 * self.gettimeIntervalPos(), self, el); //disparo la funcion cada x tiempo
            }, 1000 * cantSegInterval); 
            cantSegInterval += (self.gettimeIntervalPos() / cantPos);

            setTimeout(() => {
              el.evaluateProc = setInterval(self.evaluetePos, 1000 * self.gettimeIntervalPos(), self, el); //disparo la funcion cada x tiempo
            }, 1000 * cantSegInterval);
            cantSegInterval += (self.gettimeIntervalPos() / cantPos);
          }
        } else {
          if (el.checkProc) {
            //lo paro
            clearInterval(el.checkProc);
            clearInterval(el.evaluateProc);
            el.checkProc = null;
            el.evaluateProc = null;
          }
        }
      });

    })
    .catch((err) => {
      log.error(`[MQTT][monitorPos] ${err}`);
    });
  },

  startMonitor(timeIntervalPos) {
    if (this.isMonitor) {
      return;
    }

    this.isMonitor = true;
    this.timeIntervalPos = parseInt(timeIntervalPos);
    this.monitorPos(this);
    const monitorInterval = 1000 * this.gettimeIntervalPos() * 2;
    this.monitorProc = setInterval(this.monitorPos, monitorInterval, this);
  },

};

//
class Checker {
  constructor() {
    if (Checker.prototype.instance) {
      return Checker.prototype.instance;
    }
    this.checker = checker;
    Checker.prototype.instance = this;
  }
}

module.exports = (() => {
  if (Checker.prototype.instance) {
    return Checker.prototype.instance;
  }
  Checker.prototype.instance = checker;
  return checker;
})();