const Nodo = require('../models/Nodo');
const { calcularEstadoNodo, calcularArbolConEstados } = require('../utils/calcularProgreso');

// Marca un nodo como dominado para el usuario dado, validando que no este
// bloqueado. Lanza errores con .statusCode para que el controlador que
// llame a esta funcion los pueda pasar directo a next(error).
async function marcarNodoComoDominado(usuario, nodoId) {
  const nodo = await Nodo.findById(nodoId).lean();
  if (!nodo) {
    const error = new Error('Nodo no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const estadoActual = calcularEstadoNodo(nodo, usuario.progreso);
  if (estadoActual === 'bloqueado') {
    const error = new Error('Este nodo esta bloqueado, primero tenes que dominar sus prerequisitos');
    error.statusCode = 403;
    throw error;
  }

  const entradaExistente = usuario.progreso.find((p) => p.nodo.toString() === nodoId.toString());
  if (entradaExistente) {
    entradaExistente.estado = 'dominado';
    entradaExistente.fechaDominado = new Date();
  } else {
    usuario.progreso.push({ nodo: nodoId, estado: 'dominado', fechaDominado: new Date() });
  }

  await usuario.save();

  const nodosActualizados = await Nodo.find().lean();
  const arbol = calcularArbolConEstados(nodosActualizados, usuario.progreso);

  return { nodo, arbol };
}

module.exports = { marcarNodoComoDominado };
