const mongoose = require('mongoose');
const Nodo = require('../models/Nodo');
const Usuario = require('../models/Usuario');
const Conversacion = require('../models/Conversacion');
const Evaluacion = require('../models/Evaluacion');
const { calcularEstadoNodo } = require('../utils/calcularProgreso');
const { marcarNodoComoDominado } = require('../services/progresoService');
const { generarRespuestaTutor, evaluarDominio } = require('../services/geminiService');

// Valida que el nodo exista y que el usuario tenga acceso (no este bloqueado)
async function obtenerNodoYValidarAcceso(req, nodoId) {
  if (!mongoose.Types.ObjectId.isValid(nodoId)) {
    const error = new Error('Id de nodo invalido');
    error.statusCode = 400;
    throw error;
  }

  const nodo = await Nodo.findById(nodoId).lean();
  if (!nodo) {
    const error = new Error('Nodo no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const estado = calcularEstadoNodo(nodo, req.usuario.progreso);
  if (estado === 'bloqueado') {
    const error = new Error('Este nodo esta bloqueado, todavia no podes acceder a su tutor');
    error.statusCode = 403;
    throw error;
  }

  return nodo;
}

// GET /api/tutor/:nodoId/conversacion
// Devuelve el historial de mensajes con el tutor de ese nodo (vacio si es la primera vez)
async function obtenerConversacion(req, res, next) {
  try {
    const { nodoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(nodoId)) {
      return res.status(400).json({ mensaje: 'Id de nodo invalido' });
    }

    const conversacion = await Conversacion.findOne({
      usuario: req.usuario._id,
      nodo: nodoId,
    }).lean();

    res.json({ mensajes: conversacion ? conversacion.mensajes : [] });
  } catch (error) {
    next(error);
  }
}

// POST /api/tutor/:nodoId/mensaje
// El estudiante manda un mensaje, el tutor IA responde y ambos quedan guardados
async function enviarMensaje(req, res, next) {
  try {
    const { nodoId } = req.params;
    const { mensaje } = req.body;

    if (!mensaje || typeof mensaje !== 'string' || !mensaje.trim()) {
      return res.status(400).json({ mensaje: 'El mensaje no puede estar vacio' });
    }
    if (mensaje.length > 2000) {
      return res.status(400).json({ mensaje: 'El mensaje es demasiado largo (maximo 2000 caracteres)' });
    }

    const nodo = await obtenerNodoYValidarAcceso(req, nodoId);

    let conversacion = await Conversacion.findOne({ usuario: req.usuario._id, nodo: nodoId });
    if (!conversacion) {
      conversacion = new Conversacion({ usuario: req.usuario._id, nodo: nodoId, mensajes: [] });
    }

    conversacion.mensajes.push({ rol: 'estudiante', contenido: mensaje.trim() });

    const respuestaTutor = await generarRespuestaTutor(nodo, conversacion.mensajes);

    conversacion.mensajes.push({ rol: 'tutor', contenido: respuestaTutor });
    await conversacion.save();

    res.json({
      respuesta: respuestaTutor,
      conversacionId: conversacion._id,
      totalMensajes: conversacion.mensajes.length,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/tutor/:nodoId/evaluar
// Le pide al LLM que evalue toda la conversacion. Si aprueba, marca el
// nodo como dominado automaticamente (reutilizando el mismo servicio de
// la Fase 2, para que la logica de desbloqueo sea una sola en todo el sistema).
async function evaluar(req, res, next) {
  try {
    const { nodoId } = req.params;
    const nodo = await obtenerNodoYValidarAcceso(req, nodoId);

    const conversacion = await Conversacion.findOne({ usuario: req.usuario._id, nodo: nodoId });
    if (!conversacion || conversacion.mensajes.length < 2) {
      return res.status(400).json({
        mensaje: 'Todavia no hay suficiente conversacion con el tutor para evaluar este nodo',
      });
    }

    const { resultado, feedback } = await evaluarDominio(nodo, conversacion.mensajes);

    const evaluacion = await Evaluacion.create({
      usuario: req.usuario._id,
      nodo: nodoId,
      conversacion: conversacion._id,
      resultado,
      feedback,
      dominado: resultado === 'aprobado',
    });

    let arbolActualizado = null;
    if (resultado === 'aprobado') {
      const usuario = await Usuario.findById(req.usuario._id);
      const resultadoMarcar = await marcarNodoComoDominado(usuario, nodoId);
      arbolActualizado = resultadoMarcar.arbol;
    }

    res.json({
      resultado,
      feedback,
      evaluacionId: evaluacion._id,
      nodos: arbolActualizado,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { enviarMensaje, obtenerConversacion, evaluar };
