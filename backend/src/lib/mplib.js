const axios = require('axios');
const moment = require('moment-timezone');
const alertcli = require('./alertcli');
const PosRepository = require('../repositories/PosRepository');
const Vending_PagosRepository = require('../repositories/Vending_PagosRepository');

module.exports = {

  //sendMsg proceso standar
  anularPago(db, idPago ) {
    return new Promise((resolve, reject) => {

      paramPago = {
        idPago,
      }
      Vending_PagosRepository.ById(db, paramPago)
      .then((result) => {

        if (result[0].length !== 1) {
          reject(`No se encontró el pago id: ${idPago}`);
        }
        else
        {
          const pago = result[0][0];

          if (pago.idEstadoPago !== 'acancelar') {
            reject(`El pago con id: ${idPago}, no se encuentra en el estado acancelar`);
          } 
          else
          {
           
            paramPos = {
              idPos: pago.idPos,
            }

            PosRepository.ById(db, paramPos)
            .then((resultPos) => {

              const pos = resultPos[0][0];
              const access_token = pos.MP_access_token;
              const aPayments = pago.MP_payments_ids.split('|');
              aPayments.forEach((el) => {
                if (el) {

                  //consulto si el pago esta en estado aceptado
                  const urlGet = `https://api.mercadopago.com/v1/payments/${el}?access_token=${access_token}`
                  axios.get(urlGet)
                  .then((mpPayment) => {
                    if (mpPayment.data.status === 'approved') {
                      //refunds pago en MP
                      //https://api.mercadopago.com/v1/payments/:ID/refunds?access_token=ACCESS_TOKEN
                      const urlPost = `https://api.mercadopago.com/v1/payments/${el}/refunds?access_token=${access_token}` 
                      axios.post(urlPost)
                      .then((mpResult) => {
                        const payMP = mpResult.data;

                        if (payMP.status === 'approved') { 

                          //update en la db
                          //const fecha = new Date();
                          const FechaHoraModificada = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss');//fecha.toISOString().replace('T', ' ').replace('Z', '');

                          paramPago.idEstadoPago = 'cancelado';
                          paramPago.FechaHoraModificada = FechaHoraModificada;
                          Vending_PagosRepository.Cancel(db, paramPago)
                          .then((resultU) => {
                            //send mail
                            const Notas = `El pago id: ${idPago} con idMP: ${pago.MP_order_id} y orden de pago en MP: ${el}, se ha devuelto el dinero`;
                            alertcli.sendAlert(db, pos, Notas, 'PagoCandelado');
                            resolve(Notas);
                          })
                          .catch((err) => {
                            reject(err);
                          })
                        }                    
                      })
                      .catch((err) => {
                        reject(err);
                      });

                    } else {
                      reject(`El pago con id: ${idPago}, y con PaymentId: ${el} se encuentra en estado ${mpPayment.status}`);
                    }
                  })
                  .catch((err) => {
                    reject(err);
                  });

                }
              })
            })
            .catch((err) => {
              reject(err);
            })
          }
        }
      })
      .catch((err) => {
        reject(err);
      })
    });
  },


}