
/**
 * Adentro de Esta funcion se dan de alta las rutas
 */
module.exports = (app) => {
  // Listado de controllers usados
  app.use('/basealumnos', require('./controllers/basealumnosController'));
  app.use('/mercadopago', require('./controllers/mercadopagoController'));
  app.use('/monitor', require('./controllers/checkposController'));
  app.use('/mqtt', require('./controllers/mqttcommandController'));
  
  app.use('/Usuario_Perfil', require('./controllers/Usuario_PerfilController'));
  app.use('/Usuarios', require('./controllers/UsuariosController'));
  app.use('/Usuario_Pos', require('./controllers/Usuario_PosController'));

  app.use('/Clientes', require('./controllers/ClientesController'));

  app.use('/Pos_Tipo', require('./controllers/Pos_TipoController'));
  app.use('/Pos_Estado', require('./controllers/Pos_EstadoController'));
  app.use('/Pos_Eventos', require('./controllers/Pos_EventosController'));
  app.use('/Pos', require('./controllers/PosController'));
  app.use('/Pos_Firmware', require('./controllers/Pos_FirmwareController'));
  app.use('/Pos_Variables', require('./controllers/Pos_VariablesController'));

  app.use('/FormaPago_Origen', require('./controllers/FormaPago_OrigenController'));
  app.use('/FormasPago', require('./controllers/FormasPagoController'));

  app.use('/Localidades', require('./controllers/LocalidadesController'));
  app.use('/Provincias', require('./controllers/ProvinciasController'));

  app.use('/Reportes', require('./controllers/ReportesController'));

  app.use('/Vending_Pagos', require('./controllers/Vending_PagosController'));

  app.use('/Alertas_Tipo', require('./controllers/Alertas_TipoController'));
  app.use('/Alertas', require('./controllers/AlertasController'));
};
