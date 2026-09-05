const jwt = require('jsonwebtoken');

function generarAccessToken(usuarioId) {
  return jwt.sign({ id: usuarioId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

function generarRefreshToken(usuarioId) {
  return jwt.sign({ id: usuarioId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

module.exports = { generarAccessToken, generarRefreshToken };
