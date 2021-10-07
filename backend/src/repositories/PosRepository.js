module.exports = {

	//All ***********************************************************************
	All(db, params) {
		var parameters = [];

		return new Promise((resolve, reject) => {
			db.query('CALL pos_All()', (error, results, fields) => {
				if (error) { 
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	},

	//ById ***********************************************************************
	ById(db, params) {
		var parameters = [];
		parameters.push( (typeof params.idPos == 'undefined'? null:params.idPos) );

		// return db.query('CALL pos_ById(?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL pos_ById(?)', parameters, (error, results, fields) => {
				if (error) { 
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	},

	//List ***********************************************************************
	List(db, params) {
		var parameters = [];
		parameters.push( (typeof params.idPos == 'undefined'? null:params.idPos) );
		parameters.push( (typeof params.idCliente == 'undefined'? null:params.idCliente) );
		parameters.push( (typeof params.idPOSTipo == 'undefined'? null:params.idPOSTipo) );
		parameters.push( (typeof params.idPOSEstado == 'undefined'? null:params.idPOSEstado) );

		// return db.query('CALL Pos_List(?,?,?,?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL Pos_List(?,?,?,?)', parameters, (error, results, fields) => {
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
		var parameters = [];
		parameters.push( (typeof params.idCliente == 'undefined'? null:params.idCliente) );
		// return db.query('CALL Pos_Combo(?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL Pos_Combo(?)', parameters, (error, results, fields) => {
				if (error) { 
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	},

	//Agregar ***********************************************************************
	Agregar(db, params) {
		var parameters = [];
		// parameters.push( (typeof params.idPos == 'undefined'? null:params.idPos) );
		parameters.push( (typeof params.idPOSTipo == 'undefined'? null:params.idPOSTipo) );
		parameters.push( (typeof params.Descripción == 'undefined'? null:params.Descripción) );
		parameters.push( (typeof params.idCliente == 'undefined'? null:params.idCliente) );
		parameters.push( (typeof params.idPOSEstado == 'undefined'? null:params.idPOSEstado) );
		parameters.push( (typeof params.NroSerie == 'undefined'? null:params.NroSerie) );
		parameters.push( (typeof params.idPosFirmware == 'undefined'? null:params.idPosFirmware) );
		parameters.push( (typeof params.idPosFileSystem == 'undefined'? null:params.idPosFileSystem) );
		parameters.push( (typeof params.TienePagoOnLine == 'undefined'? null:params.TienePagoOnLine) );
		parameters.push( (typeof params.ReportaEventos == 'undefined'? null:params.ReportaEventos) );
		parameters.push( (typeof params.ImporteVenta == 'undefined'? null:params.ImporteVenta) );
		parameters.push( (typeof params.WiFi_SSID == 'undefined'? null:params.WiFi_SSID) );
		parameters.push( (typeof params.WiFi_Password == 'undefined'? null:params.WiFi_Password) );
		parameters.push( (typeof params.WiFi_Activo == 'undefined'? null:params.WiFi_Activo) );
		parameters.push( (typeof params.GSRM_AP == 'undefined'? null:params.GSRM_AP) );
		parameters.push( (typeof params.GSRM_Usuario == 'undefined'? null:params.GSRM_Usuario) );
		parameters.push( (typeof params.GSRM_Password == 'undefined'? null:params.GSRM_Password) );
		parameters.push( (typeof params.GSRM_Activo == 'undefined'? null:params.GSRM_Activo) );

		parameters.push( (typeof params.MP_store_id == 'undefined'? null:params.MP_store_id) );
		parameters.push( (typeof params.MP_id == 'undefined'? null:params.MP_id) );
		parameters.push( (typeof params.MP_template_image == 'undefined'? null:params.MP_template_image) );

		parameters.push( (typeof params.SYSSincronizado == 'undefined'? null:params.SYSSincronizado) );
		parameters.push( (typeof params.SYSBajaLogica == 'undefined'? null:params.SYSBajaLogica) );
		
		// return db.query('SET @idPos = 0; CALL Pos_Insert(@idPos,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ; SELECT @idPos as idPos', parameters );
	 
		return new Promise((resolve, reject) => {
			db.query('SET @idPos = 0; CALL Pos_Insert(@idPos,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ; SELECT @idPos as idPos', parameters, (error, results, fields) => {
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
		parameters.push( (typeof params.idPos == 'undefined'? null:params.idPos) );
		parameters.push( (typeof params.idPOSTipo == 'undefined'? null:params.idPOSTipo) );
		parameters.push( (typeof params.Descripción == 'undefined'? null:params.Descripción) );
		parameters.push( (typeof params.idCliente == 'undefined'? null:params.idCliente) );
		parameters.push( (typeof params.idPOSEstado == 'undefined'? null:params.idPOSEstado) );
		parameters.push( (typeof params.NroSerie == 'undefined'? null:params.NroSerie) );
		parameters.push( (typeof params.idPosFirmware == 'undefined'? null:params.idPosFirmware) );
		parameters.push( (typeof params.idPosFileSystem == 'undefined'? null:params.idPosFileSystem) );
		parameters.push( (typeof params.TienePagoOnLine == 'undefined'? null:params.TienePagoOnLine) );
		parameters.push( (typeof params.ReportaEventos == 'undefined'? null:params.ReportaEventos) );
		parameters.push( (typeof params.ImporteVenta == 'undefined'? null:params.ImporteVenta) );
		parameters.push( (typeof params.WiFi_SSID == 'undefined'? null:params.WiFi_SSID) );
		parameters.push( (typeof params.WiFi_Password == 'undefined'? null:params.WiFi_Password) );
		parameters.push( (typeof params.WiFi_Activo == 'undefined'? null:params.WiFi_Activo) );
		parameters.push( (typeof params.GSRM_AP == 'undefined'? null:params.GSRM_AP) );
		parameters.push( (typeof params.GSRM_Usuario == 'undefined'? null:params.GSRM_Usuario) );
		parameters.push( (typeof params.GSRM_Password == 'undefined'? null:params.GSRM_Password) );
		parameters.push( (typeof params.GSRM_Activo == 'undefined'? null:params.GSRM_Activo) );

		parameters.push( (typeof params.MP_store_id == 'undefined'? null:params.MP_store_id) );
		parameters.push( (typeof params.MP_id == 'undefined'? null:params.MP_id) );
		parameters.push( (typeof params.MP_template_image == 'undefined'? null:params.MP_template_image) );

		parameters.push( (typeof params.SYSSincronizado == 'undefined'? null:params.SYSSincronizado) );
		parameters.push( (typeof params.SYSBajaLogica == 'undefined'? null:params.SYSBajaLogica) );
		
		// return db.query('CALL Pos_Update(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL Pos_Update(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', parameters, (error, results, fields) => {
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
		parameters.push( (typeof params.idPos == 'undefined'? null:params.idPos) );
		
		// return db.query('CALL Pos_Delete(?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL Pos_Delete(?)', parameters, (error, results, fields) => {
				if (error) { 
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	},
}
