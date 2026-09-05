// Layout fijo pensado para los 5 conceptos del wireframe del TP.
// Si el dia de manana se agregan mas conceptos, esto se puede migrar a un
// layout automatico (ej: libreria de grafos), pero para el alcance actual
// un mapa de posiciones a mano replica exactamente el wireframe de Figma.
const POSICIONES = {
  contraste: { x: 150, y: 60 },
  ritmo: { x: 75, y: 180 },
  jerarquia: { x: 225, y: 180 },
  gestalt: { x: 75, y: 300 },
  tension: { x: 225, y: 300 },
};

const POSICION_FALLBACK = { x: 150, y: 380 };

const COLOR_POR_ESTADO = {
  dominado: { relleno: 'var(--acento)', borde: 'var(--acento-oscuro)', texto: '#fff' },
  en_progreso: { relleno: 'var(--bg-card)', borde: 'var(--acento)', texto: 'var(--texto)' },
  bloqueado: { relleno: 'var(--bloqueado-bg)', borde: 'var(--bloqueado)', texto: 'var(--bloqueado)' },
};

function obtenerPosicion(slug) {
  return POSICIONES[slug] || POSICION_FALLBACK;
}

export default function SkillTree({ nodos, onSeleccionar }) {
  const radio = 34;

  return (
    <svg viewBox="0 0 300 360" width="100%" role="img" aria-label="Árbol de habilidades de lenguaje visual">
      {/* Lineas de conexion, dibujadas primero para que queden detras de los nodos */}
      {nodos.map((nodo) =>
        (nodo.prerequisitos || []).map((prereqId) => {
          const prereq = nodos.find((n) => n._id === prereqId);
          if (!prereq) return null;
          const desde = obtenerPosicion(prereq.slug);
          const hasta = obtenerPosicion(nodo.slug);
          const desbloqueada = prereq.estado === 'dominado';
          return (
            <line
              key={`${prereq._id}-${nodo._id}`}
              x1={desde.x}
              y1={desde.y}
              x2={hasta.x}
              y2={hasta.y}
              stroke={desbloqueada ? 'var(--acento)' : 'var(--borde)'}
              strokeWidth={2}
              strokeDasharray={desbloqueada ? '0' : '4 4'}
            />
          );
        })
      )}

      {/* Nodos */}
      {nodos.map((nodo) => {
        const pos = obtenerPosicion(nodo.slug);
        const colores = COLOR_POR_ESTADO[nodo.estado] || COLOR_POR_ESTADO.bloqueado;
        const clickeable = nodo.estado !== 'bloqueado';

        return (
          <g
            key={nodo._id}
            transform={`translate(${pos.x}, ${pos.y})`}
            style={{ cursor: clickeable ? 'pointer' : 'not-allowed' }}
            onClick={() => clickeable && onSeleccionar(nodo)}
            role={clickeable ? 'button' : undefined}
            tabIndex={clickeable ? 0 : undefined}
            onKeyDown={(e) => {
              if (clickeable && (e.key === 'Enter' || e.key === ' ')) onSeleccionar(nodo);
            }}
            aria-label={`${nodo.concepto}: ${nodo.estado.replace('_', ' ')}`}
          >
            <circle r={radio} fill={colores.relleno} stroke={colores.borde} strokeWidth={2.5} />
            {nodo.estado === 'dominado' && (
              <path
                d="M -10 0 L -3 8 L 11 -9"
                stroke="#fff"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
            {nodo.estado === 'bloqueado' && (
              <g>
                <rect x={-8} y={-2} width={16} height={13} rx={2} fill={colores.borde} />
                <path
                  d="M -5 -2 V -6 A 5 5 0 0 1 5 -6 V -2"
                  stroke={colores.borde}
                  strokeWidth={2.2}
                  fill="none"
                />
              </g>
            )}
            <text
              y={radio + 16}
              textAnchor="middle"
              fontFamily="var(--fuente-cuerpo)"
              fontSize="11"
              fontWeight={nodo.estado === 'bloqueado' ? 500 : 600}
              fill={nodo.estado === 'bloqueado' ? 'var(--bloqueado)' : 'var(--texto)'}
            >
              {nodo.concepto}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
