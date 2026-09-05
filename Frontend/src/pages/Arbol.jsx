import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import SkillTree from '../components/SkillTree';
import BottomNav from '../components/BottomNav';

export default function Arbol() {
  const [nodos, setNodos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    cargarNodos();
  }, []);

  async function cargarNodos() {
    setCargando(true);
    setError('');
    try {
      const { nodos: lista } = await api.listarNodos();
      setNodos(lista);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const dominados = nodos.filter((n) => n.estado === 'dominado').length;
  const progreso = nodos.length ? Math.round((dominados / nodos.length) * 100) : 0;
  // Heuristica simple de "nivel" en base a cuantos conceptos domino, ya que
  // el backend no trackea experiencia/nivel como un valor propio todavia.
  const nivel = Math.floor(dominados / 2) + 1;
  const siguienteNodo = nodos.find((n) => n.estado === 'en_progreso');
  const indiceSiguiente = nodos.findIndex((n) => n._id === siguienteNodo?._id);

  return (
    <div className="pantalla">
      <div className="contenido">
        {/* Tarjeta de header: logo, avatar, progreso general */}
        <div className="tarjeta" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h1 style={{ fontSize: 20 }}>Nódos</h1>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--acento-suave)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: 'var(--acento)',
                fontSize: 13,
              }}
            >
              {usuario?.nombre?.[0]?.toUpperCase() || '?'}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: 'var(--texto-suave)' }}>Progreso general</span>
            <span style={{ fontWeight: 700, color: 'var(--acento)' }}>{progreso}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--bloqueado-bg)', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progreso}%`,
                background: 'var(--acento)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <p style={{ fontSize: 12, color: 'var(--texto-suave)', marginTop: 6 }}>
            {dominados} de {nodos.length} conceptos completados · Nivel {nivel}
          </p>
        </div>

        {/* Titulo y leyenda del arbol */}
        <h2 style={{ fontSize: 16, marginBottom: 2 }}>Árbol de habilidades</h2>
        <p style={{ fontSize: 12, color: 'var(--texto-suave)', marginBottom: 12 }}>
          Toca un nodo para ver detalles
        </p>

        <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--texto-suave)', marginBottom: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--acento)', display: 'inline-block' }} />
            Completado
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                border: '1.5px solid var(--acento)',
                display: 'inline-block',
              }}
            />
            En progreso
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                border: '1.5px solid var(--bloqueado)',
                display: 'inline-block',
              }}
            />
            Bloqueado
          </span>
        </div>

        {error && <div className="mensaje-error">{error}</div>}

        {cargando ? (
          <p style={{ textAlign: 'center', color: 'var(--texto-suave)', padding: '40px 0' }}>Cargando árbol...</p>
        ) : (
          <div className="tarjeta" style={{ padding: '20px 12px' }}>
            <SkillTree nodos={nodos} onSeleccionar={(nodo) => navigate(`/nodo/${nodo._id}`)} />
          </div>
        )}

        {siguienteNodo && (
          <div className="tarjeta" style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700 }}>Continuar: {siguienteNodo.concepto}</p>
              <p style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
                Lección {indiceSiguiente + 1} de {nodos.length}
              </p>
            </div>
            <button className="boton-primario" onClick={() => navigate(`/nodo/${siguienteNodo._id}`)}>
              Continuar →
            </button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
