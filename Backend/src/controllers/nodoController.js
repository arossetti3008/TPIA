const mongoose = require('mongoose');
const Nodo = require('../models/Nodo');
const Usuario = require('../models/Usuario');
const { calcularArbolConEstados } = require('../utils/calcularProgreso');
const { marcarNodoComoDominado } = require('../services/progresoService');

// GET /api/nodos
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

async function validarYNormalizarPrerequisitos(prerequisitos, idAExcluir) {
  if (!Array.isArray(prerequisitos) || prerequisitos.length === 0) return [];

  const idsValidos = prerequisitos.filter(
    (id) => mongoose.Types.ObjectId.isValid(id) && id !== String(idAExcluir)
  );
  const encontrados = await Nodo.find({ _id: { $in: idsValidos } }).select('_id');
  return encontrados.map((n) => n._id);
}

// POST /api/nodos
// SOLO ADMIN. Crea un concepto nuevo. El tutor de Gemini funciona sobre el
// automaticamente en cuanto existe: arma el prompt en tiempo real a partir
// de nodo.concepto y nodo.descripcion, nada queda hardcodeado por nodo.
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

    const prerequisitosValidos = await validarYNormalizarPrerequisitos(prerequisitos, null);

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

// PATCH /api/nodos/:id
// SOLO ADMIN. Edita un nodo existente: concepto, descripcion y prerequisitos.
// El slug NO se puede editar aca a proposito: el frontend (SkillTree,
// contenido educativo por concepto) usa el slug como clave fija, y
// cambiarlo silenciosamente rompería esas referencias.
async function editarNodo(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: 'Id de nodo invalido' });
    }

    const nodo = await Nodo.findById(id);
    if (!nodo) {
      return res.status(404).json({ mensaje: 'Nodo no encontrado' });
    }

    const { concepto, descripcion, prerequisitos } = req.body;

    if (concepto !== undefined) {
      if (!concepto.trim()) {
        return res.status(400).json({ mensaje: 'El concepto no puede quedar vacio' });
      }
      nodo.concepto = concepto.trim();
    }

    if (descripcion !== undefined) {
      if (!descripcion.trim()) {
        return res.status(400).json({ mensaje: 'La descripcion no puede quedar vacia' });
      }
      nodo.descripcion = descripcion.trim();
    }

    if (prerequisitos !== undefined) {
      nodo.prerequisitos = await validarYNormalizarPrerequisitos(prerequisitos, id);
    }

    await nodo.save();

    res.json({ mensaje: `Nodo "${nodo.concepto}" actualizado correctamente`, nodo });
  } catch (error) {
    next(error);
  }
}

module.exports = { listarNodos, marcarDominado, crearNodo, editarNodo };
