import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { obtenerUsuario } from '../../services/usuariosService';

export default function MostrarUsuarioAdmin() {
  const { id } = useParams();
  const { accessToken } = useAuth();

  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken || !id) return;
    let activo = true;

    obtenerUsuario(id, accessToken)
      .then((datos) => {
        if (activo) setUsuario(datos);
      })
      .catch((err) => {
        if (activo) {
          if (err.status === 404) {
            setError('Usuario no encontrado.');
          } else if (err.status === 401) {
            setError('Tu sesión expiró. Vuelve a iniciar sesión.');
          } else {
            setError(`No se pudo cargar el detalle: ${err.message}`);
          }
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [id, accessToken]);

  return (
    <>
      <header className="content-header">
        <h2>Detalle de Usuario #{id}</h2>
        <Link
          to="/admin/usuario"
          className="btn-outline"
          style={{ width: 'auto', marginTop: 0, textDecoration: 'none' }}
        >
          ← Volver
        </Link>
      </header>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {cargando && <p>Cargando información del usuario...</p>}

      {!cargando && usuario && (
        <div
          style={{
            background: '#ffffff',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
          }}
        >
          <div className="row g-3">
            <div className="col-md-6">
              <strong>ID:</strong> #{usuario.id}
            </div>
            <div className="col-md-6">
              <strong>Rol:</strong> <span className="badge bg-success">{usuario.rol}</span>
            </div>
            <div className="col-md-6">
              <strong>Nombre:</strong> {usuario.nombre}
            </div>
            <div className="col-md-6">
              <strong>Correo:</strong> {usuario.email}
            </div>
            <div className="col-md-6">
              <strong>RUN:</strong> {usuario.run || 'No registrado'}
            </div>
            <div className="col-md-6">
              <strong>Región:</strong> {usuario.region || 'No registrada'}
            </div>
            <div className="col-md-6">
              <strong>Comuna:</strong> {usuario.comuna || 'No registrada'}
            </div>
            <div className="col-md-6">
              <strong>Dirección:</strong> {usuario.direccion || 'No registrada'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Link
              to={`/admin/usuario/editar/${usuario.id}`}
              className="btn-primary"
              style={{ width: 'auto', margin: 0, padding: '0.5rem 1.4rem', textDecoration: 'none' }}
            >
              Editar Usuario
            </Link>
            <Link
              to="/admin/usuario"
              className="btn-outline"
              style={{ width: 'auto', margin: 0, padding: '0.5rem 1.4rem', textDecoration: 'none' }}
            >
              Volver al listado
            </Link>
          </div>
        </div>
      )}
    </>
  );
}