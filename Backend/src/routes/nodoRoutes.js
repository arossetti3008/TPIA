const express = require('express');
const { listarNodos, marcarDominado } = require('../controllers/nodoController');
const { protegerRuta } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas de nodos requieren estar logueado
router.use(protegerRuta);

router.get('/', listarNodos);
router.patch('/:id/dominar', marcarDominado);

module.exports = router;
