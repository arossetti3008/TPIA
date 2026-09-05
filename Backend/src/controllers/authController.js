const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { generarAccessToken, generarRefreshToken } = require('../utils/generarTokens');

// POST /api/auth/registro
async function registrar(req, res, next) {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, email y password son obligatorios' });
    }
    if (password.length < 8) {
      return res.status(400).json({ mensaje: 'La contrasena debe tener al menos 8 caracteres' });
    }

    const yaExiste = await Usuario.findOne({ email });
    if (yaExiste) {
      return res.status(409).json({ mensaje: 'Ya existe una cuenta con ese email' });
    }

    // passwordHash se hashea solo, en el pre-save del modelo
    const usuario = await Usuario.create({ nombre, email, passwordHash: password });

    const accessToken = generarAccessToken(usuario._id);
    const refreshToken = generarRefreshToken(usuario._id);

    res.status(201).json({
      usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
async function iniciarSesion(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y password son obligatorios' });
    }

    // select('+passwordHash') porque el modelo lo excluye por defecto
    const usuario = await Usuario.findOne({ email }).select('+passwordHash');

    // Mensaje generico a proposito: no revelar si fallo el email o el password
    if (!usuario || !(await usuario.compararPassword(password))) {
      return res.status(401).json({ mensaje: 'Credenciales invalidas' });
    }

    const accessToken = generarAccessToken(usuario._id);
    const refreshToken = generarRefreshToken(usuario._id);

    res.json({
      usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/refresh
async function refrescarToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ mensaje: 'Falta el refreshToken' });
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const usuario = await Usuario.findById(payload.id);
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    const nuevoAccessToken = generarAccessToken(usuario._id);
    res.json({ accessToken: nuevoAccessToken });
  } catch (error) {
    return res.status(401).json({ mensaje: 'Refresh token invalido o expirado' });
  }
}

// GET /api/auth/perfil (ruta protegida, requiere JWT)
async function obtenerPerfil(req, res, next) {
  try {
    res.json({ usuario: req.usuario });
  } catch (error) {
    next(error);
  }
}

module.exports = { registrar, iniciarSesion, refrescarToken, obtenerPerfil };
