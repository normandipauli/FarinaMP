module.exports = {

  //Agregar ***********************************************************************
  List(db, params) {
    var parameters = [];
    parameters.push( (typeof params.idPago == 'undefined'? null:params.idPago) );
    parameters.push( (typeof params.idPos == 'undefined'? null:params.idPos) );
    
    return new Promise((resolve, reject) => {
        db.query('CALL vending_pagos_List(?,?);', parameters, (error, results, fields) => {
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
    parameters.push( (typeof params.idPago == 'undefined'? null:params.idPago) );
    // return db.query('CALL vending_pagos_ById(?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL vending_pagos_ById(?)', parameters, (error, results, fields) => {
				if (error) { 
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
},

    //ByMPOrderId ***********************************************************************
    ByMPOrderId(db, params) {
        var parameters = [];
        parameters.push( (typeof params.MP_order_id == 'undefined'? null:params.MP_order_id) );
            return new Promise((resolve, reject) => {
                db.query('CALL vending_pagos_ByMPOrderId(?)', parameters, (error, results, fields) => {
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
    // parameters.push( (typeof params.idPago == 'undefined'? null:params.idPago) );
    parameters.push( (typeof params.idFormaPago == 'undefined'? null:params.idFormaPago) );
    parameters.push( (typeof params.idFormaPagoOrigen == 'undefined'? null:params.idFormaPagoOrigen) );
    parameters.push( (typeof params.idPos == 'undefined'? null:params.idPos) );
    parameters.push( (typeof params.NroSerie == 'undefined'? null:params.NroSerie) );
    parameters.push( (typeof params.idEstadoPago == 'undefined'? null:params.idEstadoPago) );
    parameters.push( (typeof params.FechaHoraCreada == 'undefined'? null:params.FechaHoraCreada) );
    parameters.push( (typeof params.FechaHoraModificada == 'undefined'? null:params.FechaHoraModificada) );
    parameters.push( (typeof params.ImporteVenta == 'undefined'? null:params.ImporteVenta) );   
    parameters.push( (typeof params.MP_collector_id == 'undefined'? null:params.MP_collector_id) );
    parameters.push( (typeof params.MP_currency_id == 'undefined'? null:params.MP_currency_id) );
    parameters.push( (typeof params.MP_order_id == 'undefined'? null:params.MP_order_id) );
    parameters.push( (typeof params.MP_status == 'undefined'? null:params.MP_status) );
    parameters.push( (typeof params.MP_order_status == 'undefined'? null:params.MP_order_status) );
    parameters.push( (typeof params.MP_external_reference == 'undefined'? null:params.MP_external_reference) );
    parameters.push( (typeof params.MP_preference_id == 'undefined'? null:params.MP_preference_id) );
    parameters.push( (typeof params.MP_payments_ids == 'undefined'? null:params.MP_payments_ids) );
    parameters.push( (typeof params.MP_payer_id == 'undefined'? null:params.MP_payer_id) );
    parameters.push( (typeof params.SYSSincronizado == 'undefined'? null:params.SYSSincronizado) );
    parameters.push( (typeof params.SYSBajaLogica == 'undefined'? null:params.SYSBajaLogica) );
    
    // return db.query('SET @idPago = 0; CALL Vending_Pagos_Insert(@idPago,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?); SELECT @idPago as idPago', parameters );
	return new Promise((resolve, reject) => {
		db.query('SET @idPago = 0; CALL Vending_Pagos_Insert(@idPago,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?); SELECT @idPago as idPago', parameters, (error, results, fields) => {
			if (error) { 
				reject(error);
			} else {
				resolve(results);
			}
		});
	});
  },

  //Pay ***********************************************************************
  Pay(db, params) {
    var parameters = [];
    parameters.push( (typeof params.idPago == 'undefined'? null:params.idPago) );
    parameters.push( (typeof params.idEstadoPago == 'undefined'? null:params.idEstadoPago) );
    parameters.push( (typeof params.FechaHoraModificada == 'undefined'? null:params.FechaHoraModificada) );
    parameters.push( (typeof params.MP_order_id == 'undefined'? null:params.MP_order_id) );
    parameters.push( (typeof params.MP_status == 'undefined'? null:params.MP_status) );
    parameters.push( (typeof params.MP_order_status == 'undefined'? null:params.MP_order_status) );
    parameters.push( (typeof params.MP_external_reference == 'undefined'? null:params.MP_external_reference) );
    parameters.push( (typeof params.MP_preference_id == 'undefined'? null:params.MP_preference_id) );
    parameters.push( (typeof params.MP_payments_ids == 'undefined'? null:params.MP_payments_ids) );
    parameters.push( (typeof params.MP_payer_id == 'undefined'? null:params.MP_payer_id) );
    
    // return db.query('CALL vending_pagos_Pay(?,?,?,?,?,?,?,?,?,?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL vending_pagos_Pay(?,?,?,?,?,?,?,?,?,?)', parameters, (error, results, fields) => {
				if (error) { 
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	},

  //Cancel ***********************************************************************
  Cancel(db, params) {
    var parameters = [];
    parameters.push( (typeof params.idPago == 'undefined'? null:params.idPago) );
    parameters.push( (typeof params.idEstadoPago == 'undefined'? null:params.idEstadoPago) );
    parameters.push( (typeof params.FechaHoraModificada == 'undefined'? null:params.FechaHoraModificada) );
    
    // return db.query('CALL vending_pagos_Cancel(?,?,?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL vending_pagos_Cancel(?,?,?)', parameters, (error, results, fields) => {
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
    parameters.push( (typeof params.idPago == 'undefined'? null:params.idPago) );
    
    // return db.query('CALL Vending_Pagos_Delete(?)', parameters );
		return new Promise((resolve, reject) => {
			db.query('CALL Vending_Pagos_Delete(?)', parameters, (error, results, fields) => {
				if (error) { 
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	},
}
