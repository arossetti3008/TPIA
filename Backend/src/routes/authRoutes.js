const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  registrar,
  iniciarSesion,
  refrescarToken,
  obtenerPerfil,
} = require('../controllers/authController');
const { protegerRuta } = require('../middleware/auth');

const router = express.Router();

// Limita intentos de login/registro para frenar fuerza bruta y bots
const limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  message: { mensaje: 'Demasiados intentos, proba de nuevo en unos minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/registro', limiteAuth, registrar);
router.post('/login', limiteAuth, iniciarSesion);
router.post('/refresh', limiteAuth, refrescarToken);
router.get('/perfil', protegerRuta, obtenerPerfil);

module.exports = router;
