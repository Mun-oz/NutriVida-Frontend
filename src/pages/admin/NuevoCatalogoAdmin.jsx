import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { crearServicio } from '../../services/serviciosService';

export default function NuevoCatalogoAdmin() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    duracion: '',
    precio: '',
    imagen: ''
  });

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setGuardando(true);

    const datos = {
      codigo: formData.codigo.trim().toUpperCase(),
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      duracion: formData.duracion.trim(),
      precio: Number(formData.precio),
      imagen: formData.imagen.trim() || null
    };

    try {
      await crearServicio(datos, accessToken);

      navigate('/admin/catalogo', {
        state: {
          mensaje: 'Servicio registrado correctamente.'
        }
      });
    } catch (err) {
      if (err.status === 409) {
        setError('Ya existe un servicio con ese código.');
      } else if (err.status === 401) {
        setError('Tu sesión expiró. Inicia sesión nuevamente.');
      } else if (err.status === 403) {
        setError('No tienes permisos para registrar servicios.');
      } else if (err.status === 400) {
        setError('Revisa los datos del formulario.');
      } else {
        setError(`No se pudo registrar: ${err.message}`);
      }
    } finally {
      setGuardando(false);
    }
  };


  return (
    <>
      <header className="content-header">
        <h2>Registrar Nuevo Servicio</h2>
      </header>
      
      <div className="content-panel top-panel">
        <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
          <form onSubmit={handleSubmit}>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="codigoServicio"> Código del Servicio: </label>
              <input id="codigoServicio" type="text" placeholder="Ej. NV002" maxLength={20} value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} required className="form-control" />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="nombreServicio" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Nombre del Servicio:</label>
              <input type="text" id="nombreServicio" placeholder="Ej. Evaluación Antropométrica" maxLength={150} value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} required style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '1rem' }} />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="duracionServicio"> Duración: </label>
              <input id="duracionServicio" type="text" placeholder="Ej. 45 minutos" maxLength={50} value={formData.duracion} onChange={(e) => setFormData({...formData, duracion: e.target.value})} className="form-control"/>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="descripcionServicio" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Descripción:</label>
              <textarea id="descripcionServicio" placeholder="Detalla en qué consiste el servicio..." value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} required rows="3" style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '1rem', resize: 'vertical' }}></textarea>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="precioServicio" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Precio (CLP):</label>
              <input type="number" id="precioServicio" placeholder="Ej. 30000" min="0" step="1" value={formData.precio} onChange={(e) => setFormData({...formData, precio: e.target.value})} required style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '1rem' }} />
            </div>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="imagenServicio" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>URL de la Imagen:</label>
              <input type="text" id="imagenServicio" placeholder="Ej.  consulta_nutri.jpg o https://..." maxLength={255} value={formData.imagen} onChange={(e) => setFormData({...formData, imagen: e.target.value})} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '1rem' }} />
            </div>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn-primary" disabled={guardando} style={{ flex: 1, margin: 0 }}> {guardando ? 'Guardando...' : 'Guardar Servicio'}</button>
              <button type="button" className="btn-outline" onClick={() => navigate('/admin/catalogo')} style={{ flex: 1, border: '1px solid var(--border-color)', background: 'transparent', padding: '0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-color)' }}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}