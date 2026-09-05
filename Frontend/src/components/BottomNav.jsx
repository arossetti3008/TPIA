import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/', label: 'Árbol', icono: '🌳' },
  { to: '/perfil', label: 'Perfil', icono: '👤' },
];

export default function BottomNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--borde)',
        padding: '10px 0',
      }}
    >
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontWeight: 600,
            textDecoration: 'none',
            color: isActive ? 'var(--acento)' : 'var(--texto-suave)',
          })}
        >
          <span style={{ fontSize: 20 }}>{item.icono}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
