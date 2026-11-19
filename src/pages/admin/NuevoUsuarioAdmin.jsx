import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { crearUsuario } from '../../services/usuariosService';

export default function NuevoUsuarioAdmin() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'PACIENTE',
    run: '',
    region: '',
    comuna: '',
    direccion: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setGuardando(true);

    const payload = {
      nombre: formData.nombre.trim(),
      email: formData.email.trim(),
      password: formData.password,
      rol: formData.rol,
      run: formData.run.trim() || null,
      region: formData.region.trim() || null,
      comuna: formData.comuna.trim() || null,
      direccion: formData.direccion.trim() || null
    };

    try {
      await crearUsuario(payload, accessToken);
      navigate('/admin/usuario');
    } catch (err) {
      if (err.status === 409) {
        setError(err.message || 'El correo o RUN ya está registrado.');
      } else if (err.status === 400) {
        setError('Revisa los datos ingresados (correo válido y contraseña de al menos 8 caracteres).');
      } else if (err.status === 401) {
        setError('Tu sesión expiró. Vuelve a iniciar sesión.');
      } else if (err.status === 403) {
        setError('No tienes permisos para crear usuarios.');
      } else {
        setError(`No se pudo crear el usuario: ${err.message}`);
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <header className="content-header">
        <h2>Nuevo Usuario</h2>
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

      <div
        style={{
          background: '#ffffff',
          padding: '1.25rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold small mb-1">Nombre Completo *</label>
              <input
                type="text"
                name="nombre"
                className="form-control form-control-sm"
                maxLength={150}
                required
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold small mb-1">Correo Electrónico *</label>
              <input
                type="email"
                name="email"
                className="form-control form-control-sm"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold small mb-1">Contraseña (mín. 8 caracteres) *</label>
              <input
                type="password"
                name="password"
                className="form-control form-control-sm"
                minLength={8}
                maxLength={72}
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold small mb-1">Rol *</label>
              <select
                name="rol"
                className="form-select form-select-sm"
                required
                value={formData.rol}
                onChange={handleChange}
              >
                <option value="PACIENTE">PACIENTE</option>
                <option value="NUTRICIONISTA">NUTRICIONISTA</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold small mb-1">RUN</label>
              <input
                type="text"
                name="run"
                className="form-control form-control-sm"
                placeholder="12345678-9"
                maxLength={15}
                value={formData.run}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold small mb-1">Región</label>
              <input
                type="text"
                name="region"
                className="form-control form-control-sm"
                maxLength={100}
                value={formData.region}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold small mb-1">Comuna</label>
              <input
                type="text"
                name="comuna"
                className="form-control form-control-sm"
                maxLength={100}
                value={formData.comuna}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold small mb-1">Dirección</label>
              <input
                type="text"
                name="direccion"
                className="form-control form-control-sm"
                maxLength={200}
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={guardando}
              style={{ width: 'auto', margin: 0, padding: '0.5rem 1.4rem' }}
            >
              {guardando ? 'Guardando...' : 'Crear Usuario'}
            </button>
            <Link
              to="/admin/usuario"
              className="btn-outline"
              style={{ width: 'auto', margin: 0, padding: '0.5rem 1.4rem', textDecoration: 'none' }}
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}