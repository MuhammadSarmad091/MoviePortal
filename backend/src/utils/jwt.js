const jwt = require('jsonwebtoken');
const { config } = require('../config/environment');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn, algorithm: config.jwt.algorithm }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};
