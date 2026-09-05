const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema(
  {
    rol: { type: String, enum: ['estudiante', 'tutor'], required: true },
    // Limite de longitud para evitar abusos que gasten cuota del LLM innecesariamente
    contenido: { type: String, required: true, maxlength: 2000 },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversacionSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    nodo: { type: mongoose.Schema.Types.ObjectId, ref: 'Nodo', required: true },
    mensajes: [mensajeSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversacion', conversacionSchema);
