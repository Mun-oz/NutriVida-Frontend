import { apiRequest } from './api';

export function listarCitas(token) {
  return apiRequest('/api/v1/citas', {
    token
  });
}

export function listarMisCitas(token) {
  return apiRequest('/api/v1/citas/mis-citas', {
    token
  });
}

export function obtenerCita(id, token) {
  return apiRequest(`/api/v1/citas/${id}`, {
    token
  });
}

export function crearCita(datos, token = null) {
  return apiRequest('/api/v1/citas', {
    method: 'POST',
    ...(token ? { token } : {}),
    body: JSON.stringify(datos)
  });
}

export function actualizarCita(id, datos, token) {
  return apiRequest(`/api/v1/citas/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(datos)
  });
}

export function cambiarEstadoCita(id, estado, token) {
  return apiRequest(`/api/v1/citas/${id}/estado`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ estado })
  });
}

export function eliminarCita(id, token) {
  return apiRequest(`/api/v1/citas/${id}`, {
    method: 'DELETE',
    token
  });
}