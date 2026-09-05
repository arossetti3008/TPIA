const mongoose = require('mongoose');

const evaluacionSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    nodo: { type: mongoose.Schema.Types.ObjectId, ref: 'Nodo', required: true },
    conversacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversacion', required: true },
    resultado: { type: String, enum: ['aprobado', 'a_reforzar'], required: true },
    feedback: { type: String, required: true },
    dominado: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Evaluacion', evaluacionSchema);
