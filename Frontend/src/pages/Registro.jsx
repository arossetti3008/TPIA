import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { registrarse } = useAuth();
  const navigate = useNavigate();

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setEnviando(true);
    try {
      await registrarse(nombre, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pantalla" style={{ paddingBottom: 24 }}>
      <div className="contenido" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Creá tu cuenta</h1>
        <p style={{ color: 'var(--texto-suave)', marginBottom: 32 }}>
          Empezá a repasar lenguaje visual a tu ritmo.
        </p>

        {error && <div className="mensaje-error">{error}</div>}

        <form onSubmit={manejarSubmit}>
          <div className="campo">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="campo">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="boton-primario" disabled={enviando} style={{ width: '100%' }}>
            {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--texto-suave)' }}>
          ¿Ya tenés cuenta? <Link to="/login" style={{ color: 'var(--acento)', fontWeight: 600 }}>Ingresá</Link>
        </p>
      </div>
    </div>
  );
}
