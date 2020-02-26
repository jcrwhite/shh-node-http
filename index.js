const shhHTTP = require('./lib/http');
const utils = require('./lib/utils');

module.exports = {
  http: shhHTTP,
  utils
};

module.exports.default = {
  http: shhHTTP,
  utils
};
