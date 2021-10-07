const express = require('express');
const { log , validToken} = require('../lib');

const router = module.exports = express.Router();
const ClientesRepository = require('../repositories/ClientesRepository');

// -- Testing ------------------------------------------------------ //
router.get('/', function(req, res, next) {
	res.send('Funciona OK');
});

// -- LIST ---------------------------------------------- //
router.get('/List', validToken.isLoggedIn, function (db, req, res, next) {

	ClientesRepository.List(db, req.query)
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

	ClientesRepository.ListCombo(db, req.query)
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
		IdCliente: req.body.IdCliente,
	}
	ClientesRepository.Agregar(db, req.body)
		.then(result => {

			pk.IdCliente = result[2][0].IdCliente;
			
			ClientesRepository.List(db, pk)
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
		IdCliente: req.body.IdCliente,
	}
	ClientesRepository.Modificar(db, req.body)
		.then(result => {
			ClientesRepository.List(db, pk)
				.then(result => {
					res.json({
						dbrow: result[0][0],
						recordset: result[0],
						error: null,
					});
				})
				.catch(err => { // Error al Preparar Statement
					
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

	ClientesRepository.Borrar(db, req.query)
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
