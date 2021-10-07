module.exports = {

	//ById ***********************************************************************
	ById(db, params) {
		var parameters = [];
		parameters.push( (typeof params.IdCliente == 'undefined'? null:params.IdCliente) );

		// return db.query('CALL Clientes_List(?,?,?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL clientes_ById(?)', parameters, (error, results, fields) => {
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
		parameters.push( (typeof params.IdCliente == 'undefined'? null:params.IdCliente) );
		parameters.push( (typeof params.RazonSocial == 'undefined'? null:params.RazonSocial) );
		parameters.push( (typeof params.Activo == 'undefined'? null:params.Activo) );

		// return db.query('CALL Clientes_List(?,?,?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL Clientes_List(?,?,?)', parameters, (error, results, fields) => {
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
		// return db.query('CALL Clientes_Combo()' );
		return new Promise((resolve, reject) => {
			db.query('CALL Clientes_Combo()', (error, results, fields) => {
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
		// parameters.push( (typeof params.IdCliente == 'undefined'? null:params.IdCliente) );
		parameters.push( (typeof params.CodCliente == 'undefined'? null:params.CodCliente) );
		parameters.push( (typeof params.CUIT == 'undefined'? null:params.CUIT) );
		parameters.push( (typeof params.IIBB == 'undefined'? null:params.IIBB) );
		parameters.push( (typeof params.GAN == 'undefined'? null:params.GAN) );
		parameters.push( (typeof params.NroDocumento == 'undefined'? null:params.NroDocumento) );
		parameters.push( (typeof params.RazonSocial == 'undefined'? null:params.RazonSocial) );
		parameters.push( (typeof params.Apellidos == 'undefined'? null:params.Apellidos) );
		parameters.push( (typeof params.Nombres == 'undefined'? null:params.Nombres) );
		parameters.push( (typeof params.NombreFantasia == 'undefined'? null:params.NombreFantasia) );
		parameters.push( (typeof params.Calle == 'undefined'? null:params.Calle) );
		parameters.push( (typeof params.Numero == 'undefined'? null:params.Numero) );
		parameters.push( (typeof params.Piso == 'undefined'? null:params.Piso) );
		parameters.push( (typeof params.Depto == 'undefined'? null:params.Depto) );
		parameters.push( (typeof params.CodPostArg == 'undefined'? null:params.CodPostArg) );
		parameters.push( (typeof params.idLocalidad == 'undefined'? null:params.idLocalidad) );
		parameters.push( (typeof params.idProvincia == 'undefined'? null:params.idProvincia) );		
		parameters.push( (typeof params.Telefono1 == 'undefined'? null:params.Telefono1) );
		parameters.push( (typeof params.Telefono2 == 'undefined'? null:params.Telefono2) );
		parameters.push( (typeof params.TelefonoFax == 'undefined'? null:params.TelefonoFax) );
		parameters.push( (typeof params.TelefonoMovil == 'undefined'? null:params.TelefonoMovil) );
		parameters.push( (typeof params.Email == 'undefined'? null:params.Email) );
		parameters.push( (typeof params.Observaciones == 'undefined'? null:params.Observaciones) );
		parameters.push( (typeof params.ReportaEventos == 'undefined'? null:params.ReportaEventos) );
		parameters.push( (typeof params.EmailEventos == 'undefined'? null:params.EmailEventos) );
		parameters.push( (typeof params.TelefonoMovilEventos == 'undefined'? null:params.TelefonoMovilEventos) );
		parameters.push( (typeof params.MP_access_token == 'undefined'? null:params.MP_access_token) );
		parameters.push( (typeof params.MP_user_id == 'undefined'? null:params.MP_user_id) );
		parameters.push( (typeof params.MP_store_id == 'undefined'? null:params.MP_store_id) );
		parameters.push( (typeof params.Activo == 'undefined'? null:params.Activo) );
		parameters.push( (typeof params.SYSSincronizado == 'undefined'? null:params.SYSSincronizado) );
		parameters.push( (typeof params.SYSBajaLogica == 'undefined'? null:params.SYSBajaLogica) );
		
		// return db.query('SET @IdCliente = 0;  CALL Clientes_Insert(@IdCliente,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?); SELECT @IdCliente as IdCliente', parameters );
		
		return new Promise((resolve, reject) => {
			db.query('SET @IdCliente = 0;  CALL Clientes_Insert(@IdCliente,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?); SELECT @IdCliente as IdCliente', parameters, (error, results, fields) => {
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
		parameters.push( (typeof params.IdCliente == 'undefined'? null:params.IdCliente) );
		parameters.push( (typeof params.CodCliente == 'undefined'? null:params.CodCliente) );
		parameters.push( (typeof params.CUIT == 'undefined'? null:params.CUIT) );
		parameters.push( (typeof params.IIBB == 'undefined'? null:params.IIBB) );
		parameters.push( (typeof params.GAN == 'undefined'? null:params.GAN) );

		parameters.push( (typeof params.NroDocumento == 'undefined'? null:params.NroDocumento) );
		parameters.push( (typeof params.RazonSocial == 'undefined'? null:params.RazonSocial) );
		parameters.push( (typeof params.Apellidos == 'undefined'? null:params.Apellidos) );
		parameters.push( (typeof params.Nombres == 'undefined'? null:params.Nombres) );

		parameters.push( (typeof params.NombreFantasia == 'undefined'? null:params.NombreFantasia) );
		parameters.push( (typeof params.Calle == 'undefined'? null:params.Calle) );
		parameters.push( (typeof params.Numero == 'undefined'? null:params.Numero) );

		parameters.push( (typeof params.Piso == 'undefined'? null:params.Piso) );
		parameters.push( (typeof params.Depto == 'undefined'? null:params.Depto) );
		parameters.push( (typeof params.CodPostArg == 'undefined'? null:params.CodPostArg) );

		parameters.push( (typeof params.idLocalidad == 'undefined'? null:params.idLocalidad) );
		parameters.push( (typeof params.idProvincia == 'undefined'? null:params.idProvincia) );

		parameters.push( (typeof params.Telefono1 == 'undefined'? null:params.Telefono1) );
		parameters.push( (typeof params.Telefono2 == 'undefined'? null:params.Telefono2) );
		parameters.push( (typeof params.TelefonoFax == 'undefined'? null:params.TelefonoFax) );
		parameters.push( (typeof params.TelefonoMovil == 'undefined'? null:params.TelefonoMovil) );

		parameters.push( (typeof params.Email == 'undefined'? null:params.Email) );
		parameters.push( (typeof params.Observaciones == 'undefined'? null:params.Observaciones) );

		parameters.push( (typeof params.ReportaEventos == 'undefined'? null:params.ReportaEventos) );
		parameters.push( (typeof params.EmailEventos == 'undefined'? null:params.EmailEventos) );
		parameters.push( (typeof params.TelefonoMovilEventos == 'undefined'? null:params.TelefonoMovilEventos) );

		parameters.push( (typeof params.MP_access_token == 'undefined'? null:params.MP_access_token) );
		parameters.push( (typeof params.MP_user_id == 'undefined'? null:params.MP_user_id) );
		parameters.push( (typeof params.MP_store_id == 'undefined'? null:params.MP_store_id) );

		parameters.push( (typeof params.Activo == 'undefined'? null:params.Activo) );
		parameters.push( (typeof params.SYSSincronizado == 'undefined'? null:params.SYSSincronizado) );
		parameters.push( (typeof params.SYSBajaLogica == 'undefined'? null:params.SYSBajaLogica) );
		
		// return db.query('CALL Clientes_Update(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL Clientes_Update(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', parameters, (error, results, fields) => {
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
		parameters.push( (typeof params.IdCliente == 'undefined'? null:params.IdCliente) );
		
		// return db.query('CALL Clientes_Delete(?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL Clientes_Delete(?)', parameters, (error, results, fields) => {
			  if (error) { 
				reject(error);
			  } else {
				resolve(results);
			  }
			});
		  });
		}, 
}
