import { apiRequest } from './api';

export function listarUsuarios(token) {
  return apiRequest('/api/v1/usuarios', {
    token
  });
}

export function obtenerUsuario(id, token) {
  return apiRequest(`/api/v1/usuarios/${id}`, {
    token
  });
}

export function crearUsuario(datos, token) {
  return apiRequest('/api/v1/usuarios', {
    method: 'POST',
    token,
    body: JSON.stringify(datos)
  });
}

export function actualizarUsuario(id, datos, token) {
  return apiRequest(`/api/v1/usuarios/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(datos)
  });
}

export function eliminarUsuario(id, token) {
  return apiRequest(`/api/v1/usuarios/${id}`, {
    method: 'DELETE',
    token
  });
}