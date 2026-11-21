// Priorizar los mensajes específicos enviados por la API.
// Algunos HTTP 400 antiguos responden con "Datos de entrada invalidos";
// en esos casos el fallback del formulario es más comprensible.
export function mensajeErrorApi(error, mensajeAlternativo) {
  const mensaje = typeof error?.message === 'string' ? error.message.trim() : '';
  if (!mensaje || /^(Datos de entrada inv[aá]lidos|Bad Request|Error HTTP \d+)$/i.test(mensaje)) {
    return mensajeAlternativo;
  }
  return mensaje;
}
