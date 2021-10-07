const express = require('express');
const axios = require('axios');
const moment = require('moment-timezone');
const { mqttcli, log, mplib, alertcli } = require('../lib');

const router = module.exports = express.Router();

const ClientesRepository = require('../repositories/ClientesRepository');
const PosRepository = require('../repositories/PosRepository');
const Vending_PagosRepository = require('../repositories/Vending_PagosRepository');


// -- Testing ------------------------------------------------------ //
router.get('/', function(req, res, next) {
  res.send('Funciona OK');
});

//https://www.yoursite.com/notifications?topic=payment&id=123456789
router.post('/notifications/*', function (db, req, res, next) {
  const topicMP = req.query.topic;
  const idMP = req.query.id;

  log.info(`[MP][notifications][url] ${req.url} [body] ${JSON.stringify(req.body)}`);
  //console.log(`[MP][notifications][query] ${JSON.stringify(req.query)} [body] ${JSON.stringify(req.body)}`);

  if (!idMP || topicMP !== 'merchant_order') {
    //si la orden de pago no llego pagada en su totalidad no hay que seguir
    res.sendStatus(200); //// equivalent to res.status(200).send('OK')
    return; //no debo continuar
  }

  let Notas = '';

  //debo obtener el access_token
  const aUrl = req.url.split('?');
  const urlPos = aUrl[0].replace('/notifications/', '');

  const orderParam = {
    MP_order_id: idMP
  }

  Vending_PagosRepository.ByMPOrderId(db, orderParam)
  .then((opResult) => {
    // todavía no se ha procesado ningun pago
    if (opResult[0].length === 0) {
      const posParam = {
        idPos: urlPos,
      }
      PosRepository.ById(db, posParam)
      .then((result) => {
        const pos = result[0][0];
        const access_token = pos.MP_access_token;

        const urlGet = `${req.body.resource}?access_token=${access_token}` 

        axios.get(urlGet)
        .then((mpResult) => {
          try {
            //************************************************************************************
            const orderMP = mpResult.data;

            if (orderMP.order_status !== 'paid' || orderMP.status !== 'closed') { 
              //si la orden de pago no llego pagada en su totalidad no hay que seguir
              return; //no debo continuar
            }

            //const fecha = new Date();
            const FechaHoraModificada = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss'); // fecha.toISOString().replace('T', ' ').replace('Z', '');

            //debo obtener el idPos y el idPago
            const aIdVal = orderMP.external_reference.split('-');
            const idPos = parseInt(aIdVal[0]);
            const idPago = parseInt(aIdVal[1]);

            let MP_payments_ids = '';
            orderMP.payments.forEach((el) => {
              if (el.status === 'approved') {
                MP_payments_ids += el.id.toString() + '|';
              }
            })


            const paramPago = {
              idPago,   
              FechaHoraModificada,
              MP_order_id: orderMP.id,
              MP_status: orderMP.status, //opened - closed - expired
              MP_order_status: orderMP.order_status,
              MP_external_reference: orderMP.external_reference,
              MP_preference_id: orderMP.preference_id,
              MP_payments_ids,
              MP_payer_id: orderMP.payer.id
            }

            //debo consultar al cliente mqtt a ver si esta disponible
            const mqttCommand = process.env.APP_MQTT_COMPAGO;
            let bufferSend =  Buffer.alloc(0);
            mqttcli.sendMsg(db, idPos, mqttCommand, bufferSend)
            .then((rta) => {
              const Resultado = String.fromCharCode(rta.bufferRta.readUInt8(6));

              if (Resultado === 'S') {
                paramPago.idEstadoPago = 'pagado'; //generado pagado cancelado acancelar
              } else {
                paramPago.idEstadoPago = 'acancelar'; //generado pagado cancelado acancelar
                log.error(`[MP][notificactions] Resultado sendMsg N`);
                Notas = `El Pos: ${pos.Descripción} con NroSerie: ${pos.NroSerie} reporto no poder brindar el pago ${idPago} `;
                alertcli.sendAlert(db, pos, Notas, 'PagoRechazado');
              }
            })
            .catch((err) => { //sendMsg
              paramPago.idEstadoPago = 'acancelar'; //generado pagado cancelado acancelar
              log.error(`[MP][notifications] ${JSON.stringify(err)}`);
              Notas = `El Pos: ${pos.Descripción} con NroSerie: ${pos.NroSerie} no reporto recibir la información del pago ${idPago} `;
              alertcli.sendAlert(db, pos, Notas, 'PagoRechazado');
            })
            .finally(() => {
              Vending_PagosRepository.Pay(db, paramPago)
              .catch((err) => {
                log.error(`[MP][notifications] ${JSON.stringify(err)}`);
              })
              .finally(() => {
                //************************************************************************************
                //Ya se que la orden fue pagada en MP, por lo tanto debo analizar si la orden quedo mal
                if (paramPago.idEstadoPago === 'acancelar') {
                  mplib.anularPago(db, idPago)
                  .catch((err) => {
                    log.error(`[MP][notifications] ${JSON.stringify(err)}`);
                  })
                }
              });
            })    

            //************************************************************************************
          } catch (e) {
            log.error(`[MP][notifications] ${JSON.stringify(e)}`);
            Notas = `El Pos: ${pos.Descripción} con NroSerie: ${pos.NroSerie} reporto un error en la rutina de pago `;
            alertcli.sendAlert(db, pos, Notas, 'PagoRechazado');
          }
        })
        .catch((err) => {
          log.error(`[MP][notifications] ${JSON.stringify(err)}`);
          Notas = `El Pos: ${pos.Descripción} con NroSerie: ${pos.NroSerie} reporto un error al obtener la orden de compra en mercado pago `;
          alertcli.sendAlert(db, pos, Notas, 'PagoRechazado');
        });
      })
      .catch((err) => {
        log.error(`[MP][notifications] ${JSON.stringify(err)}`);
      });
    } else {
      log.info(`[MP][notifications] Notificación rechazada, ya se encuentra procesando el pago`);
    }
  })
  .catch((err) => {
    log.error(`[MP][notifications] ${JSON.stringify(err)}`);
  });

  res.sendStatus(200); //// equivalent to res.status(200).send('OK')
});

// -- IPN ---------------------------------------------- //
router.get('/ipn', function (db, req, res, next) {

  /*
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  */

  const idPos = req.query.idPos;
  //en caso de no poder responder
  const msgError = {
    error: { 
      type: "timeout",
      message: "No se pudo establecer la comunicación con el punto de venta" 
    }
  }


  if (!idPos) {
    msgError.error.type = 'invalid';
    msgError.error.message = `[MP][ipn] Los parámetros adicionales ${idPos} hacen referencia a una ubicación desconocida`;
    log.error(`${msgError.error.message}`);
    res.status(400).json(msgError);
    return;
  }

  let Notas = '';
  const param = {
    idPos, //req.query.storeid
  }

  //Obtener de la lista completa de post, no importa si estan activo o no.
  //ya que debo mostrar la situación de todos
  PosRepository.ById(db, param)
    .then((result) => {

      if (result[0].length === 1) 
      {
        const pos = result[0][0];
        if ((pos.idPOSEstado === process.env.APP_MQTT_ESTADOPOSPRO) && (pos.ImporteVenta > 0) && (pos.SYSBajaLogica === 0))
        {

          //debo consultar al cliente mqtt a ver si esta disponible
          const mqttCommand = process.env.APP_MQTT_COMACTIVO;
          let bufferSend =  Buffer.alloc(0);
          mqttcli.sendMsg(db, idPos, mqttCommand, bufferSend)
            .then((rta) => {
              const Resultado = String.fromCharCode(rta.bufferRta.readUInt8(6));
              const ImporteVenta = parseFloat(rta.bufferRta.readFloatLE(7)).toFixed(2);

              //en caso de que el valor de venta del servicio sea distinto en la db que en el pos, informo una alerta
              if (ImporteVenta !== pos.ImporteVenta) {
                Notas = `El Pos: ${pos.Descripción} con NroSerie: ${pos.NroSerie} tiene un importe de servicio de: ${ImporteVenta} cuando en la base de datos se indica en: ${pos.ImporteVenta}`;
                alertcli.sendAlert(db, pos, Notas, 'ValoresIncorrec')
              }

              if ((Resultado === 'S') && (ImporteVenta > 0)) {

                // const fecha = new Date();
                const FechaHoraCreada = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss'); // fecha.toISOString().replace('T', ' ').replace('Z', '');

                const MP_collector_id = pos.MP_user_id;

                const paramPago = {
                  idPago: 0,
                  idFormaPago: 2, //Pago On-Line
                  idFormaPagoOrigen: 'MPA', //Mercado Pago
                  idPos,
                  NroSerie: pos.NroSerie,
                  idEstadoPago: 'generado', //generado pagado cancelado acancelar
                  FechaHoraCreada,
                  ImporteVenta,
                  MP_collector_id,          
                  MP_currency_id: 'ARS',
                  SYSSincronizado: 0,
                  SYSBajaLogica: 0,
                }

                Vending_PagosRepository.Agregar(db, paramPago)
                  .then((resultPago) => {
                    const idPago = resultPago[2][0].idPago;
                    const sPos = idPos.toString();
                    const external_reference = idPos.toString().padStart(11, '0') + '-' + idPago.toString().padStart(20, '0') 

                    const oCompra = {
                       collector_id: MP_collector_id,
                       items:[
                          {
                             title: `$ ${pos.ImporteVenta} Servicio de: ` + pos.RazonSocial,
                             currency_id: 'ARS',
                             description:`$ ${pos.ImporteVenta} Servicio de: ` + pos.RazonSocial,
                             quantity: 1.0,
                             unit_price: parseFloat(pos.ImporteVenta)
                          }
                       ],
                       external_reference,
                       notification_url: `${process.env.APP_MP_NOTIFICATION_URL}/${sPos}`,
                    }
                    res.status(200).json(oCompra);
                    //console.log(JSON.stringify(oCompra))
                  })
                  .catch((err) => {
                    msgError.error.type = 'unavailable';
                    msgError.error.message = `[MP][ipn] No hay pedido en proceso o pendiente de pago. ${idPos}`;
                    log.error(`[MP][ipn] ${err}`);
                    Notas = `El Pos: ${pos.Descripción} con NroSerie: ${pos.NroSerie} falló al generar la orden y rechazo la orden de compra`;
                    alertcli.sendAlert(db, pos, Notas, 'OrdenNoGenerada')
                    res.status(400).json(msgError);
                    return;
                  });

              } else {
                //no hay servicio
                msgError.error.type = 'unavailable';
                msgError.error.message = `[MP][ipn] No hay pedido en proceso o pendiente de pago. ${idPos}`;
                log.error(`${msgError.error.message}`);
                Notas = `El Pos: ${pos.Descripción} con NroSerie: ${pos.NroSerie} respondió no poder brindar el servicio y rechazo la orden de compra`;
                alertcli.sendAlert(db, pos, Notas, 'OrdenNoGenerada')
                res.status(400).json(msgError);
                return;
              }
            })
            .catch((err) => { //sendMsg
              msgError.error.type = 'timeout';
              msgError.error.message = `[MP][ipn] No se pudo establecer la comunicación con el punto de venta. ${idPos}`;
              log.error(`[MP][ipn] ${JSON.stringify(err)}`);
              Notas = `El Pos: ${pos.Descripción} con NroSerie: ${pos.NroSerie} no brindó respuesta en el tiempo esperado y rechazo la orden de compra`;
              alertcli.sendAlert(db, pos, Notas, 'OrdenNoGenerada')
              res.status(400).json(msgError);
              return;
            })      
        } else {
          //la consulta dio vacio
          msgError.error.type = 'invalid';
          msgError.error.message = `[MP][ipn] Los parámetros adicionales ${idPos} hacen referencia a una ubicación desconocida`;
          log.error(`[MP][ipn] ${JSON.stringify(msgError)})`);
          Notas = `El Pos: ${pos.Descripción} con NroSerie: ${pos.NroSerie}, importe de venta ${pos.ImporteVenta} en estado ${pos.idPOSEstado} y con baja logica: ${pos.SYSBajaLogica}, rechazo la orden de compra`;
          alertcli.sendAlert(db, pos, Notas, 'OrdenNoGenerada')
          res.status(400).json(msgError);
          return;
        }
      } else {
        //la consulta dio vacio
        msgError.error.type = 'invalid';
        msgError.error.message = `[MP][ipn] Los parámetros adicionales ${idPos} hacen no referencia a una ubicación conocida`;
        log.error(`[MP][ipn] ${JSON.stringify(msgError)})`);
        res.status(400).json(msgError);
        return;
      }
    })
    .catch((err) => {
      msgError.error.type = 'invalid';
      msgError.error.message = `[MP][ipn] Los parámetros adicionales ${idPos} hacen referencia a una ubicación desconocida`;
      log.error(`[MP][ipn] ${JSON.stringify(err)}`);
      res.status(400).json(msgError);
      return;
    });

});


// -- AGREGAR stores
router.post('/store', function (db, req, res, next) {
  const IdCliente = req.body.IdCliente;
  const pk = {
    IdCliente,
  }

  ClientesRepository.ById(db, pk)
  .then((result) => {
    const cliente = result[0][0];
    const MP_access_token = cliente.MP_access_token;
    const MP_user_id = cliente.MP_user_id;

    if (!MP_access_token || !MP_user_id) {
      res.json({
        dbrow: null,
        recordset: null,
        error: 'Para poder utilizar esta función, debe ingresar los valores de token y user id correspondientes en Mercado Pago',
      });
      return;
    }

    const MP_store_id = cliente.MP_store_id;
    if (MP_store_id) {
      res.json({
        dbrow: null,
        recordset: null,
        error: `El cliente ya cuenta con un store creado en mercado pago con id: ${MP_store_id}`,
      });
      return;
    }    

    const jsonParam = {
      external_id: `SVM${IdCliente.toString().padStart(11, '0')}`,
      name: 'Sucursal Vending Machine',
      location: {
        street_number: '3700',
        street_name: 'Av. Pedro Luro',
        city_name: 'Mar del Plata',
        state_name: 'Buenos Aires',  
        reference: 'VirtualStore',
        latitude: -37.992946654204324,
        longitude: -57.55739301380311
      }
    }

    const urlPos = `https://api.mercadopago.com/users/${MP_user_id}/stores?access_token=${MP_access_token}`
    axios.post(urlPos, jsonParam)
    .then((mprta) => {
      const mpStore = mprta.data;
      cliente.MP_store_id = mpStore.id;

      ClientesRepository.Modificar(db, cliente)
      .then(() => {
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
      .catch((err) => {
        log.error(`[MP][store] ${JSON.stringify(err)}`);
        res.json({
          dbrow: null,
          recordset: null,
          error: 'Fallo la actualización en nuestra base de datos',
        });
      });
    })
    .catch((err) => {   
      log.error(`[MP][store] ${JSON.stringify(err)}`);
      res.json({
        dbrow: null,
        recordset: null,
        error: 'Fallo la creación del store en Mercado Pago',
      });
    });
  })
  .catch((err) => {
    log.error(`[MP][store] ${JSON.stringify(err)}`);
    res.json({
      dbrow: null,
      recordset: null,
      error: 'No se ha podido recuperar el cliente',
    });
  });
});


// -- AGREGAR cajas (pos)
router.post('/caja', function (db, req, res, next) {
  const pk = {
    idPos: req.body.idPos,
  }

  PosRepository.ById(db, pk)
    .then((posRta) => {
      const pos = posRta[0][0];

      if (pos.MP_id) {
        res.json({
          dbrow: null,
          recordset: null,
          error: 'El pos ya cuenta con una Caja asignada en Mercado Pago',
        });
        return;      
      }
      const pkCli = {
        IdCliente: pos.idCliente,
      }
      ClientesRepository.ById(db, pkCli)
        .then((cliRta) => {
          const cliente = cliRta[0][0];
          if (!cliente.MP_store_id || !cliente.MP_access_token) {
            res.json({
              dbrow: null,
              recordset: null,
              error: 'Para poder crear la Caja, debe primero crear el store en el cliente',
            });
            return;              
          }

          const MP_access_token = cliente.MP_access_token;
          const jsonParam = {
            name: `${pos.Descripción} Virtual`, 
            fixed_amount: true,
            category: 621102,
            external_store_id: `SVM${cliente.IdCliente.toString().padStart(11, '0')}`,
            external_id: `PVM${pos.idPos.toString().padStart(11, '0')}`,
            url: `${process.env.APP_MP_IPN_URL}?idPos=${pos.idPos}`,
          }

          const urlPos = `https://api.mercadopago.com/pos?access_token=${MP_access_token}`
          axios.post(urlPos, jsonParam)
            .then((mprta) => {
              const mpCaja = mprta.data;
              pos.MP_store_id = mpCaja.store_id;
              pos.MP_id = mpCaja.id;
              pos.MP_template_image = mpCaja.qr.template_image;
          
              PosRepository.Modificar(db, pos)
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
                      log.error(`[MP][caja] ${JSON.stringify(err)}`);
                      res.json({
                        dbrow: null,
                        recordset: null,
                        error: err.message,
                      });
                    });
                  })
                .catch(err => { // Error al Preparar Statement
                  log.error(`[MP][caja] ${JSON.stringify(err)}`);
                  res.json({
                    dbrow: null,
                    recordset: null,
                    error: err.message,
                  });
                });
             })
            .catch(err => { // Error al Preparar Statement
              log.error(`[MP][caja] ${JSON.stringify(err)}`);
              res.json({
                dbrow: null,
                recordset: null,
                error: err.message,
              });
            });
        })
        .catch(err => { // Error al Preparar Statement
          log.error(`[MP][caja] ${JSON.stringify(err)}`);
          res.json({
            dbrow: null,
            recordset: null,
            error: err.message,
          });
        });
    })
    .catch(err => { // Error al Preparar Statement
      log.error(`[MP][caja] ${JSON.stringify(err)}`);
      res.json({
        dbrow: null,
        recordset: null,
        error: err.message,
      });
    });


});

// router.post('/notifications/*', function (db, req, res, next) {
//   const topicMP = req.query.topic;
//   const idMP = req.query.id;

//   log.info(`[MP][notifications][url] ${req.url} [body] ${JSON.stringify(req.body)}`);
//   //console.log(`[MP][notifications][query] ${JSON.stringify(req.query)} [body] ${JSON.stringify(req.body)}`);

//   if (!idMP || topicMP !== 'merchant_order') {
//     //si la orden de pago no llego pagada en su totalidad no hay que seguir
//     res.sendStatus(200); //// equivalent to res.status(200).send('OK')
//     return; //no debo continuar
//   }

//   let Notas = '';

//   //debo obtener el access_token
//   const aUrl = req.url.split('?');
//   const urlPos = aUrl[0].replace('/notifications/', '');

//   const posParam = {
//     idPos: urlPos,
//   }

//   PosRepository.ById(db, posParam)
//   .then((result) => {
//     const pos = result[0][0];
//     const access_token = pos.MP_access_token;

//     const urlGet = `${req.body.resource}?access_token=${access_token}` 

//     axios.get(urlGet)
//     .then((mpResult) => {
//       try {
//         //************************************************************************************
//         const orderMP = mpResult.data;

//         if (orderMP.order_status !== 'paid' || orderMP.status !== 'closed') { 
//           //si la orden de pago no llego pagada en su totalidad no hay que seguir
//           return; //no debo continuar
//         }

//         //const fecha = new Date();
//         const FechaHoraModificada = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss'); // fecha.toISOString().replace('T', ' ').replace('Z', '');

//         //debo obtener el idPos y el idPago
//         const aIdVal = orderMP.external_reference.split('-');
//         const idPos = parseInt(aIdVal[0]);
//         const idPago = parseInt(aIdVal[1]);

//         let MP_payments_ids = '';
//         orderMP.payments.forEach((el) => {
//           if (el.status === 'approved') {
//             MP_payments_ids += el.id.toString() + '|';
//           }
//         })


//         const paramPago = {
//           idPago,   
//           FechaHoraModificada,
//           MP_order_id: orderMP.id,
//           MP_status: orderMP.status, //opened - closed - expired
//           MP_order_status: orderMP.order_status,
//           MP_external_reference: orderMP.external_reference,
//           MP_preference_id: orderMP.preference_id,
//           MP_payments_ids,
//           MP_payer_id: orderMP.payer.id
//         }

//         //debo consultar al cliente mqtt a ver si esta disponible
//         const mqttCommand = process.env.APP_MQTT_COMPAGO;
//         let bufferSend =  Buffer.alloc(0);
//         mqttcli.sendMsg(db, idPos, mqttCommand, bufferSend)
//         .then((rta) => {
//           const Resultado = String.fromCharCode(rta.bufferRta.readUInt8(6));

//           if (Resultado === 'S') {
//             paramPago.idEstadoPago = 'pagado'; //generado pagado cancelado acancelar
//           } else {
//             paramPago.idEstadoPago = 'acancelar'; //generado pagado cancelado acancelar
//             log.error(`[MP][notificactions] Resultado sendMsg N`);
//             Notas = `El Pos: ${pos.Descripción} con NroSerie: ${pos.NroSerie} reporto no poder brindar el pago ${idPago} `;
//             alertcli.sendAlert(db, pos, Notas, 'PagoRechazado');
//           }
//         })
//         .catch((err) => { //sendMsg
//           paramPago.idEstadoPago = 'acancelar'; //generado pagado cancelado acancelar
//           log.error(`[MP][notifications] ${JSON.stringify(err)}`);
//           Notas = `El Pos: ${pos.Descripción} con NroSerie: ${pos.NroSerie} no reporto recibir la información del pago ${idPago} `;
//           alertcli.sendAlert(db, pos, Notas, 'PagoRechazado');
//         })
//         .finally(() => {
//           Vending_PagosRepository.Pay(db, paramPago)
//           .catch((err) => {
//             log.error(`[MP][notifications] ${JSON.stringify(err)}`);
//           })
//           .finally(() => {
//             //************************************************************************************
//             //Ya se que la orden fue pagada en MP, por lo tanto debo analizar si la orden quedo mal
//             if (paramPago.idEstadoPago === 'acancelar') {
//               mplib.anularPago(db, idPago)
//               .catch((err) => {
//                 log.error(`[MP][notifications] ${JSON.stringify(err)}`);
//               })
//             }
//           });
//         })    

//         //************************************************************************************
//       } catch (e) {
//         log.error(`[MP][notifications] ${JSON.stringify(e)}`);
//         Notas = `El Pos: ${pos.Descripción} con NroSerie: ${pos.NroSerie} reporto un error en la rutina de pago `;
//         alertcli.sendAlert(db, pos, Notas, 'PagoRechazado');
//       }
//     })
//     .catch((err) => {
//       log.error(`[MP][notifications] ${JSON.stringify(err)}`);
//       Notas = `El Pos: ${pos.Descripción} con NroSerie: ${pos.NroSerie} reporto un error al obtener la orden de compra en mercado pago `;
//       alertcli.sendAlert(db, pos, Notas, 'PagoRechazado');
//     });

//   })
//   .catch((err) => {
//     log.error(`[MP][notifications] ${JSON.stringify(err)}`);
//   });

//   res.sendStatus(200); //// equivalent to res.status(200).send('OK')


// });