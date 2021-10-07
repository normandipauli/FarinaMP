const express = require('express');
const { log , validToken, mqttcli } = require('../lib');

const router = module.exports = express.Router();
const PosRepository = require('../repositories/PosRepository');
const Pos_FirmwareRepository = require('../repositories/Pos_FirmwareRepository');


const fGetBufferSend = (db, pos, mqttCommand) => {
	return new Promise((resolve, reject) => {
		let bufferSend = [];

		switch (mqttCommand) {
			case process.env.APP_MQTT_COMPRECIO: //update precio
				bufferSend = Buffer.alloc(4);
				bufferSend.writeFloatLE(pos.ImporteVenta, 0);
				resolve(bufferSend);
				break;
			case process.env.APP_MQTT_COMGSRM:
				const gsrmValues = `${pos.GSRM_AP}\0${pos.GSRM_Usuario}\0${pos.GSRM_Password}\0${pos.GSRM_Activo}\0`;
				bufferSend = Buffer.alloc(gsrmValues.length);
				bufferSend.write(gsrmValues, 0);
				resolve(bufferSend);
				break;
			case process.env.APP_MQTT_COMMQTT:
				const mqttValues = `${process.env.APP_MQTT_HOST}\0${process.env.APP_MQTT_USERNAME}\0${process.env.APP_MQTT_PASSWORD}\0`;
				bufferSend = Buffer.alloc(mqttValues.length);
				bufferSend.write(mqttValues, 0);
				resolve(bufferSend);					
				break;
			case process.env.APP_MQTT_COMWIFI:
				const wifiValues = `${pos.WiFi_SSID}\0${pos.WiFi_Password}\0${pos.WiFi_Activo}\0`;
				bufferSend = Buffer.alloc(wifiValues.length);
				bufferSend.write(wifiValues, 0);
				resolve(bufferSend);			
				break;
			case process.env.APP_MQTT_COMFIRMWARE:
			case process.env.APP_MQTT_COMFILESYSTEM:
				const idPosFirmware = (mqttCommand === process.env.APP_MQTT_COMFIRMWARE) ? pos.idPosFirmware : pos.idPosFileSystem;
				const pkF = {
					idPosFirmware,
				}
				Pos_FirmwareRepository.List(db, pkF)
					.then((rtaFirmware) => {
						const fw = rtaFirmware[0][0];
						const urlFile = `${fw.DownloadLink}\0`;

						bufferSend = Buffer.alloc(urlFile.length);
						bufferSend.write(urlFile, 0);
						resolve(bufferSend);
					});
				break;

			default:
				reject(`[UpdatePos]: El comando de update enviado no tiene comportamiento`);
				break;
		}

	});

}

// -- Testing ------------------------------------------------------ //
router.get('/', function(req, res, next) {
	res.send('Funciona OK');
});

// -- LIST ---------------------------------------------- //
router.get('/List',   function (db, req, res, next) {

	PosRepository.List(db, req.query)
	.then(result => {
		res.json({
			recordset: result[0],
			error: null,
		});
	})
	.catch(err => { // Error al Preparar Statement
		log.error(`level: 'error' ${JSON.stringify(err)}`);
		res.json({
			recordset: null,
			error: err.message,
		});
	});
});

// -- LIST COMBO ------------------------------------------------------ //
router.get('/ListCombo', validToken.isLoggedIn, function (db, req, res, next) {

	PosRepository.ListCombo(db, req.query)
	.then(result => {
		res.json({
			recordset: result[0],
			error: null,
		});
	})
	.catch(err => { // Error al Preparar Statement
		log.error(`level: 'error' ${JSON.stringify(err)}`);
		res.json({
			recordset: null,
			error: err.message,
		});
	});
});

// -- AGREGAR --------------------------------------------------------------- //
router.post('', validToken.isLoggedIn, function (db, req, res, next) {
	const pk = {
		idPos: req.body.idPos,
	}
	PosRepository.Agregar(db, req.body)
		.then(result => {

			pk.idPos = result[2][0].idPos;

			PosRepository.List(db, pk)
				.then(result => {
					res.json({
						dbrow: result[0][0],
						recordset: result[0],
						error: null,
					});
				})
				.catch(err => { // Error al Preparar Statement
					log.error(`level: 'error' ${JSON.stringify(err)}`);
					res.json({
						dbrow: null,
						recordset: null,
						error: err.message,
					});
				});
			})
		.catch(err => { // Error al Preparar Statement
			log.error(`level: 'error' ${JSON.stringify(err)}`);
			res.json({
				dbrow: null,
				recordset: null,
				error: err.message,
			});
		});
});

// -- MODIFICAR --------------------------------------------------------------- //
router.put('', validToken.isLoggedIn, function (db, req, res, next) {
	const pk = {
		idPos: req.body.idPos,
	}
	PosRepository.Modificar(db, req.body)
		.then(result => {
			PosRepository.List(db, pk)
				.then(result => {
					res.json({
						dbrow: result[0][0],
						recordset: result[0],
						error: null,
					});
				})
				.catch(err => { // Error al Preparar Statement
					log.error(`level: 'error' ${JSON.stringify(err)}`);
					res.json({
						dbrow: null,
						recordset: null,
						error: err.message,
					});
				});
			})
		.catch(err => { // Error al Preparar Statement
			log.error(`level: 'error' ${JSON.stringify(err)}`);
			res.json({
				dbrow: null,
				recordset: null,
				error: err.message,
			});
		});
});

// -- BORRAR --------------------------------------------------------------- //
router.delete('', validToken.isLoggedIn, function (db, req, res, next) {

	PosRepository.Borrar(db, req.query)
		.then(result => {
			res.json({
				dbrow: null,
				recordset: null,
				error: null,
			});
		})
		.catch(err => { // Error al Preparar Statement
			log.error(`level: 'error' ${JSON.stringify(err)}`);
			res.json({
				dbrow: null,
				recordset: null,
				error: err.message,
			});
		});
});

// -- UpdatePos --------------------------------------------------------------- //
router.put('/UpdatePos', validToken.isLoggedIn, function (db, req, res, next) {
	try {
		const idPos = req.body.idPos;
		const mqttCommand = req.body.idCommandUpdate;
		const pk = {
			idPos,
		}
		PosRepository.ById(db, pk)
			.then(result => {
				const pos = result[0][0];

				fGetBufferSend(db, pos, mqttCommand)
					.then((bufferSend) => {
						mqttcli.sendMsg(db, idPos, mqttCommand, bufferSend)
								.then((rtaMqtt) => {
					          const Resultado = String.fromCharCode(rtaMqtt.bufferRta.readUInt8(6));
				          	
				          	if (Resultado === 'S') {
											res.json({
												dbrow: '',
												recordset: '',
												error: null,
											});
										} else {
											res.json({
												dbrow: null,
												recordset: null,
												error: 'El POS respondió no poder procesar la solicitud',
											});							
										}
								})
								.catch((err) => {
									log.error(`[UpdatePos]: 'error' ${JSON.stringify(err)}`);
									res.json({
										dbrow: null,
										recordset: null,
										error: `[StatusPos]: 'error' ${JSON.stringify(err.err)}`,
									});
								})
					})
					.catch(err => { // Error al Preparar Statement
						log.error(`[UpdatePos]: 'error' ${JSON.stringify(err)}`);
						res.json({
							dbrow: null,
							recordset: null,
							error: err.message,
						});
					});

			})
			.catch(err => { // Error al Preparar Statement
				log.error(`[UpdatePos]: 'error' ${JSON.stringify(err)}`);
				res.json({
					dbrow: null,
					recordset: null,
					error: err.message,
				});
			});
	

	} catch(err) {
		log.error(`[UpdatePos]: 'error' ${err.message}`);
		res.json({
			dbrow: null,
			recordset: null,
			error: err.message,
		});
	}
});

// -- Status --------------------------------------------------------------- //
router.get('/StatusPos', validToken.isLoggedIn, function (db, req, res, next) {
	const idPos = req.query.idPos;

	const mqttCommand = process.env.APP_MQTT_COMSTATUS;
  let bufferSend =  Buffer.alloc(0);

	mqttcli.sendMsg(db, idPos, mqttCommand, bufferSend)
	.then((rta) => {
		const topic = rta.topic;
		const FechaHoraFin = rta.FechaHoraFin;
		const bufferRta = rta.bufferRta;

		mqttcli.eventoParse(db, topic, FechaHoraFin, bufferRta)
		.then((paramEvent) => {
			res.json({
				dbrow: paramEvent,
				recordset: '',
				error: null,
			});
		})
		.catch((err) => {
			log.error(`[StatusPos]: 'error' ${JSON.stringify(err)}`);
			res.json({
				dbrow: null,
				recordset: null,
				error: `[StatusPos]: 'error' ${JSON.stringify(err)}`,
			});
		});
	})	
	.catch((err) => {
		log.error(`[StatusPos]: 'error' ${JSON.stringify(err)}`);
		res.json({
			dbrow: null,
			recordset: null,
			error: `[StatusPos]: 'error' ${JSON.stringify(err.err)}`,
		});
	})

});

// -- Status --------------------------------------------------------------- //
router.get('/DatosConfPos', validToken.isLoggedIn, function (db, req, res, next) {
	const idPos = req.query.idPos;

	const mqttCommand = process.env.APP_MQTT_COMDATOS;
  let bufferSend =  Buffer.alloc(0);

	mqttcli.sendMsg(db, idPos, mqttCommand, bufferSend)
	.then((rta) => {
		const topic = rta.topic;
		const FechaHoraFin = rta.FechaHoraFin;
		const bufferRta = rta.bufferRta;

		const mqttCommandRta = String.fromCharCode(bufferRta.readUInt8(0));
    const idComunicacionRta = parseInt(bufferRta.readUInt32LE(1));
    const WifiGsm = String.fromCharCode(bufferRta.readUInt8(5));
    const NroSerie = topic.replace(process.env.APP_MQTT_SUBSRIBEPATH, '');

    const Firmware = parseInt(bufferRta.readUInt16LE(6)); // , ENTERO SIN SIGNO
    const FileSystem = parseInt(bufferRta.readUInt16LE(8)); // , ENTERO SIN SIGNO
    let sBufferRta = bufferRta.toString();
    sBufferRta = sBufferRta.substr(10); //retiro la cabecera
    aBufferRta = sBufferRta.split('\0'); //separo los campos


	  const dbrow = {
	  	NroSerie,
	    mqttCommandRta,
	    idComunicacionRta,
	    WifiGsm,
	    Firmware,
	    FileSystem,
			WiFi_SSID: aBufferRta[0],
			WiFi_Password: aBufferRta[1],
			WiFi_Activo: aBufferRta[2],
			GSRM_AP: aBufferRta[3],
			GSRM_Usuario: aBufferRta[4],
			GSRM_Password: aBufferRta[5],
			GSRM_Activo: aBufferRta[6],
		}

		res.json({
			dbrow,
			recordset: '',
			error: null,
		});

	})	
	.catch((err) => {
		log.error(`[StatusPos]: 'error' ${JSON.stringify(err)}`);
		res.json({
			dbrow: null,
			recordset: null,
			error: `[StatusPos]: 'error' ${JSON.stringify(err.err)}`,
		});
	})

});
