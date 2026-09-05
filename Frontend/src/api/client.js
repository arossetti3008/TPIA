// Todas las llamadas al backend pasan por aca. Se encarga de:
// - agregar el token de autenticacion a cada request
// - renovarlo solo con el refreshToken si el accessToken vencio
// - devolver errores en un formato consistente para el resto de la app

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function obtenerTokens() {
  return {
    accessToken: localStorage.getItem('nodos_accessToken'),
    refreshToken: localStorage.getItem('nodos_refreshToken'),
  };
}

function guardarTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem('nodos_accessToken', accessToken);
  if (refreshToken) localStorage.setItem('nodos_refreshToken', refreshToken);
}

function limpiarTokens() {
  localStorage.removeItem('nodos_accessToken');
  localStorage.removeItem('nodos_refreshToken');
}

async function intentarRefrescar() {
  const { refreshToken } = obtenerTokens();
  if (!refreshToken) return null;

  try {
    const respuesta = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!respuesta.ok) return null;
    const data = await respuesta.json();
    guardarTokens({ accessToken: data.accessToken });
    return data.accessToken;
  } catch {
    return null;
  }
}

// Wrapper principal. path es relativo (ej: "/nodos"), sin incluir /api.
async function apiFetch(path, { method = 'GET', body, autenticado = true } = {}) {
  const hacerRequest = async (token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (autenticado && token) headers.Authorization = `Bearer ${token}`;

    return fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  const { accessToken } = obtenerTokens();
  let respuesta = await hacerRequest(accessToken);

  // Si el token vencio (401) y la ruta requiere auth, intentamos refrescar UNA vez
  if (respuesta.status === 401 && autenticado) {
    const nuevoToken = await intentarRefrescar();
    if (nuevoToken) {
      respuesta = await hacerRequest(nuevoToken);
    } else {
      limpiarTokens();
    }
  }

  const data = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const error = new Error(data.mensaje || 'Ocurrio un error inesperado');
    error.statusCode = respuesta.status;
    throw error;
  }

  return data;
}

export const api = {
  registro: (nombre, email, password) =>
    apiFetch('/auth/registro', { method: 'POST', body: { nombre, email, password }, autenticado: false }),

  login: (email, password) =>
    apiFetch('/auth/login', { method: 'POST', body: { email, password }, autenticado: false }),

  perfil: () => apiFetch('/auth/perfil'),

  listarNodos: () => apiFetch('/nodos'),

  marcarDominado: (nodoId) => apiFetch(`/nodos/${nodoId}/dominar`, { method: 'PATCH' }),

  obtenerConversacion: (nodoId) => apiFetch(`/tutor/${nodoId}/conversacion`),

  enviarMensajeTutor: (nodoId, mensaje) =>
    apiFetch(`/tutor/${nodoId}/mensaje`, { method: 'POST', body: { mensaje } }),

  evaluarNodo: (nodoId) => apiFetch(`/tutor/${nodoId}/evaluar`, { method: 'POST' }),
};

export { guardarTokens, limpiarTokens, obtenerTokens };
