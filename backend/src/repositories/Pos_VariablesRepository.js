module.exports = {

	//List ***********************************************************************
	List(db, params) {
		var parameters = [];
		parameters.push( (typeof params.idVariable == 'undefined'? null:params.idVariable) );
		// return db.query('CALL Variables_List(?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL pos_variables_List(?)', parameters, (error, results, fields) => {
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
		//return db.query('CALL Variables_Combo()' );
		return new Promise((resolve, reject) => {
			db.query('CALL pos_variables_Combo()', (error, results, fields) => {
				if (error) { 
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	},

	//xNroSerie ***********************************************************************
	xNroSerie(db, params) {
		var parameters = [];
		parameters.push( (typeof params.NroSerie == 'undefined'? null:params.NroSerie) );
		return new Promise((resolve, reject) => {
			db.query('CALL pos_variables_xNroSerie(?)', parameters, (error, results, fields) => {
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
		parameters.push( (typeof params.idVariable == 'undefined'? null:params.idVariable) );
		parameters.push( (typeof params.Descripcion == 'undefined'? null:params.Descripcion) );
		parameters.push( (typeof params.Minimo == 'undefined'? null:params.Minimo) );
		parameters.push( (typeof params.Maximo == 'undefined'? null:params.Maximo) );
		parameters.push( (typeof params.Activo == 'undefined'? null:params.Activo) );
		parameters.push( (typeof params.SYSSincronizado == 'undefined'? null:params.SYSSincronizado) );
		parameters.push( (typeof params.SYSBajaLogica == 'undefined'? null:params.SYSBajaLogica) );
		
		// return db.query('CALL pos_variables_Insert(?,?,?,?,?,?,?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('SET @idVariable = 0; CALL pos_variables_Insert(@idVariable,?,?,?,?,?,?); SELECT @idVariable as idVariable', parameters, (error, results, fields) => {
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
		parameters.push( (typeof params.idVariable == 'undefined'? null:params.idVariable) );
		parameters.push( (typeof params.Descripcion == 'undefined'? null:params.Descripcion) );
		parameters.push( (typeof params.Minimo == 'undefined'? null:params.Minimo) );
		parameters.push( (typeof params.Maximo == 'undefined'? null:params.Maximo) );
		parameters.push( (typeof params.Activo == 'undefined'? null:params.Activo) );
		parameters.push( (typeof params.SYSSincronizado == 'undefined'? null:params.SYSSincronizado) );
		parameters.push( (typeof params.SYSBajaLogica == 'undefined'? null:params.SYSBajaLogica) );
		
		// return db.query('CALL Variables_Update(?,?,?,?,?,?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL pos_variables_Update(?,?,?,?,?,?,?)', parameters, (error, results, fields) => {
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
		parameters.push( (typeof params.idVariable == 'undefined'? null:params.idVariable) );
		
		// return db.query('CALL variables_Delete(?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL pos_variables_Delete(?)', parameters, (error, results, fields) => {
				if (error) { 
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	},
}
