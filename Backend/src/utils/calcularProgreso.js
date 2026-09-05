// Calcula el estado de un nodo para un usuario especifico, sin tocar la base.
// Esto se mantiene separado del controlador para poder testearlo facilmente
// y para que la logica de desbloqueo viva en un solo lugar.

function calcularEstadoNodo(nodo, progresoUsuario) {
  const entrada = progresoUsuario.find((p) => p.nodo.toString() === nodo._id.toString());

  if (entrada && entrada.estado === 'dominado') return 'dominado';

  const prerequisitosIds = (nodo.prerequisitos || []).map((p) => p.toString());
  const prerequisitosCumplidos = prerequisitosIds.every((prereqId) =>
    progresoUsuario.some((p) => p.nodo.toString() === prereqId && p.estado === 'dominado')
  );

  if (prerequisitosCumplidos) return 'en_progreso';

  return 'bloqueado';
}

// Recibe la lista completa de nodos (catalogo) y el progreso del usuario,
// devuelve los nodos con su estado calculado para ese usuario.
function calcularArbolConEstados(nodos, progresoUsuario) {
  return nodos.map((nodo) => ({
    _id: nodo._id,
    concepto: nodo.concepto,
    slug: nodo.slug,
    descripcion: nodo.descripcion,
    prerequisitos: nodo.prerequisitos,
    estado: calcularEstadoNodo(nodo, progresoUsuario),
  }));
}

module.exports = { calcularEstadoNodo, calcularArbolConEstados };
