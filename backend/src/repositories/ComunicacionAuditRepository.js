module.exports = {

	//Monitor ***********************************************************************
	Monitor(db, params) {
		var parameters = [];
		parameters.push( (typeof params.idCliente == 'undefined'? null:params.idCliente) );
		parameters.push( (typeof params.idPos == 'undefined'? null:params.idPos) );
		parameters.push( (typeof params.FechaDesde == 'undefined'? null:params.FechaDesde) );
		parameters.push( (typeof params.FechaHasta == 'undefined'? null:params.FechaHasta) );

		return new Promise((resolve, reject) => {
			db.query('CALL comunicacionaudit_Monitor(?, ?, ?, ?)', parameters, (error, results, fields) => {
				if (error) { 
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	},

	//Last ***********************************************************************
	Last(db, params) {
		var parameters = [];
		parameters.push( (typeof params.idPos == 'undefined'? null:params.idPos) );
		parameters.push( (typeof params.Last == 'undefined'? null:params.Last) );

		return new Promise((resolve, reject) => {
			db.query('CALL ComunicacionAudit_Last(?, ?)', parameters, (error, results, fields) => {
				if (error) { 
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	},

	//ListCombo ***********************************************************************
	ListCombo(db, params) {
		return db.query('CALL ComunicacionAudit_Combo()' );
	},

	//Agregar ***********************************************************************
	Agregar(db, params) {
		var parameters = [];
		parameters.push( (typeof params.idComunicacion == 'undefined'? null:params.idComunicacion) );
		parameters.push( (typeof params.idPos == 'undefined'? null:params.idPos) );
		parameters.push( (typeof params.FechaHoraInicio == 'undefined'? null:params.FechaHoraInicio) );
		parameters.push( (typeof params.FechaHoraFin == 'undefined'? null:params.FechaHoraFin) );
		parameters.push( (typeof params.Resultado == 'undefined'? null:params.Resultado) );
		parameters.push( (typeof params.WifiGsm == 'undefined'? null:params.WifiGsm) );
		parameters.push( (typeof params.MsgEnviado == 'undefined'? null:params.MsgEnviado) );
		parameters.push( (typeof params.MsgRecibido == 'undefined'? null:params.MsgRecibido) );
		parameters.push( (typeof params.idPago == 'undefined'? null:params.idPago) );
		parameters.push( (typeof params.SYSSincronizado == 'undefined'? null:params.SYSSincronizado) );
		parameters.push( (typeof params.SYSBajaLogica == 'undefined'? null:params.SYSBajaLogica) );
		
  	return new Promise((resolve, reject) => {
			db.query('CALL ComunicacionAudit_Insert(?,?,?,?,?,?,?,?,?,?,?)', parameters, (error, results, fields) => {
				if (error) { 
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	},

	//Modificar ***********************************************************************
	Modificar(db, params) {
		var parameters = [];
		parameters.push( (typeof params.idComunicacion == 'undefined'? null:params.idComunicacion) );
		parameters.push( (typeof params.idPos == 'undefined'? null:params.idPos) );
		parameters.push( (typeof params.FechaHoraInicio == 'undefined'? null:params.FechaHoraInicio) );
		parameters.push( (typeof params.FechaHoraFin == 'undefined'? null:params.FechaHoraFin) );
		parameters.push( (typeof params.Resultado == 'undefined'? null:params.Resultado) );
		parameters.push( (typeof params.WifiGsm == 'undefined'? null:params.WifiGsm) );
		parameters.push( (typeof params.MsgEnviado == 'undefined'? null:params.MsgEnviado) );
		parameters.push( (typeof params.MsgRecibido == 'undefined'? null:params.MsgRecibido) );
		parameters.push( (typeof params.idPago == 'undefined'? null:params.idPago) );
		parameters.push( (typeof params.SYSSincronizado == 'undefined'? null:params.SYSSincronizado) );
		parameters.push( (typeof params.SYSBajaLogica == 'undefined'? null:params.SYSBajaLogica) );
		
		// return db.query('CALL ComunicacionAudit_Update(?,?,?,?,?,?,?,?,?,?,?,?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL  CALL ComunicacionAudit_Update(?,?,?,?,?,?,?,?,?,?,?,?)', parameters, (error, results, fields) => {
				if (error) { 
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	},

	//ModificarFin ***********************************************************************
	ModificarFin(db, params) {
		var parameters = [];
		parameters.push( (typeof params.idComunicacion == 'undefined'? null:params.idComunicacion) );
		parameters.push( (typeof params.FechaHoraFin == 'undefined'? null:params.FechaHoraFin) );
		parameters.push( (typeof params.Resultado == 'undefined'? null:params.Resultado) );
		parameters.push( (typeof params.WifiGsm == 'undefined'? null:params.WifiGsm) );
		parameters.push( (typeof params.MsgRecibido == 'undefined'? null:params.MsgRecibido) );

  	return new Promise((resolve, reject) => {
			db.query('CALL ComunicacionAudit_UpdateFin(?,?,?,?,?)', parameters, (error, results, fields) => {
				if (error) { 
					reject(error);
				} else {
					resolve(results);
				}
			});
		});		

	},

	//Borrar ***********************************************************************
	Borrar(db, params) {
		var parameters = [];
		parameters.push( (typeof params.idComunicacion == 'undefined'? null:params.idComunicacion) );
		
		// return db.query('CALL ComunicacionAudit_Delete(?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL  ComunicacionAudit_Delete(?)', parameters, (error, results, fields) => {
				if (error) { 
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	},
}
