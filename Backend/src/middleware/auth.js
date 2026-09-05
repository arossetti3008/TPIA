const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

async function protegerRuta(req, res, next) {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ mensaje: 'No autorizado, falta el token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // No devolvemos el passwordHash nunca hacia el resto de la app
    req.usuario = await Usuario.findById(payload.id).select('-passwordHash');

    if (!req.usuario) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token invalido o expirado' });
  }
}

module.exports = { protegerRuta };
