import { apiRequest } from './api';

const API_BASE = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/$/, '');

export const SERVICIOS_URL = `${API_BASE}/api/v1/servicios`;

// Mostrar precios en pesos chilenos
export function formatearPrecio(precio) {
  if (typeof precio !== 'number' || Number.isNaN(precio)) {
    return '$0';
  }

  return `$${precio.toLocaleString('es-CL')}`;
}

// Buscar por nombre, código o ID
export function filtrarServicios(servicios, criterio) {
  if (!Array.isArray(servicios)) return [];

  if (typeof criterio !== 'string' || !criterio.trim()) {
    return servicios;
  }

  const busqueda = criterio.toLowerCase().trim();

  return servicios.filter((s) => {
    const nombre = String(s.nombre ?? '').toLowerCase();
    const codigo = String(s.codigo ?? '').toLowerCase();
    const id = String(s.id ?? '').toLowerCase();

    return (
      nombre.includes(busqueda) ||
      codigo.includes(busqueda) ||
      id.includes(busqueda)
    );
  });
}

export function obtenerServicioPorId(servicios, id) {
  if (!Array.isArray(servicios) || id == null || id === '') {
    return null;
  }

  return servicios.find(
    (s) =>
      String(s.id) === String(id) ||
      String(s.codigo ?? '').toLowerCase() ===
        String(id).toLowerCase()
  ) || null;
}

// Imagen almacenada en el backend
export function obtenerImagenServicio(servicio) {
  const imagen = String(
    servicio?.imagen || servicio?.img || ''
  ).trim();

  const carpeta = `${import.meta.env.BASE_URL}assets/img/`;
  const imagenDefecto = `${carpeta}consulta_nutri.jpg`;

  if (!imagen) return imagenDefecto;

  if (/^https?:\/\//i.test(imagen)) {
    return imagen;
  }

  const archivo = imagen.split(/[\\/]/).pop();

  return `${carpeta}${archivo}`;
}

// Operaciones API REST
export function listarServicios() {
  return apiRequest('/api/v1/servicios');
}

export function obtenerServicio(id) {
  return apiRequest(`/api/v1/servicios/${id}`);
}

export function crearServicio(datos, token) {
  return apiRequest('/api/v1/servicios', {
    method: 'POST',
    token,
    body: JSON.stringify(datos)
  });
}

export function actualizarServicio(id, datos, token) {
  return apiRequest(`/api/v1/servicios/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(datos)
  });
}

export function eliminarServicio(id, token) {
  return apiRequest(`/api/v1/servicios/${id}`, {
    method: 'DELETE',
    token
  });
}
