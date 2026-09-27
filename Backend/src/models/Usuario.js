const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const progresoSchema = new mongoose.Schema(
  {
    nodo: { type: mongoose.Schema.Types.ObjectId, ref: 'Nodo', required: true },
    estado: {
      type: String,
      enum: ['bloqueado', 'en_progreso', 'dominado'],
      default: 'bloqueado',
    },
    fechaDominado: { type: Date },
  },
  { _id: false }
);

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalido'],
    },
    // El hash de la contrasena nunca se devuelve en las consultas por defecto
    passwordHash: { type: String, required: true, select: false },
    nivelDificultad: {
      type: String,
      enum: ['basico', 'intermedio', 'exigente'],
      default: 'intermedio',
    },
    // 'admin' habilita crear nodos nuevos desde la interfaz. Nunca se puede
    // setear via /auth/registro: se activa a mano en la base, una sola vez,
    // para evitar que cualquiera se auto-otorgue privilegios.
    rol: {
      type: String,
      enum: ['estudiante', 'admin'],
      default: 'estudiante',
    },
    progreso: [progresoSchema],
  },
  { timestamps: true }
);

// Hashea la contrasena antes de guardarla, solo si fue modificada
usuarioSchema.pre('save', async function siguiente(next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

usuarioSchema.methods.compararPassword = function compararPassword(passwordPlano) {
  return bcrypt.compare(passwordPlano, this.passwordHash);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
