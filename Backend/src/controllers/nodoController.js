const mongoose = require('mongoose');
const Nodo = require('../models/Nodo');
const Usuario = require('../models/Usuario');
const { calcularArbolConEstados, calcularEstadoNodo } = require('../utils/calcularProgreso');

// GET /api/nodos
// Devuelve el catalogo completo de nodos, con el estado (bloqueado /
// en_progreso / dominado) calculado para el usuario autenticado.
async function listarNodos(req, res, next) {
  try {
    const nodos = await Nodo.find().lean();
    const arbol = calcularArbolConEstados(nodos, req.usuario.progreso);
    res.json({ nodos: arbol });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/nodos/:id/dominar
// Marca un nodo como dominado para el usuario autenticado, siempre y
// cuando sus prerequisitos ya esten cumplidos. Esta es la version manual
// (boton "Marcar como dominado" del wireframe); en la Fase 3 el agente
// tutor va a llamar a esta misma logica automaticamente tras evaluar al
// estudiante.
async function marcarDominado(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: 'Id de nodo invalido' });
    }

    const nodo = await Nodo.findById(id).lean();
    if (!nodo) {
      return res.status(404).json({ mensaje: 'Nodo no encontrado' });
    }

    const usuario = await Usuario.findById(req.usuario._id);
    const estadoActual = calcularEstadoNodo(nodo, usuario.progreso);

    if (estadoActual === 'bloqueado') {
      return res.status(403).json({
        mensaje: 'Este nodo esta bloqueado, primero tenes que dominar sus prerequisitos',
      });
    }

    const entradaExistente = usuario.progreso.find((p) => p.nodo.toString() === id);

    if (entradaExistente) {
      entradaExistente.estado = 'dominado';
      entradaExistente.fechaDominado = new Date();
    } else {
      usuario.progreso.push({ nodo: id, estado: 'dominado', fechaDominado: new Date() });
    }

    await usuario.save();

    const nodosActualizados = await Nodo.find().lean();
    const arbol = calcularArbolConEstados(nodosActualizados, usuario.progreso);

    res.json({ mensaje: `Nodo "${nodo.concepto}" marcado como dominado`, nodos: arbol });
  } catch (error) {
    next(error);
  }
}

module.exports = { listarNodos, marcarDominado };
