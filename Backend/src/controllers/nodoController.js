const mongoose = require('mongoose');
const Nodo = require('../models/Nodo');
const Usuario = require('../models/Usuario');
const { calcularArbolConEstados } = require('../utils/calcularProgreso');
const { marcarNodoComoDominado } = require('../services/progresoService');

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
// cuando sus prerequisitos ya esten cumplidos.
async function marcarDominado(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: 'Id de nodo invalido' });
    }

    const usuario = await Usuario.findById(req.usuario._id);
    const { nodo, arbol } = await marcarNodoComoDominado(usuario, id);

    res.json({ mensaje: `Nodo "${nodo.concepto}" marcado como dominado`, nodos: arbol });
  } catch (error) {
    next(error);
  }
}

// POST /api/nodos
// SOLO ADMIN (ver middleware soloAdmin en las rutas). Crea un concepto
// nuevo en el arbol. En cuanto existe, el tutor de Gemini funciona sobre
// el automaticamente: no hace falta tocar nada mas del codigo, porque
// GeminiService arma el prompt a partir de nodo.concepto y nodo.descripcion
// en tiempo real, sin nada hardcodeado por nodo.
async function crearNodo(req, res, next) {
  try {
    const { concepto, slug, descripcion, prerequisitos } = req.body;

    if (!concepto || !slug || !descripcion) {
      return res.status(400).json({ mensaje: 'concepto, slug y descripcion son obligatorios' });
    }

    const slugNormalizado = slug.trim().toLowerCase().replace(/\s+/g, '-');

    const yaExiste = await Nodo.findOne({ slug: slugNormalizado });
    if (yaExiste) {
      return res.status(409).json({ mensaje: `Ya existe un nodo con el slug "${slugNormalizado}"` });
    }

    let prerequisitosValidos = [];
    if (Array.isArray(prerequisitos) && prerequisitos.length > 0) {
      const idsValidos = prerequisitos.filter((id) => mongoose.Types.ObjectId.isValid(id));
      const encontrados = await Nodo.find({ _id: { $in: idsValidos } }).select('_id');
      prerequisitosValidos = encontrados.map((n) => n._id);
    }

    const nodo = await Nodo.create({
      concepto: concepto.trim(),
      slug: slugNormalizado,
      descripcion: descripcion.trim(),
      prerequisitos: prerequisitosValidos,
    });

    res.status(201).json({ mensaje: `Nodo "${nodo.concepto}" creado correctamente`, nodo });
  } catch (error) {
    next(error);
  }
}

module.exports = { listarNodos, marcarDominado, crearNodo };
