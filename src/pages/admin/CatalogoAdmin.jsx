import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import {
  listarServicios,
  eliminarServicio,
  formatearPrecio
} from '../../services/serviciosService';

export default function CatalogoAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuth();

  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [notificacion, setNotificacion] = useState(
    location.state?.mensaje || null
  );

  useEffect(() => {
    let activo = true;

    listarServicios()
      .then((datos) => {
        if (activo) {
          setServicios(Array.isArray(datos) ? datos : []);
        }
      })
      .catch((err) => {
        if (activo) setError(err.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!notificacion) return;

    const timer = setTimeout(() => {
      setNotificacion(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [notificacion]);

  const handleEliminar = async (servicio) => {
    const confirmado = window.confirm(
      `¿Deseas eliminar "${servicio.nombre}"?`
    );

    if (!confirmado) return;

    setError('');

    try {
      await eliminarServicio(servicio.id, accessToken);

      setServicios((anteriores) =>
        anteriores.filter((s) => s.id !== servicio.id)
      );

      setNotificacion('Servicio eliminado correctamente.');
    } catch (err) {
      if (err.status === 409) {
        setError(
          'No se puede eliminar: el servicio tiene citas asociadas.'
        );
      } else if (err.status === 401) {
        setError('Tu sesión expiró. Vuelve a iniciar sesión.');
      } else if (err.status === 403) {
        setError('No tienes permisos para eliminar servicios.');
      } else {
        setError(`No se pudo eliminar: ${err.message}`);
      }
    }
  };

  return (
    <>
      <header className="content-header">
        <h2>Catálogo de Servicios</h2>
        <button
          className="btn-primary"
          style={{ width: 'auto', marginTop: 0 }}
          onClick={() => navigate('/admin/catalogo/nuevo')}
        >
          + Nuevo Servicio
        </button>
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

      {cargando && <p>Cargando servicios...</p>}

      {!cargando && (
        <div
          className="content-panel top-panel"
          style={{ marginTop: 0 }}
        >
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre del Servicio</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {servicios.length === 0 ? (
                  <tr>
                    <td colSpan="4">
                      No hay servicios registrados.
                    </td>
                  </tr>
                ) : (
                  servicios.map((s) => (
                    <tr key={s.id}>
                      <td>{s.codigo}</td>
                      <td>{s.nombre}</td>
                      <td>{formatearPrecio(s.precio)}</td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center'
                          }}
                        >
                          <button
                            className="btn-outline"
                            style={{
                              padding: '0.3rem 0.8rem',
                              width: 'auto',
                              margin: 0
                            }}
                            onClick={() => navigate(
                              '/admin/catalogo/mostrar',
                              { state: { servicio: s } }
                            )}
                          >
                            Ver
                          </button>

                          <button
                            className="btn-primary"
                            style={{
                              padding: '0.3rem 0.8rem',
                              width: 'auto',
                              margin: 0
                            }}
                            onClick={() => navigate(
                              '/admin/catalogo/editar',
                              { state: { servicio: s } }
                            )}
                          >
                            Editar
                          </button>

                          <button
                            className="btn-outline"
                            style={{
                              padding: '0.3rem 0.8rem',
                              width: 'auto',
                              margin: 0,
                              color: '#c62828'
                            }}
                            onClick={() => handleEliminar(s)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
