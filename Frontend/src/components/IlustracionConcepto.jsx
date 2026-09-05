// Ilustraciones abstractas simples, dibujadas con formas basicas propias
// (sin usar imagenes de terceros), para la seccion "Imagen de referencia".
export default function IlustracionConcepto({ slug }) {
  switch (slug) {
    case 'contraste':
      return (
        <svg viewBox="0 0 200 100" width="100%">
          <rect width="100" height="100" fill="var(--texto)" />
          <rect x="100" width="100" height="100" fill="var(--bg-card)" />
        </svg>
      );
    case 'ritmo':
      return (
        <svg viewBox="0 0 200 100" width="100%">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={10 + i * 32} y="20" width="14" height="60" fill="var(--acento)" opacity={0.85} />
          ))}
        </svg>
      );
    case 'jerarquia':
      return (
        <svg viewBox="0 0 200 100" width="100%">
          <circle cx="45" cy="55" r="38" fill="var(--acento)" />
          <circle cx="125" cy="60" r="24" fill="var(--acento)" opacity={0.65} />
          <circle cx="175" cy="65" r="12" fill="var(--acento)" opacity={0.4} />
        </svg>
      );
    case 'gestalt':
      return (
        <svg viewBox="0 0 200 100" width="100%">
          {[
            [30, 35], [48, 35], [30, 53], [48, 53],
            [140, 40], [158, 40], [140, 58], [158, 58],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="7" fill="var(--acento)" />
          ))}
        </svg>
      );
    case 'tension':
      return (
        <svg viewBox="0 0 200 100" width="100%">
          <polygon points="100,15 140,85 60,85" fill="var(--acento)" transform="rotate(18 100 50)" />
          <circle cx="100" cy="88" r="3" fill="var(--texto-suave)" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 200 100" width="100%">
          <rect width="200" height="100" rx="8" fill="var(--bloqueado-bg)" />
        </svg>
      );
  }
}
