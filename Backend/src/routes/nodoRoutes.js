const express = require('express');
const { listarNodos, marcarDominado, crearNodo, editarNodo } = require('../controllers/nodoController');
const { protegerRuta, soloAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(protegerRuta);

router.get('/', listarNodos);
router.patch('/:id/dominar', marcarDominado);

// Solo un usuario con rol 'admin' puede dar de alta o editar nodos
router.post('/', soloAdmin, crearNodo);
router.patch('/:id', soloAdmin, editarNodo);

module.exports = router;
