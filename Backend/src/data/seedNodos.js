// Script de una sola vez para poblar MongoDB con el catalogo de nodos.
// Ejecutar con: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const conectarDB = require('../config/db');
const Nodo = require('../models/Nodo');

async function seed() {
  await conectarDB();

  await Nodo.deleteMany({});

  const contraste = await Nodo.create({
    concepto: 'Contraste',
    slug: 'contraste',
    descripcion: 'Diferencia perceptible entre elementos que genera jerarquia visual.',
    prerequisitos: [],
  });

  const ritmo = await Nodo.create({
    concepto: 'Ritmo',
    slug: 'ritmo',
    descripcion: 'Repeticion ordenada de elementos que guia el ojo y genera movimiento.',
    prerequisitos: [contraste._id],
  });

  const jerarquia = await Nodo.create({
    concepto: 'Jerarquia',
    slug: 'jerarquia',
    descripcion: 'Organizacion de elementos segun su importancia relativa.',
    prerequisitos: [contraste._id],
  });

  await Nodo.create({
    concepto: 'Gestalt',
    slug: 'gestalt',
    descripcion: 'Principios de percepcion visual: proximidad, similitud, cierre y continuidad.',
    prerequisitos: [ritmo._id],
  });

  await Nodo.create({
    concepto: 'Tension',
    slug: 'tension',
    descripcion: 'Equilibrio inestable entre elementos que genera dinamismo visual.',
    prerequisitos: [jerarquia._id],
  });

  console.log('Nodos creados correctamente.');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((error) => {
  console.error('Error al poblar la base:', error);
  process.exit(1);
});
