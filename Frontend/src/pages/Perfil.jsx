import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/client';
import BottomNav from '../components/BottomNav';

const ETIQUETA_NIVEL = {
  basico: 'Nivel Básico',
  intermedio: 'Nivel Intermedio',
  exigente: 'Nivel Exigente',
};

export default function Perfil() {
  const { usuario, logout } = useAuth();
  const { tema, alternarTema } = useTheme();
  const [nodos, setNodos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [avisoEdicion, setAvisoEdicion] = useState(false);

  useEffect(() => {
    api
      .listarNodos()
      .then(({ nodos: lista }) => setNodos(lista))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const dominados = nodos.filter((n) => n.estado === 'dominado').length;
  const enCurso = nodos.filter((n) => n.estado === 'en_progreso').length;
  const handle = '@' + (usuario?.nombre || 'usuario').replace(/\s+/g, '');

  return (
    <div className="pantalla">
      <div className="contenido">
        <span className="eyebrow">Tu perfil de aprendizaje</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '10px 0 8px' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--acento-suave)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: 'var(--acento)',
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {usuario?.nombre?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 style={{ fontSize: 17 }}>{handle}</h1>
            <p style={{ color: 'var(--texto-suave)', fontSize: 12 }}>{usuario?.email}</p>
          </div>
        </div>

        <span
          style={{
            display: 'inline-block',
            background: 'var(--acento-suave)',
            color: 'var(--acento)',
            fontSize: 12,
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: 20,
            marginBottom: 16,
          }}
        >
          ⏱ {ETIQUETA_NIVEL[usuario?.nivelDificultad] || 'Nivel Intermedio'}
        </span>

        <button
          className="boton-secundario"
          style={{ width: '100%', marginBottom: 26 }}
          onClick={() => setAvisoEdicion(true)}
        >
          Editar perfil
        </button>
        {avisoEdicion && (
          <p style={{ fontSize: 12, color: 'var(--texto-suave)', marginTop: -18, marginBottom: 20 }}>
            La edición de perfil llega en una próxima fase.
          </p>
        )}

        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Tu progreso</h2>
        {cargando ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Cargando métricas...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
            <TarjetaMetrica valor={dominados} etiqueta="Nodos dominados" icono="🎯" color="var(--acento)" />
            <TarjetaMetrica valor="—" etiqueta="Racha de estudio" icono="🔥" color="var(--error)" />
            <TarjetaMetrica valor={enCurso} etiqueta="Conceptos en curso" icono="📖" color="var(--azul)" />
            <TarjetaMetrica valor="—" etiqueta="Tiempo total" icono="🕐" color="var(--amarillo)" />
          </div>
        )}
        <p style={{ fontSize: 11, color: 'var(--texto-suave)', marginBottom: 26 }}>
          Racha y tiempo total se habilitan cuando sumemos seguimiento de sesiones.
        </p>

        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Ajustes</h2>
        <div className="tarjeta" style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <FilaAjuste
            icono="🎚️"
            titulo="Dificultad del tutor IA"
            subtitulo={`${ETIQUETA_NIVEL[usuario?.nivelDificultad] || 'Nivel Intermedio'} — se ajusta al crear la cuenta por ahora`}
          />

          <FilaAjuste
            icono="🌙"
            titulo="Modo oscuro"
            subtitulo="Reduce el brillo por la noche"
            control={
              <button
                className="toggle"
                data-activo={tema === 'dark'}
                onClick={alternarTema}
                role="switch"
                aria-checked={tema === 'dark'}
                aria-label="Alternar modo oscuro"
              >
                <span className="toggle-knob" />
              </button>
            }
          />

          <FilaAjuste icono="🔔" titulo="Notificaciones" subtitulo="Próximamente" />
        </div>

        <button className="boton-secundario" onClick={logout} style={{ width: '100%' }}>
          Cerrar sesión
        </button>
      </div>
      <BottomNav />
    </div>
  );
}

function TarjetaMetrica({ valor, etiqueta, icono, color }) {
  return (
    <div className="tarjeta" style={{ padding: 16 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'color-mix(in srgb, ' + color + ' 20%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          marginBottom: 8,
        }}
      >
        {icono}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--fuente-display)' }}>{valor}</div>
      <div style={{ fontSize: 11, color: 'var(--texto-suave)' }}>{etiqueta}</div>
    </div>
  );
}

function FilaAjuste({ icono, titulo, subtitulo, control }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 18 }}>{icono}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600 }}>{titulo}</p>
        <p style={{ fontSize: 11, color: 'var(--texto-suave)' }}>{subtitulo}</p>
      </div>
      {control}
    </div>
  );
}
