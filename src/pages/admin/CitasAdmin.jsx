import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  listarCitas,
  crearCita,
  actualizarCita,
  cambiarEstadoCita,
  eliminarCita
} from '../../services/citasService';
import { listarServicios } from '../../services/serviciosService';

const ESTADOS = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'];

const FORM_INICIAL = {
  servicioId: '',
  nombrePaciente: '',
  runPaciente: '',
  emailPaciente: '',
  fecha: '',
  hora: '',
  modalidad: 'PRESENCIAL'
};

export default function CitasAdmin() {
  const { accessToken } = useAuth();

  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [notificacion, setNotificacion] = useState(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [citaEditandoId, setCitaEditandoId] = useState(null);
  const [formData, setFormData] = useState(FORM_INICIAL);

  useEffect(() => {
    if (!accessToken) return;
    let activo = true;

    Promise.all([listarCitas(accessToken), listarServicios()])
      .then(([datosCitas, datosServicios]) => {
        if (!activo) return;
        setCitas(Array.isArray(datosCitas) ? datosCitas : []);
        setServicios(Array.isArray(datosServicios) ? datosServicios : []);
      })
      .catch((err) => {
        if (activo) {
          if (err.status === 401) {
            setError('Tu sesión expiró. Vuelve a iniciar sesión.');
          } else if (err.status === 403) {
            setError('No tienes permisos de administrador para ver las citas.');
          } else {
            setError(`No se pudieron cargar las citas: ${err.message}`);
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

  const abrirNuevaCita = () => {
    setError('');
    setCitaEditandoId(null);
    setFormData(FORM_INICIAL);
    setMostrarFormulario(true);
  };

  const abrirEditarCita = (cita) => {
    setError('');
    setCitaEditandoId(cita.id);
    setFormData({
      servicioId: String(cita.servicioId || ''),
      nombrePaciente: cita.nombrePaciente || '',
      runPaciente: cita.runPaciente || '',
      emailPaciente: cita.emailPaciente || '',
      fecha: cita.fecha || '',
      hora: String(cita.hora || '').slice(0, 5),
      modalidad: cita.modalidad || 'PRESENCIAL'
    });
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setCitaEditandoId(null);
    setFormData(FORM_INICIAL);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);

    const payload = {
      servicioId: Number(formData.servicioId),
      nombrePaciente: formData.nombrePaciente.trim(),
      runPaciente: formData.runPaciente.trim(),
      emailPaciente: formData.emailPaciente.trim(),
      fecha: formData.fecha,
      hora: formData.hora,
      modalidad: formData.modalidad
    };

    try {
      if (citaEditandoId) {
        const actualizada = await actualizarCita(citaEditandoId, payload, accessToken);
        setCitas((anteriores) =>
          anteriores.map((c) => (c.id === citaEditandoId ? actualizada : c))
        );
        setNotificacion('Cita actualizada correctamente.');
      } else {
        const creada = await crearCita(payload, accessToken);
        setCitas((anteriores) => [...anteriores, creada]);
        setNotificacion('Cita registrada correctamente.');
      }
      cerrarFormulario();
    } catch (err) {
      if (err.status === 409) {
        setError('Ya existe una cita para ese servicio en la misma fecha y hora.');
      } else if (err.status === 400) {
        setError('Revisa los datos ingresados (correo válido, fecha igual o posterior a hoy).');
      } else if (err.status === 401) {
        setError('Tu sesión expiró. Inicia sesión nuevamente.');
      } else if (err.status === 403) {
        setError('No tienes permisos para realizar esta acción.');
      } else {
        setError(`No se pudo guardar la cita: ${err.message}`);
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleCambioEstado = async (cita, nuevoEstado) => {
    setError('');
    try {
      const actualizada = await cambiarEstadoCita(cita.id, nuevoEstado, accessToken);
      setCitas((anteriores) =>
        anteriores.map((c) => (c.id === cita.id ? actualizada : c))
      );
      setNotificacion(`Estado de la cita #${cita.id} actualizado a ${nuevoEstado}.`);
    } catch (err) {
      if (err.status === 401) {
        setError('Tu sesión expiró. Inicia sesión nuevamente.');
      } else if (err.status === 403) {
        setError('No tienes permisos para cambiar el estado.');
      } else {
        setError(`No se pudo actualizar el estado: ${err.message}`);
      }
    }
  };

  const handleEliminar = async (cita) => {
    const confirmado = window.confirm(
      `¿Deseas eliminar la cita #${cita.id} de ${cita.nombrePaciente}?`
    );
    if (!confirmado) return;

    setError('');
    try {
      await eliminarCita(cita.id, accessToken);
      setCitas((anteriores) => anteriores.filter((c) => c.id !== cita.id));
      setNotificacion('Cita eliminada correctamente.');
    } catch (err) {
      if (err.status === 401) {
        setError('Tu sesión expiró. Vuelve a iniciar sesión.');
      } else if (err.status === 403) {
        setError('No tienes permisos para eliminar citas.');
      } else {
        setError(`No se pudo eliminar la cita: ${err.message}`);
      }
    }
  };

  const hoy = new Date().toISOString().split('T')[0];

  return (
    <>
      <header className="content-header">
        <h2>Gestión de Citas y Reservas</h2>
        <button
          className="btn-primary"
          style={{ width: 'auto', marginTop: 0 }}
          onClick={abrirNuevaCita}
        >
          + Nueva Cita Manual
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

      {mostrarFormulario && (
        <div
          style={{
            background: '#ffffff',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h5 style={{ margin: 0, fontWeight: 'bold' }}>
              {citaEditandoId ? `Editar Cita #${citaEditandoId}` : 'Registrar Nueva Cita Manual'}
            </h5>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-2">
              <div className="col-md-4">
                <label className="form-label fw-bold small mb-1">Nombre Paciente:</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  maxLength={150}
                  required
                  value={formData.nombrePaciente}
                  onChange={(e) => setFormData({ ...formData, nombrePaciente: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold small mb-1">RUT Paciente:</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="12345678-9"
                  maxLength={15}
                  required
                  value={formData.runPaciente}
                  onChange={(e) => setFormData({ ...formData, runPaciente: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold small mb-1">Correo Paciente:</label>
                <input
                  type="email"
                  className="form-control form-control-sm"
                  required
                  value={formData.emailPaciente}
                  onChange={(e) => setFormData({ ...formData, emailPaciente: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold small mb-1">Servicio:</label>
                <select
                  className="form-select form-select-sm"
                  required
                  value={formData.servicioId}
                  onChange={(e) => setFormData({ ...formData, servicioId: e.target.value })}
                >
                  <option value="">Seleccione un servicio...</option>
                  {servicios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold small mb-1">Modalidad:</label>
                <select
                  className="form-select form-select-sm"
                  required
                  value={formData.modalidad}
                  onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                >
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="ONLINE">Online</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold small mb-1">Fecha:</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  min={hoy}
                  required
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label fw-bold small mb-1">Hora:</label>
                <input
                  type="time"
                  className="form-control form-control-sm"
                  required
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={guardando}
                style={{ width: 'auto', margin: 0, padding: '0.45rem 1.2rem' }}
              >
                {guardando ? 'Guardando...' : citaEditandoId ? 'Actualizar Cita' : 'Guardar Cita'}
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={cerrarFormulario}
                style={{ width: 'auto', margin: 0, padding: '0.45rem 1.2rem' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {cargando && <p>Cargando citas...</p>}

      {!cargando && (
        <div className="content-panel top-panel" style={{ marginTop: 0 }}>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha y Hora</th>
                  <th>Paciente</th>
                  <th>Servicio</th>
                  <th>Modalidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citas.length === 0 ? (
                  <tr>
                    <td colSpan="7">No hay citas registradas.</td>
                  </tr>
                ) : (
                  citas.map((c) => (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td>
                        {c.fecha} {String(c.hora || '').slice(0, 5)}
                      </td>
                      <td>
                        <div>{c.nombrePaciente}</div>
                        <small className="text-muted">{c.runPaciente}</small>
                      </td>
                      <td>{c.servicioNombre}</td>
                      <td>{c.modalidad}</td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={c.estado}
                          onChange={(e) => handleCambioEstado(c, e.target.value)}
                          style={{ minWidth: '130px' }}
                        >
                          {ESTADOS.map((estado) => (
                            <option key={estado} value={estado}>
                              {estado}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            className="btn-primary"
                            style={{ padding: '0.3rem 0.8rem', width: 'auto', margin: 0 }}
                            onClick={() => abrirEditarCita(c)}
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
                            onClick={() => handleEliminar(c)}
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