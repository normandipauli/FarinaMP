const express = require('express');
const { mqttcli, log } = require('../lib');

const router = module.exports = express.Router();

// -- Testing ------------------------------------------------------ //
router.get('/', function(req, res, next) {
	res.send('Funciona OK');
});
