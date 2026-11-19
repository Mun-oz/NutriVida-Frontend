import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { actualizarServicio } from '../../services/serviciosService';

export default function EditarCatalogoAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const servicio = location.state?.servicio;
  const { accessToken } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState(servicio || { nombre: '', descripcion: '', precio: '', imagen: '' });

  if (!servicio) return <Navigate to="/admin/catalogo" replace />;


const handleSubmit = async (e) => {
  e.preventDefault();

  setError('');
  setGuardando(true);

  const datos = {
    codigo: String(formData.codigo || '')
      .trim()
      .toUpperCase(),
    nombre: formData.nombre.trim(),
    descripcion: (formData.descripcion || '').trim(),
    duracion: (formData.duracion || '').trim(),
    precio: Number(formData.precio),
    imagen: (formData.imagen || '').trim() || null
  };

  try {
    await actualizarServicio(
      servicio.id,
      datos,
      accessToken
    );

    navigate('/admin/catalogo', {
      state: {
        mensaje: 'Servicio actualizado correctamente.'
      }
    });
  } catch (err) {
    if (err.status === 409) {
      setError('Ese código ya pertenece a otro servicio.');
    } else if (err.status === 401) {
      setError('Tu sesión expiró. Inicia sesión nuevamente.');
    } else if (err.status === 403) {
      setError('No tienes permisos para editar servicios.');
    } else if (err.status === 400) {
      setError('Revisa los datos del formulario.');
    } else {
      setError(`No se pudo actualizar: ${err.message}`);
    }
  } finally {
    setGuardando(false);
  }
};

  return (
    <>
      <header className="content-header">
        <h2>Editar Servicio Nutricional</h2>
      </header>
      
      <div className="content-panel top-panel">
        <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
          <form onSubmit={handleSubmit}>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>ID del Servicio:</label>
              <input type="text" value={formData.id} disabled style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '1rem', background: '#f0f0f0', color: '#666' }} />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="editCodigoServicio"> Código del Servicio: </label>
              <input id="editCodigoServicio" type="text" className="form-control" maxLength={20} required value={formData.codigo || ''} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} />
            </div>
              

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="editNombreServicio" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Nombre del Servicio:</label>
              <input type="text" id="editNombreServicio" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} required style={{ width: '100%', padding: '0.8rem', border: '2px solid var(--primary-color)', borderRadius: '4px', fontSize: '1rem' }} />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="editDescripcionServicio" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Descripción:</label>
              <textarea id="editDescripcionServicio" required rows="3" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} style={{ width: '100%', padding: '0.8rem', border: '2px solid var(--primary-color)', borderRadius: '4px', fontSize: '1rem', resize: 'vertical' }}></textarea>
            </div>

            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="editDuracionServicio"> Duración: </label>
              <input id="editDuracionServicio" type="text" className="form-control" maxLength={50} value={formData.duracion || ''} onChange={(e) => setFormData({ ...formData, duracion: e.target.value })} />
            </div>


            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="editPrecioServicio" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-color)' }}>Precio (CLP):</label>
              <input type="number" id="editPrecioServicio" min="0" required value={formData.precio} onChange={(e) => setFormData({...formData, precio: e.target.value})} style={{ width: '100%', padding: '0.8rem', border: '2px solid var(--primary-color)', borderRadius: '4px', fontSize: '1rem' }} />
            </div>

            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="editImagenServicio"> Imagen: </label>
              <input id="editImagenServicio" type="text" className="form-control" maxLength={255} placeholder="Nombre de archivo o URL" value={formData.imagen || ''} onChange={(e) => setFormData({ ...formData, imagen: e.target.value })} />
            </div>


            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className="btn-primary" disabled={guardando} style={{ flex: 1, margin: 0 }} > {guardando ? 'Actualizando...' : 'Actualizar Servicio'} </button>
              <button type="button" className="btn-outline" onClick={() => navigate('/admin/catalogo')} style={{ flex: 1, border: '1px solid var(--border-color)', background: 'transparent', padding: '0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-color)' }}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}