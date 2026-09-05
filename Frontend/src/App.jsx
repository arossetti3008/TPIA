import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import RutaProtegida from './components/ProtectedRoute';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Arbol from './pages/Arbol';
import NodoActivo from './pages/NodoActivo';
import Perfil from './pages/Perfil';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route
              path="/"
              element={
                <RutaProtegida>
                  <Arbol />
                </RutaProtegida>
              }
            />
            <Route
              path="/nodo/:id"
              element={
                <RutaProtegida>
                  <NodoActivo />
                </RutaProtegida>
              }
            />
            <Route
              path="/perfil"
              element={
                <RutaProtegida>
                  <Perfil />
                </RutaProtegida>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
