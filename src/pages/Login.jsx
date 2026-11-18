import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext'; 
import { iniciarSesion } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState('');
  const [enviando, setEnviando] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth(); 

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLogin('');

    if (!email.trim() || !password) {
      setErrorLogin('Ingresa tu correo y contraseña.');
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await iniciarSesion(
        email.trim(),
        password
      );

      login(respuesta);

      if (respuesta.roles.includes('ROLE_ADMIN')) {
        navigate('/admin/home', { replace: true });
      } else {
        navigate('/', { replace: true });
      }

    } catch (error) {
      if (error.status === 401) {
        setErrorLogin('Correo o contraseña incorrectos.');
      } else if (error.status === 400) {
        setErrorLogin('Revisa los datos ingresados.');
      } else {
        setErrorLogin(
          'No se pudo iniciar sesión. Verifica la conexión.'
        );
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="container d-block my-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg border-0 overflow-hidden rounded-4">
            <div className="row g-0">
              
              {/* Mitad Izquierda: Imagen decorativa (Se oculta en celulares) */}
              <div className="col-md-6 d-none d-md-block bg-light">
                <img 
                  src="/nutrivida/assets/img/Logo_NutriVida.png" 
                  alt="Login NutriVida" 
                  className="img-fluid w-100 h-100" 
                  style={{ objectFit: 'cover', minHeight: '500px' }} 
                />
              </div>

              {/* Mitad Derecha: Formulario de Login */}
              <div className="col-md-6 p-5 d-flex flex-column justify-content-center bg-white">
                <div className="text-center mb-4">
                  <h2 className="text-success fw-bold">Iniciar Sesión</h2>
                  <p className="text-muted">Bienvenido de vuelta a NutriVida</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="form-group mb-3">
                    <label htmlFor="emailLogin" className="fw-bold mb-1">Correo Electrónico</label>
                    <input 
                      id="emailLogin"
                      type="email" 
                      className="form-control p-2"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="ejemplo@gmail.com" 
                    />
                    {errorLogin && (
                      <span className="text-danger small mt-1 d-block fw-bold">
                        {errorLogin}
                      </span>
                    )}
                  </div>

                  <div className="form-group mb-4">
                    <label htmlFor="passwordLogin" className="fw-bold mb-1">Contraseña</label>
                    <input 
                      id="passwordLogin"
                      type="password" 
                      className="form-control p-2"
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                    />
                  </div>

                  <button  type="submit"  className="btn btn-success w-100 fw-bold py-2 shadow-sm"  disabled={enviando}>  {enviando ? 'Ingresando...' : 'Ingresar'}</button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted small">
                    ¿No tienes una cuenta? <Link to="/registro" className="text-success text-decoration-none fw-bold">Regístrate aquí</Link>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}