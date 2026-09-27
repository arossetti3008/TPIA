const express = require('express');
const { listarNodos, marcarDominado, crearNodo } = require('../controllers/nodoController');
const { protegerRuta, soloAdmin } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas de nodos requieren estar logueado
router.use(protegerRuta);

router.get('/', listarNodos);
router.patch('/:id/dominar', marcarDominado);

// Solo un usuario con rol 'admin' puede dar de alta nodos nuevos
router.post('/', soloAdmin, crearNodo);

module.exports = router;
