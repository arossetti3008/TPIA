// Layout fijo pensado para los 5 conceptos del wireframe del TP.
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

// --- Generacion de formas organicas, deterministica por nodo ---
// Cada nodo tiene una "semilla" fija (su slug o id), asi que su forma no
// cambia entre renders, pero cada nodo se ve levemente distinto de los
// demas: como si estuvieran dibujados a mano en vez de ser circulos
// perfectos de vector.
function hashCadena(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function crearGeneradorAleatorio(seed) {
  let s = seed;
  return function siguiente() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function generarFormaOrganica(radioBase, seedTexto, puntos = 9, variacionRadio = 0.14, variacionAngulo = 0.35) {
  const rand = crearGeneradorAleatorio(hashCadena(seedTexto || 'default'));
  const angulos = [];
  const radios = [];

  for (let i = 0; i < puntos; i++) {
    const anguloBase = (i / puntos) * Math.PI * 2;
    const jitterAngulo = (rand() - 0.5) * ((Math.PI * 2) / puntos) * variacionAngulo;
    angulos.push(anguloBase + jitterAngulo);
    radios.push(radioBase * (1 + (rand() - 0.5) * 2 * variacionRadio));
  }

  const puntosXY = angulos.map((a, i) => [Math.cos(a) * radios[i], Math.sin(a) * radios[i]]);

  // Curva suave y cerrada (Catmull-Rom convertida a Bezier) entre los puntos,
  // para que la irregularidad se vea organica y no como un poligono picudo.
  const n = puntosXY.length;
  const d = [`M ${puntosXY[0][0].toFixed(2)} ${puntosXY[0][1].toFixed(2)}`];
  for (let i = 0; i < n; i++) {
    const p0 = puntosXY[(i - 1 + n) % n];
    const p1 = puntosXY[i];
    const p2 = puntosXY[(i + 1) % n];
    const p3 = puntosXY[(i + 2) % n];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(
      `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
    );
  }
  d.push('Z');
  return d.join(' ');
}

export default function SkillTree({ nodos, onSeleccionar }) {
  const radio = 34;

  return (
    <svg viewBox="0 0 300 360" width="100%" role="img" aria-label="Árbol de habilidades de lenguaje visual">
      <defs>
        <filter id="sombraNodo" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>

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
        const formaPath = generarFormaOrganica(radio, nodo.slug || nodo._id);

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
            <path
              d={formaPath}
              fill={colores.relleno}
              stroke={colores.borde}
              strokeWidth={2.5}
              strokeLinejoin="round"
              filter="url(#sombraNodo)"
            />
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
              y={radio + 18}
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
