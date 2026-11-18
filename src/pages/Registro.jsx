import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { validarRut } from '../utils/validadores';
import { registrarPaciente } from '../services/api';

const datosRegiones = [
  { region: "Región Metropolitana", comunas: ["Santiago", "Providencia", "Maipú"] },
  { region: "Región de La Araucanía", comunas: ["Temuco", "Padre Las Casas", "Villarrica"] }
];

export default function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    run: '', nombre: '', apellidos: '', email: '',
    fechaNacimiento: '', region: '', comuna: '', 
    direccion: '', password: '', confirmPassword: ''
  });
  const [comunasDisponibles, setComunasDisponibles] = useState([]);
  const [enviandoRegistro, setEnviandoRegistro] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'region') {
      const regionSeleccionada = datosRegiones.find(r => r.region === value);
      setComunasDisponibles(regionSeleccionada ? regionSeleccionada.comunas : []);
      setFormData(prev => ({ ...prev, region: value, comuna: '' }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const run = formData.run
      .replace(/[.-]/g, '')
      .trim()
      .toUpperCase();

    const email = formData.email.trim().toLowerCase();

    if (!validarRut(run)) {
      alert("El RUN ingresado no es válido.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Ingresa un correo electrónico válido.");
      return;
    }

    if (
      !formData.nombre.trim() ||
      !formData.region ||
      !formData.comuna ||
      !formData.direccion.trim()
    ) {
      alert("Completa todos los campos obligatorios.");
      return;
    }

    if (
      formData.password.length < 8 ||
      formData.password.length > 72
    ) {
      alert("La contraseña debe tener entre 8 y 72 caracteres.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    setEnviandoRegistro(true);

    try {
      const respuesta = await registrarPaciente({
        run,
        nombre: formData.nombre.trim(),
        email,
        password: formData.password,
        region: formData.region,
        comuna: formData.comuna,
        direccion: formData.direccion.trim()
      });

      alert(
        respuesta?.mensaje || "Paciente registrado correctamente."
      );

      navigate('/login');

    } catch (error) {
      if (error.status === 409) {
        alert(error.message);
      } else if (error.status === 400) {
        alert("Revisa los datos ingresados.");
      } else {
        alert("No se pudo completar el registro. Inténtalo nuevamente.");
      }
    } finally {
      setEnviandoRegistro(false);
    }
  };


  return (
    <main className="container d-block my-5">
      <section className="auth-card mx-auto" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4">Crear Cuenta</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group mb-3">
            <label htmlFor="run">RUN (Sin puntos ni guion):</label>
            <input id="run" type="text" name="run" className="form-control" value={formData.run} onChange={handleChange} maxLength="9" required />
          </div>
          
          <div className="form-group mb-3">
            <label htmlFor="nombre">Nombre Completo:</label>
            <input id="nombre" type="text" name="nombre" className="form-control" value={formData.nombre} onChange={handleChange} required />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="emailRegistro">Correo Electrónico:</label>
            <input id="emailRegistro" type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="region">Región:</label>
            <select id="region" name="region" className="form-select" value={formData.region} onChange={handleChange} required>
              <option value="">Seleccione una región</option>
              {datosRegiones.map(r => (
                <option key={r.region} value={r.region}>{r.region}</option>
              ))}
            </select>
          </div>

          <div className="form-group mb-3">
            <label htmlFor="comuna">Comuna:</label>
            <select id="comuna" name="comuna" className="form-select" value={formData.comuna} onChange={handleChange} disabled={!formData.region} required>
              <option value="">Seleccione una comuna</option>
              {comunasDisponibles.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group mb-3"> 
            <label htmlFor="direccion">Dirección:</label> 
            <input id="direccion" type="text" name="direccion" className="form-control" value={formData.direccion} onChange={handleChange} placeholder="Ej: Av. Libertador 1234" required /> 
          </div>

          <div className="form-group mb-3">
            <label htmlFor="passwordRegistro">Contraseña:</label>
            <input id="passwordRegistro" type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="form-group mb-4">
            <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
            <input id="confirmPassword" type="password" name="confirmPassword" className="form-control" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 fw-bold"
            disabled={enviandoRegistro}
          >
            {enviandoRegistro ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <p className="auth-redirect mt-3 text-center">¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
      </section>
    </main>
  );
}