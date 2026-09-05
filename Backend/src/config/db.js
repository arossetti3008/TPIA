const mongoose = require('mongoose');

async function conectarDB() {
  try {
    const conexion = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB conectado: ${conexion.connection.host}`);
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
}

module.exports = conectarDB;
