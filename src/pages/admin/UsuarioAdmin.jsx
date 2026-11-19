import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { listarUsuarios, eliminarUsuario } from '../../services/usuariosService';

export default function UsuarioAdmin() {
  const { accessToken, user } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [notificacion, setNotificacion] = useState(null);

  useEffect(() => {
    if (!accessToken) return;
    let activo = true;

    listarUsuarios(accessToken)
      .then((datos) => {
        if (activo) {
          setUsuarios(Array.isArray(datos) ? datos : []);
        }
      })
      .catch((err) => {
        if (activo) {
          if (err.status === 401) {
            setError('Tu sesión expiró. Vuelve a iniciar sesión.');
          } else if (err.status === 403) {
            setError('No tienes permisos de administrador para ver los usuarios.');
          } else {
            setError(`No se pudieron cargar los usuarios: ${err.message}`);
          }
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!notificacion) return;
    const timer = setTimeout(() => setNotificacion(null), 3000);
    return () => clearTimeout(timer);
  }, [notificacion]);

  const handleEliminar = async (usuario) => {
    const confirmado = window.confirm(
      `¿Deseas eliminar al usuario "${usuario.nombre}" (${usuario.email})?`
    );
    if (!confirmado) return;

    setError('');
    try {
      await eliminarUsuario(usuario.id, accessToken);
      setUsuarios((anteriores) => anteriores.filter((u) => u.id !== usuario.id));
      setNotificacion('Usuario eliminado correctamente.');
    } catch (err) {
      if (err.status === 409) {
        setError(
          err.message ||
            'No se puede eliminar este usuario (es tu cuenta actual o tiene citas asociadas).'
        );
      } else if (err.status === 401) {
        setError('Tu sesión expiró. Vuelve a iniciar sesión.');
      } else if (err.status === 403) {
        setError('No tienes permisos para eliminar usuarios.');
      } else {
        setError(`No se pudo eliminar el usuario: ${err.message}`);
      }
    }
  };

  return (
    <>
      <header className="content-header">
        <h2>Gestión de Usuarios</h2>
        <Link
          to="/admin/usuario/nuevo"
          className="btn-primary"
          style={{ width: 'auto', marginTop: 0, textDecoration: 'none' }}
        >
          + Nuevo Usuario
        </Link>
      </header>

      {notificacion && (
        <div
          style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #a5d6a7',
            fontWeight: 'bold'
          }}
        >
          {notificacion}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {cargando && <p>Cargando usuarios...</p>}

      {!cargando && (
        <div className="content-panel top-panel" style={{ marginTop: 0 }}>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>RUN</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="6">No hay usuarios registrados.</td>
                  </tr>
                ) : (
                  usuarios.map((u) => {
                    const esMiCuenta =
                      user?.email &&
                      u.email?.toLowerCase() === user.email.toLowerCase();

                    return (
                      <tr key={u.id}>
                        <td>#{u.id}</td>
                        <td>{u.run || '-'}</td>
                        <td>{u.nombre}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className="badge bg-success">{u.rol}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <Link
                              to={`/admin/usuario/mostrar/${u.id}`}
                              className="btn-outline"
                              style={{
                                padding: '0.3rem 0.8rem',
                                width: 'auto',
                                margin: 0,
                                textDecoration: 'none'
                              }}
                            >
                              Ver
                            </Link>
                            <Link
                              to={`/admin/usuario/editar/${u.id}`}
                              className="btn-primary"
                              style={{
                                padding: '0.3rem 0.8rem',
                                width: 'auto',
                                margin: 0,
                                textDecoration: 'none'
                              }}
                            >
                              Editar
                            </Link>
                            <button
                              className="btn-outline"
                              disabled={esMiCuenta}
                              title={
                                esMiCuenta
                                  ? 'No puedes eliminar tu propia cuenta'
                                  : 'Eliminar usuario'
                              }
                              style={{
                                padding: '0.3rem 0.8rem',
                                width: 'auto',
                                margin: 0,
                                color: '#c62828',
                                opacity: esMiCuenta ? 0.5 : 1,
                                cursor: esMiCuenta ? 'not-allowed' : 'pointer'
                              }}
                              onClick={() => handleEliminar(u)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}