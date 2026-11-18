import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({
  children,
  requireAdmin
}) {
  const { user, cargandoSesion } = useAuth();

  if (cargandoSesion) {
    return <p>Comprobando sesión...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
