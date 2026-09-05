const mongoose = require('mongoose');

const nodoSchema = new mongoose.Schema(
  {
    concepto: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    descripcion: { type: String, required: true },
    // Nodos que hay que dominar antes de desbloquear este
    prerequisitos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Nodo' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Nodo', nodoSchema);
