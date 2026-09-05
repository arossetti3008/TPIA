import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, guardarTokens, limpiarTokens, obtenerTokens } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarPerfil = useCallback(async () => {
    const { accessToken } = obtenerTokens();
    if (!accessToken) {
      setCargando(false);
      return;
    }
    try {
      const { usuario: perfil } = await api.perfil();
      setUsuario(perfil);
    } catch {
      limpiarTokens();
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  async function login(email, password) {
    const data = await api.login(email, password);
    guardarTokens(data);
    setUsuario(data.usuario);
    return data.usuario;
  }

  async function registrarse(nombre, email, password) {
    const data = await api.registro(nombre, email, password);
    guardarTokens(data);
    setUsuario(data.usuario);
    return data.usuario;
  }

  function logout() {
    limpiarTokens();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registrarse, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return contexto;
}
