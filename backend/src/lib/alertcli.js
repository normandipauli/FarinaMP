const nodemailer = require('nodemailer');
const moment = require('moment-timezone');
const AlertasRepository = require('../repositories/AlertasRepository');
const ClientesRepository = require('../repositories/ClientesRepository');

module.exports = {

  //sendAlert proceso standar
  sendAlert(db, pos, Notas, idAlertaTipo ) {

      const FechaHora = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss');
      const EnvioMail = pos.ReportaEventos;
      let MailDestino = '';

      const paramCli = {
        IdCliente: pos.idCliente
      }

      ClientesRepository.ById(db, paramCli)
      .then((result) => {
      
          const cli = result[0][0];
          MailDestino = cli.EmailEventos;
          if (EnvioMail) {
            //envio la cancelación a mp
            const mailTransporter = nodemailer.createTransport({
              host: process.env.APP_MAIL_HOST,
              port: process.env.APP_MAIL_PORT,
              secure: process.env.APP_MAIL_SECURE, // true for 465, false for other ports
              auth: {
                user: process.env.APP_MAIL_USER, // generated ethereal user
                pass: process.env.APP_MAIL_PASS, // generated ethereal password
              },
            });
            const mailOptions = {
              from: 'noreply@softpro.com.ar',
              to: MailDestino,
              subject: 'FarinaVending',
              text: Notas
            }
            mailTransporter.sendMail(mailOptions);
          }
      })
      .finally(() => {
        const paramAlert = {
          idAlerta: 0, 
          idPos: pos.idPos, 
          FechaHora, 
          idAlertaTipo, 
          EnvioMail, 
          MailDestino, 
          Notas, 
          SYSSincronizado: 0, 
          SYSBajaLogica: 0        
        }
        AlertasRepository.Agregar(db, paramAlert);
      })
  },

}