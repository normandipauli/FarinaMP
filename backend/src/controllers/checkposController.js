const express = require('express');
const { log, mqttcheck } = require('../lib');
const ComunicacionAuditRepository = require('../repositories/ComunicacionAuditRepository');

const router = module.exports = express.Router();

// -- Testing ------------------------------------------------------ //
router.get('/', function(req, res, next) {
	log.info(mqttcheck.client);
	res.send('Funciona OK');
});


// -- Start ---------------------------------------------- //
router.get('/list', function (db, req, res, next) {

	ComunicacionAuditRepository.Monitor(db, req.query)
	.then(result => {
		res.json({
			timeIntervalPos: mqttcheck.gettimeIntervalPos(),
			isConnected: mqttcheck.isConnected(),
			recordset: result[0],
			error: null,
		});
	})
	.catch(err => { // Error al Preparar Statement
		log.error(`level: 'error' ${JSON.stringify(err)}`);
		res.json({
			timeIntervalPos: mqttcheck.gettimeIntervalPos(),
			isConnected: mqttcheck.isConnected(),
			recordset: null,
			error: err.message,
		});
	});	

});


router.get('/start', function (db, req, res, next) {
	const timeIntervalPos = req.query.timeIntervalPos;

	if (!mqttcheck.isConnected()) {
		mqttcheck.connect(db)
		.then((client) => {
			
			if (!mqttcheck.isSubscribe()) {
				mqttcheck.subscribe()
				.then(() => {
					mqttcheck.startMonitor(timeIntervalPos);
					res.json({ message: 'Recuerde esperar para poder visualizar los mensajes', error: null, isConnected: mqttcheck.isConnected(), timeIntervalPos: mqttcheck.gettimeIntervalPos() });
				})
				.catch((err) => {
					res.json({ message: null, error: `${JSON.stringify(err)}`, isConnected: mqttcheck.isConnected(), timeIntervalPos: mqttcheck.gettimeIntervalPos() });
				});
			} else {
				res.json({ message: null, error: 'Ya se encuentra subscripto', isConnected: mqttcheck.isConnected(), timeIntervalPos: mqttcheck.gettimeIntervalPos() });
			}
		})
		.catch((err) => {
			res.json({ message: null, error: `${JSON.stringify(err)}`, isConnected: mqttcheck.isConnected(), timeIntervalPos: mqttcheck.gettimeIntervalPos() });
		});

	} else {
		res.json({ message: null, error: 'Ya se encuentra ejecutando', isConnected: mqttcheck.isConnected(), timeIntervalPos: mqttcheck.gettimeIntervalPos() });
	}

});

router.get('/stop', function (db, req, res, next) {
	
	if (mqttcheck.isConnected()) {
		mqttcheck.end()
		.then((client) => {
			res.json({ message: 'Se detuvo el monitor', error: null, isConnected: mqttcheck.isConnected(), timeIntervalPos: mqttcheck.gettimeIntervalPos() });
		})
		.catch((err) => {
			res.json({
				message: '',
				error: `${JSON.stringify(err)}`,
				isConnected: mqttcheck.isConnected(), 
				timeIntervalPos: mqttcheck.gettimeIntervalPos(),
			});
		});

	} else {
		res.json({
			message: '',
			error: 'No esta conectado',
			isConnected: mqttcheck.isConnected(), 
			timeIntervalPos: mqttcheck.gettimeIntervalPos(),
		});
	}

});