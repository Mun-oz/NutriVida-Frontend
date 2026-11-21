import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { listarServicios } from '../services/serviciosService';
import { crearCita } from '../services/citasService';
import { fechaHoraChile, validarDatosCita } from '../utils/validacionCitas';
import { mensajeErrorApi } from '../utils/mensajesApi';

export default function Agendar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, accessToken } = useAuth();

  const servicioInicialNombre = location.state?.servicioSeleccionado || '';

  const [servicios, setServicios] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    email: user?.email || '',
    servicioId: '',
    modalidad: 'PRESENCIAL',
    fecha: '',
    hora: ''
  });

  // Cargar servicios reales desde el backend
  useEffect(() => {
    let activo = true;

    listarServicios()
      .then((datos) => {
        if (!activo) return;
        const lista = Array.isArray(datos) ? datos : [];
        setServicios(lista);

        // Si viene preseleccionado desde Productos.jsx, buscamos su ID real
        if (servicioInicialNombre) {
          const encontrado = lista.find(
            (s) => s.nombre.toLowerCase() === servicioInicialNombre.toLowerCase()
          );
          if (encontrado) {
            setFormData((prev) => ({
              ...prev,
              servicioId: String(encontrado.id)
            }));
          }
        }
      })
      .catch((err) => {
        if (activo) {
          setError(`No se pudieron cargar los servicios: ${err.message}`);
        }
      })
      .finally(() => {
        if (activo) setCargandoServicios(false);
      });

    return () => {
      activo = false;
    };
  }, [servicioInicialNombre]);

  // Si el usuario inicia sesión o se restaura la sesión, autocompletar correo si está vacío
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => (prev.email ? prev : { ...prev, email: user.email }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.nombre.trim() ||
      !formData.rut.trim() ||
      !formData.email.trim() ||
      !formData.servicioId ||
      !formData.fecha ||
      !formData.hora
    ) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    const mensajeValidacion = validarDatosCita({
      run: formData.rut, email: formData.email,
      fecha: formData.fecha, hora: formData.hora
    });
    if (mensajeValidacion) {
      setError(mensajeValidacion);
      return;
    }

    setEnviando(true);

    const payload = {
      servicioId: Number(formData.servicioId),
      nombrePaciente: formData.nombre.trim(),
      runPaciente: formData.rut.trim(),
      emailPaciente: formData.email.trim(),
      fecha: formData.fecha,
      hora: formData.hora,
      modalidad: formData.modalidad
    };

    try {
      await crearCita(payload, accessToken);
      navigate('/gracias', { state: { tipo: 'reserva' } });
    } catch (err) {
      if (err.status === 409) {
        setError(mensajeErrorApi(err, 'Ya existe una cita reservada para ese servicio en la fecha y hora seleccionadas.'));
      } else if (err.status === 400) {
        setError(mensajeErrorApi(err, 'Revisa el RUN, correo, fecha, hora y los campos obligatorios.'));
      } else if (err.status === 404) {
        setError('El servicio seleccionado ya no está disponible.');
      } else {
        setError(`No se pudo registrar la reserva: ${err.message}`);
      }
    } finally {
      setEnviando(false);
    }
  };

  const hoy = fechaHoraChile().fecha;

  return (
    <main className="container my-5 d-block">
      <div className="text-center mb-5 w-100">
        <h2 className="text-success fw-bold">Agendar Servicio</h2>
        <p className="text-muted">Reserva tu hora de atención con nuestros especialistas clínicos.</p>
      </div>

      <div className="row g-4 justify-content-center">
        {/* Columna Izquierda: Información de la Clínica */}
        <div className="col-12 col-lg-4 d-flex flex-column gap-3">
          <div className="card border-0 shadow-sm h-100 bg-success text-white rounded-4">
            <div className="card-body p-4 d-flex flex-column justify-content-center">
              <h4 className="fw-bold mb-4">Información Importante</h4>

              <div className="mb-4">
                <h6 className="fw-bold">📅 Asistencia</h6>
                <p className="small text-white-50 mb-0">Por favor, preséntate 10 minutos antes de tu hora agendada.</p>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold">❌ Cancelaciones</h6>
                <p className="small text-white-50 mb-0">Si no puedes asistir, anula tu hora con al menos 24 horas de anticipación.</p>
              </div>

              <div className="mb-0">
                <h6 className="fw-bold">💳 Pagos y Previsión</h6>
                <p className="small text-white-50 mb-0">Emitimos boleta para reembolso en Isapre. Aceptamos bonos Fonasa en recepción.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Agendamiento */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4 p-md-5">
              <form onSubmit={handleSubmit}>
                <h5 className="text-success fw-bold mb-4 border-bottom pb-2">Tus Datos</h5>

                <div className="row">
                  <div className="col-md-6 form-group mb-3">
                    <label htmlFor="agendarNombre" className="fw-bold mb-1 small text-muted">Nombre Completo:</label>
                    <input
                      id="agendarNombre"
                      name="nombre"
                      type="text"
                      className="form-control bg-light"
                      placeholder="Ej. Juan Pérez"
                      maxLength={150}
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 form-group mb-3">
                    <label htmlFor="agendarRut" className="fw-bold mb-1 small text-muted">RUT:</label>
                    <input
                      id="agendarRut"
                      name="rut"
                      type="text"
                      className="form-control bg-light"
                      placeholder="12345678-9"
                      maxLength={15}
                      value={formData.rut}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-12 form-group">
                    <label htmlFor="agendarEmail" className="fw-bold mb-1 small text-muted">Correo Electrónico:</label>
                    <input
                      id="agendarEmail"
                      name="email"
                      type="email"
                      className="form-control bg-light"
                      placeholder="correo@ejemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <h5 className="text-success fw-bold mb-4 border-bottom pb-2">Detalle de la Atención</h5>

                <div className="row">
                  <div className="col-md-6 form-group mb-3">
                    <label htmlFor="agendarServicio" className="fw-bold mb-1 small text-muted">Servicio a Reservar:</label>
                    <select
                      id="agendarServicio"
                      name="servicioId"
                      className="form-select bg-light fw-bold text-success"
                      value={formData.servicioId}
                      onChange={handleChange}
                      required
                      disabled={cargandoServicios}
                    >
                      <option value="">
                        {cargandoServicios ? 'Cargando servicios...' : 'Seleccione un plan...'}
                      </option>
                      {servicios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                    {servicioInicialNombre && formData.servicioId && (
                      <small className="text-muted mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                        * Servicio pre-seleccionado desde el catálogo.
                      </small>
                    )}
                  </div>

                  <div className="col-md-6 form-group mb-3">
                    <label htmlFor="agendarModalidad" className="fw-bold mb-1 small text-muted">Modalidad:</label>
                    <select
                      id="agendarModalidad"
                      name="modalidad"
                      className="form-select bg-light"
                      value={formData.modalidad}
                      onChange={handleChange}
                      required
                    >
                      <option value="PRESENCIAL">Presencial (Clínica Temuco)</option>
                      <option value="ONLINE">Telemedicina (Online)</option>
                    </select>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6 form-group mb-3 mb-md-0">
                    <label htmlFor="agendarFecha" className="fw-bold mb-1 small text-muted">Fecha:</label>
                    <input
                      id="agendarFecha"
                      name="fecha"
                      type="date"
                      min={hoy}
                      className="form-control bg-light"
                      value={formData.fecha}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="agendarHora" className="fw-bold mb-1 small text-muted">Hora:</label>
                    <input
                      id="agendarHora"
                      name="hora"
                      type="time"
                      min="09:00"
                      max="17:59"
                      className="form-control bg-light"
                      value={formData.hora}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <p className="text-muted small mb-3">
                  Atención de lunes a viernes, de 09:00 a 18:00. No se aceptan reservas para horas ya pasadas.
                </p>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enviando || cargandoServicios}
                  className="btn btn-success w-100 fw-bold py-3 mt-3 shadow-sm rounded-3"
                >
                  {enviando ? 'Confirmando Reserva...' : 'Confirmar Reserva'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}