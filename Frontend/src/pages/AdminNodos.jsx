import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

export default function AdminNodos() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [nodos, setNodos] = useState([]);
  const [editandoId, setEditandoId] = useState(null); // null = modo "crear"
  const [slugOriginal, setSlugOriginal] = useState('');
  const [concepto, setConcepto] = useState('');
  const [slug, setSlug] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prerequisitosSeleccionados, setPrerequisitosSeleccionados] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => {
    if (usuario && usuario.rol !== 'admin') {
      navigate('/');
    }
  }, [usuario, navigate]);

  useEffect(() => {
    cargarNodos();
  }, []);

  async function cargarNodos() {
    try {
      const { nodos: lista } = await api.listarNodos();
      setNodos(lista);
    } catch (err) {
      setError(err.message);
    }
  }

  function slugificar(texto) {
    return texto
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  function generarSlugDesdeConcepto(texto) {
    setConcepto(texto);
    if (editandoId) return; // en modo edicion el slug no se toca
    setSlug((actual) => (actual === '' || actual === slugificar(concepto) ? slugificar(texto) : actual));
  }

  function alternarPrerequisito(id) {
    setPrerequisitosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function empezarEdicion(nodo) {
    setEditandoId(nodo._id);
    setSlugOriginal(nodo.slug);
    setConcepto(nodo.concepto);
    setSlug(nodo.slug);
    setDescripcion(nodo.descripcion);
    setPrerequisitosSeleccionados((nodo.prerequisitos || []).map(String));
    setError('');
    setExito('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setSlugOriginal('');
    setConcepto('');
    setSlug('');
    setDescripcion('');
    setPrerequisitosSeleccionados([]);
    setError('');
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setExito('');

    if (!concepto.trim() || !descripcion.trim() || (!editandoId && !slug.trim())) {
      setError('Concepto, slug y descripción son obligatorios');
      return;
    }

    setEnviando(true);
    try {
      let data;
      if (editandoId) {
        data = await api.editarNodo(editandoId, {
          concepto: concepto.trim(),
          descripcion: descripcion.trim(),
          prerequisitos: prerequisitosSeleccionados,
        });
      } else {
        data = await api.crearNodo({
          concepto: concepto.trim(),
          slug: slug.trim(),
          descripcion: descripcion.trim(),
          prerequisitos: prerequisitosSeleccionados,
        });
      }
      setExito(data.mensaje);
      cancelarEdicion();
      cargarNodos();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (usuario && usuario.rol !== 'admin') {
    return null;
  }

  return (
    <div className="pantalla">
      <div className="contenido">
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>Panel de administración</h1>
        <p style={{ color: 'var(--texto-suave)', fontSize: 13, marginBottom: 24 }}>
          Los nodos que crees o edites acá quedan disponibles al instante: el tutor de Gemini
          genera preguntas y evaluaciones automáticamente a partir del concepto y la
          descripción, sin que haga falta tocar código.
        </p>

        {error && <div className="mensaje-error">{error}</div>}
        {exito && (
          <div
            style={{
              background: 'color-mix(in srgb, var(--exito) 20%, transparent)',
              color: 'var(--exito)',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            {exito}
          </div>
        )}

        {editandoId && (
          <div
            style={{
              background: 'var(--acento-suave)',
              color: 'var(--acento)',
              borderRadius: 10,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            Editando: {slugOriginal}
            <button
              type="button"
              onClick={cancelarEdicion}
              style={{ background: 'none', border: 'none', color: 'var(--acento)', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancelar ✕
            </button>
          </div>
        )}

        <form onSubmit={manejarSubmit}>
          <div className="campo">
            <label htmlFor="concepto">Concepto</label>
            <input
              id="concepto"
              value={concepto}
              onChange={(e) => generarSlugDesdeConcepto(e.target.value)}
              placeholder="Ej: Textura Visual"
            />
          </div>

          <div className="campo">
            <label htmlFor="slug">
              Slug (identificador único{editandoId ? ' — no editable' : ', se genera solo'})
            </label>
            <input
              id="slug"
              value={slug}
              disabled={!!editandoId}
              onChange={(e) => setSlug(slugificar(e.target.value))}
              style={editandoId ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            />
          </div>

          <div className="campo">
            <label htmlFor="descripcion">Descripción del concepto</label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              style={{
                border: '1.5px solid var(--borde)',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: 14,
                background: 'var(--bg-card)',
                color: 'var(--texto)',
                resize: 'vertical',
              }}
              placeholder="Esto es lo que el tutor de IA usa como base para armar sus preguntas"
            />
          </div>

          <div className="campo">
            <label>Prerrequisitos (opcional)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {nodos
                .filter((n) => n._id !== editandoId) // un nodo no puede ser prerequisito de si mismo
                .map((n) => (
                  <button
                    type="button"
                    key={n._id}
                    onClick={() => alternarPrerequisito(n._id)}
                    style={{
                      border: '1.5px solid var(--borde)',
                      borderRadius: 20,
                      padding: '6px 14px',
                      fontSize: 13,
                      background: prerequisitosSeleccionados.includes(n._id)
                        ? 'var(--acento)'
                        : 'var(--bg-card)',
                      color: prerequisitosSeleccionados.includes(n._id) ? '#fff' : 'var(--texto)',
                    }}
                  >
                    {n.concepto}
                  </button>
                ))}
              {nodos.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
                  Todavía no hay nodos creados.
                </p>
              )}
            </div>
          </div>

          <button type="submit" className="boton-primario" disabled={enviando} style={{ width: '100%' }}>
            {enviando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear nodo'}
          </button>
        </form>

        <h2 style={{ fontSize: 15, margin: '28px 0 12px' }}>Nodos existentes ({nodos.length})</h2>
        <p style={{ fontSize: 11, color: 'var(--texto-suave)', marginTop: -8, marginBottom: 12 }}>
          Toca un nodo para editarlo
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {nodos.map((n) => (
            <button
              key={n._id}
              onClick={() => empezarEdicion(n)}
              className="tarjeta"
              style={{
                padding: 12,
                textAlign: 'left',
                border: editandoId === n._id ? '1.5px solid var(--acento)' : '1px solid transparent',
                width: '100%',
              }}
            >
              <strong style={{ fontSize: 13 }}>{n.concepto}</strong>
              <span style={{ fontSize: 11, color: 'var(--texto-suave)', marginLeft: 8 }}>/{n.slug}</span>
              <p style={{ fontSize: 12, color: 'var(--texto-suave)', marginTop: 4 }}>{n.descripcion}</p>
            </button>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
