const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(ruta, opciones = {}) {
  const { token, headers, ...config } = opciones;

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...config,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...headers,
    },
  });

  const texto = await respuesta.text();
  let datos = null;

  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = texto;
    }
  }

  if (!respuesta.ok) {
    const error = new Error(
      datos?.message ||
      datos?.error ||
      `Error HTTP ${respuesta.status}`
    );

    error.status = respuesta.status;
    throw error;
  }

  return datos;
}

export function iniciarSesion(email, password) {
  return apiRequest("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
