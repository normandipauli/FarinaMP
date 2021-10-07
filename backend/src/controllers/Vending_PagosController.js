const express = require('express');
const { log, mplib, validToken } = require('../lib');

const router = module.exports = express.Router();
const Vending_PagosRepository = require('../repositories/Vending_PagosRepository');

// -- Testing ------------------------------------------------------ //
router.get('/', function(req, res, next) {
	res.send('Funciona OK');
});

// -- LIST ---------------------------------------------- //
router.get('/List', validToken.isLoggedIn, function (db, req, res, next) {

	Vending_PagosRepository.List(db, req.query)
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

// -- MODIFICAR --------------------------------------------------------------- //
router.put('/RetornarPago', validToken.isLoggedIn, function (db, req, res, next) {
	
	const idPago = req.body.idPago;
	const pk = {
		idPago,
	}

  mplib.anularPago(db, idPago)
  .then((result) => {
		Vending_PagosRepository.List(db, pk)
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
  .catch((err) => {
		log.error(`[RetornarPago]: 'error' ${JSON.stringify(err)}`);
		res.json({
			dbrow: null,
			recordset: null,
			error: `${err.message? err.message : err}`,
		});
  })

});

/*
// -- LIST COMBO ------------------------------------------------------ //
router.get('/ListCombo', function (db, req, res, next) {

	Vending_PagosRepository.ListCombo(db, req.query)
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
router.post('', function (db, req, res, next) {
	const pk = {
		idPago: req.body.idPago,
	}
	Vending_PagosRepository.Agregar(db, req.body)
		.then(result => {

			pk.idPago = result[0][0].idPago;

			Vending_PagosRepository.List(db, pk)
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
router.put('', function (db, req, res, next) {
	const pk = {
		idPago: req.body.idPago,
	}
	Vending_PagosRepository.Modificar(db, req.body)
		.then(result => {
			Vending_PagosRepository.List(db, pk)
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
router.delete('', function (db, req, res, next) {

	Vending_PagosRepository.Borrar(db, req.query)
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
*/