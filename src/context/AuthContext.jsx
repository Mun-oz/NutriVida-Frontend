import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback
} from 'react';

import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

const REFRESH_KEY = 'nutrivida_refresh_token';

function obtenerUsuario(datos) {
  const roles = datos.roles || [];

  const rol = roles.includes('ROLE_ADMIN')
    ? 'admin'
    : roles.includes('ROLE_NUTRICIONISTA')
      ? 'nutricionista'
      : 'paciente';

  return {
    email: datos.email,
    rol,
    roles
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const login = useCallback((datos) => {
    if (!datos.accessToken || !datos.refreshToken) {
      throw new Error('Respuesta de autenticacion invalida');
    }

    setUser(obtenerUsuario(datos));
    setAccessToken(datos.accessToken);

    sessionStorage.setItem(
      REFRESH_KEY,
      datos.refreshToken
    );
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);

    sessionStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem('nutrivida_user');
  }, []);

  useEffect(() => {
    let activo = true;

    // Eliminar la sesion simulada anterior
    localStorage.removeItem('nutrivida_user');

    const refreshToken = sessionStorage.getItem(REFRESH_KEY);

    if (!refreshToken) {
      setCargandoSesion(false);
      return;
    }

    apiRequest('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
      .then((datos) => {
        if (activo) login(datos);
      })
      .catch(() => {
        if (activo) logout();
      })
      .finally(() => {
        if (activo) setCargandoSesion(false);
      });

    return () => {
      activo = false;
    };
  }, [login, logout]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      login,
      logout,
      cargandoSesion
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);