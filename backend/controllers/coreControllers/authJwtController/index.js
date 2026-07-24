const isValidToken = require('./isValidToken');
const isValidSignature = require('./isValidSignature');
const login = require('./login');

const authJwtController = {
  isValidToken,
  isValidSignature,
  login,
};

module.exports = authJwtController;
