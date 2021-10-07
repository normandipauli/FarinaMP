/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const fs = require('fs');

const modules = {};
fs.readdirSync(__dirname, { withFileTypes: false }).forEach((fileName) => {
  if (fileName === 'index.js') return;
  const moduleName = fileName.replace(/(\.\/|\.js)/g, '');
  modules[moduleName] = require(`./${fileName}`);
});


module.exports = modules;
