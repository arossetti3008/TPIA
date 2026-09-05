import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await login(email, password);
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
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Nódos</h1>
        <p style={{ color: 'var(--texto-suave)', marginBottom: 32 }}>
          Iniciá sesión para seguir tu progreso en lenguaje visual.
        </p>

        {error && <div className="mensaje-error">{error}</div>}

        <form onSubmit={manejarSubmit}>
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
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="boton-primario" disabled={enviando} style={{ width: '100%' }}>
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--texto-suave)' }}>
          ¿No tenés cuenta? <Link to="/registro" style={{ color: 'var(--acento)', fontWeight: 600 }}>Registrate</Link>
        </p>
      </div>
    </div>
  );
}
