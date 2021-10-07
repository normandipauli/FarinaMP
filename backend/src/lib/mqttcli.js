const mqtt = require('mqtt');
const moment = require('moment-timezone');
const alertcli = require('./alertcli');
const ComunicacionAuditRepository = require('../repositories/ComunicacionAuditRepository');
const Pos_EventosRepository = require('../repositories/Pos_EventosRepository'); 
const Pos_VariablesRepository = require('../repositories/Pos_VariablesRepository'); 

module.exports = {
	//rutina para pasar un buffer a formato string
  bufferToString(buffer) {
    let result = '';
    for (var i = 0; i < buffer.length; i++) {
      result += `${buffer[i].toString()}|`;
    }
    return result;
  },

  //sendMsg proceso standar
	sendMsg(db, idPos, mqttCommand, bufferSend ) {
		const self = this;
		return new Promise((resolve, reject) => {
			let client = null;
		  //const fecha = new Date();
	    const FechaHoraInicio = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss'); // fecha.toISOString().replace('T', ' ').replace('Z', '');
	    let isResolve = false;
			let bufferRta = null;
			let idComunicacion = null;
			const timeout = 1000 * parseInt(process.env.APP_MQTT_MSGTIMEOUT); //30 seg

			const totalLength = 5 + bufferSend.length;
			const bufferHeder =  Buffer.alloc(5);
			bufferHeder.write(mqttCommand, 0);
      bufferHeder.writeUInt32LE(0, 1);
      const bufferMsg = Buffer.concat([bufferHeder, bufferSend], totalLength);
      let MsgEnviado = self.bufferToString(bufferMsg);

	    const params = {
	      idComunicacion: 0,
	      idPos: idPos,
	      FechaHoraInicio,
	      MsgEnviado,
	      SYSSincronizado: 0,
	      SYSBajaLogica: 0,
	    }

	    ComunicacionAuditRepository.Agregar(db, params)
	    .then((result) => {
	    	idComunicacion = result[0][0].idComunicacion;
	    	const NroSerie = result[0][0].NroSerie;
	    	bufferMsg.writeUInt32LE(idComunicacion, 1);
	    	MsgEnviado = self.bufferToString(bufferMsg);
				const publishTopic = `${process.env.APP_MQTT_PUBLISHPATH}${NroSerie}`;
	    	const subscribeTopic = `${process.env.APP_MQTT_SUBSRIBEPATH}${NroSerie}`;

		    client = mqtt.connect(
		    	process.env.APP_MQTT_HOST,
		    	{ 
		    		username: process.env.APP_MQTT_USERNAME, 
		    		password: process.env.APP_MQTT_PASSWORD,
		    	}
		    )	

	      client.on('fail', (err) => {
	      	isResolve = true;
	        reject({err, idPos, mqttCommand, idComunicacion, bufferRta});
	      });
	      //********************************************************************
        client.on('message', (topic, bufferRta) => {
			    //const fechaFin = new Date();
			    const FechaHoraFin = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss'); //fechaFin.toISOString().replace('T', ' ').replace('Z', '')
			    const MsgRecibido = self.bufferToString(bufferRta);
			    const mqttCommandRta = String.fromCharCode(bufferRta.readUInt8(0));

					if (mqttCommandRta !== mqttCommand) return;
    			if (bufferRta.length < parseInt(process.env.APP_MQTT_COMDEFAULTLENGTH)) return;

    			const idComunicacionRta = parseInt(bufferRta.readUInt32LE(1));
    			if (idComunicacion !== idComunicacionRta) return;

					const WifiGsm = String.fromCharCode(bufferRta.readUInt8(5));
					const Resultado = String.fromCharCode(bufferRta.readUInt8(6));

			    const paramsRta = {
			      idComunicacion,
			      FechaHoraFin,
			      Resultado,
			      WifiGsm,
			      MsgRecibido,
			    }

			    ComunicacionAuditRepository.ModificarFin(db, paramsRta)
			    .then((result) => {
	        	isResolve = true;
	          resolve({idPos, mqttCommand, idComunicacion, topic, FechaHoraFin, bufferRta});
			    })
			    .catch((err) => {
				  	isResolve = true;
						reject({err, idPos, mqttCommand, idComunicacion, bufferRta});
			    });			    

        });		
        //***************************************************************************************************      
        client.on('connect', () => {

					client.subscribe(subscribeTopic, {qos: 0}, function (err) {
		        if (!err) {
			      	client.publish(publishTopic, bufferMsg, {qos: 1}, (err) => {
				        if (!err) {
				          //en este caso solo hay que esperar que llegue la respuesta
				        } else {
							  	isResolve = true;
									reject({err, idPos, mqttCommand, idComunicacion, bufferRta});
				        }
				      });
		        } else {
					  	isResolve = true;
							reject({err, idPos, mqttCommand, idComunicacion, bufferRta});
		        }
		      });

	      });
	    })
		  .catch((err) => {
		  	isResolve = true;
				reject({err, idPos, mqttCommand, idComunicacion, bufferRta});
		  });

			setTimeout(() => {
				if (client) client.end();
				if (!isResolve) reject({err: '[MQTT][sendMsg] timeout', idPos, mqttCommand, idComunicacion, bufferRta});
			}, timeout);

		});
	},

	eventoParse(db, topic, FechaHoraFin, bufferRta) {
		return new Promise((resolve, reject) => {

			try {

				let Notas = '';

				const MsgRecibido = this.bufferToString(bufferRta);
				const mqttCommandRta = String.fromCharCode(bufferRta.readUInt8(0));
		    const idComunicacionRta = parseInt(bufferRta.readUInt32LE(1));
		    const WifiGsm = String.fromCharCode(bufferRta.readUInt8(5));
		    const NroSerie = topic.replace(process.env.APP_MQTT_SUBSRIBEPATH, ''); //retiro el path
		    const Cont_Parcial_Servicio = parseInt(bufferRta.readUInt32LE(6)); // , ENTERO SIN SIGNO
		    const Cont_Parcial_Dinero = parseFloat(bufferRta.readFloatLE(10)).toFixed(2); // FLOAT SIN SIGNO
		    const Cont_Total_Dinero = parseFloat(bufferRta.readFloatLE(14)).toFixed(2); // FLOAT SIN SIGNO
		    const Cont_Parcial_Cospeles = parseInt(bufferRta.readUInt32LE(18)); // ENTERO SIN SIGNO
		    const Cont_Total_Cospeles = parseInt(bufferRta.readUInt32LE(22)); // ENTERO SIN SIGNO
		    const Cont_Parcial_OnLine = parseInt(bufferRta.readUInt32LE(26)); // ENTERO SIN SIGNO
		    const Cont_Total_Online = parseInt(bufferRta.readUInt32LE(30)); // ENTERO SIN SIGNO
		    const Cont_Total_Servicio = parseInt(bufferRta.readUInt32LE(34)); //ENTERO SIN SIGNO
		    const Temperatura = parseFloat(bufferRta.readFloatLE(38)).toFixed(2); // FLOAT SIN SIGNO
		    const ImporteVenta = parseFloat(bufferRta.readFloatLE(42)).toFixed(2); // PRECIO DE VENTA
		    //const Firmware = parseInt(bufferRta.readUInt16LE(42)); // ENTERO SIN SIGNO
		    //const FileSystem = parseInt(bufferRta.readUInt16LE(44)); // ENTERO SIN SIGNO
		   	const Firmware = 1; // ENTERO SIN SIGNO
		    const FileSystem = 1; // ENTERO SIN SIGNO

		    const paramEvent = {
		      idEvento: 0, 
		      NroSerie, 
		      FechaEvento: FechaHoraFin,
		      idComunicacion: idComunicacionRta,
		      WifiGsm,
		      MsgRecibido,
		      Cont_Parcial_Servicio, // , ENTERO SIN SIGNO
		      Cont_Parcial_Dinero, // FLOAT SIN SIGNO
		      Cont_Total_Dinero, // FLOAT SIN SIGNO
		      Cont_Parcial_Cospeles, // ENTERO SIN SIGNO
		      Cont_Total_Cospeles, // ENTERO SIN SIGNO
		      Cont_Parcial_OnLine, // ENTERO SIN SIGNO
		      Cont_Total_Online, // ENTERO SIN SIGNO
		      Cont_Total_Servicio, //ENTERO SIN SIGNO
		      Temperatura, // FLOAT SIN SIGNO
		      ImporteVenta, // FLOAT SIN SIGNO
		      Firmware, // ENTERO SIN SIGNO
		      FileSystem, // ENTERO SIN SIGNO
		      SYSSincronizado: 0,
		      SYSBajaLogica: 0,
		    }

		    Pos_EventosRepository.Agregar(db, paramEvent)
		    .then((result) => {
		    	resolve(paramEvent)
		    })
		    .catch((err) => {
		      reject(err);
		    });

        //en caso de estar emitiendo respuesta
        //voy a evaluar min y max
        Pos_VariablesRepository.xNroSerie(db, paramEvent)
        .then((resu) => {
          const variables = resu[0][0];
          let field = '';

          if (variables.FIELD1 && variables.MIN1 && variables.MAX1) {
	          field = variables.FIELD1;
	          if (parseFloat(paramEvent[field]) < parseFloat(variables.MIN1) || parseFloat(paramEvent[field]) > parseFloat(variables.MAX1)) {
	            Notas = `El Pos con NroSerie: ${paramEvent.NroSerie} reporta valores incorrectos para ${field}`;
	            alertcli.sendAlert(db, variables, Notas, 'ValoresIncorrec')  
	          }          	
          }

          if (variables.FIELD2 && variables.MIN2 && variables.MAX2) {
	          field = variables.FIELD2;
	          if (parseFloat(paramEvent[field]) < parseFloat(variables.MIN2) || parseFloat(paramEvent[field]) > parseFloat(variables.MAX2)) {
	            Notas = `El Pos con NroSerie: ${paramEvent.NroSerie} reporta valores incorrectos para ${field}`;
	            alertcli.sendAlert(db, variables, Notas, 'ValoresIncorrec')  
	          }          	
          }

          if (variables.FIELD3 && variables.MIN3 && variables.MAX3) {
	          field = variables.FIELD3;
	          if (parseFloat(paramEvent[field]) < parseFloat(variables.MIN3) || parseFloat(paramEvent[field]) > parseFloat(variables.MAX3)) {
	            Notas = `El Pos con NroSerie: ${paramEvent.NroSerie} reporta valores incorrectos para ${field}`;
	            alertcli.sendAlert(db, variables, Notas, 'ValoresIncorrec')  
	          }          	
          }          
          
        })
			
			} catch (err) {
				reject(err);
			}

		});
	},

}