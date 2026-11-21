import { validarRut } from './validadores';

const ZONA_CHILE = 'America/Santiago';

// Evita usar toISOString(): trabaja en UTC y puede dar otra fecha en Chile.
export function fechaHoraChile(ahora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA_CHILE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(ahora);

  const valor = (tipo) => partes.find((p) => p.type === tipo)?.value;
  return {
    fecha: `${valor('year')}-${valor('month')}-${valor('day')}`,
    hora: `${valor('hour')}:${valor('minute')}`
  };
}

// Validación para informar al usuario ANTES de enviar; el backend sigue siendo la autoridad.
export function validarDatosCita({ run, email, fecha, hora }, ahora = new Date()) {
  const runNormalizado = String(run || '').replace(/[.-]/g, '').trim().toUpperCase();
  if (!/^[0-9]{7,8}[0-9K]$/.test(runNormalizado) || !validarRut(runNormalizado)) {
    return 'El RUN no es válido. Revisa el dígito verificador (ejemplo: 12.345.678-5).';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())) {
    return 'Ingresa un correo electrónico válido.';
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fecha || '')) ||
      !/^\d{2}:\d{2}$/.test(String(hora || ''))) {
    return 'Selecciona una fecha y hora válidas.';
  }

  const dia = new Date(`${fecha}T12:00:00Z`);
  if (Number.isNaN(dia.getTime()) || dia.toISOString().slice(0, 10) !== fecha) {
    return 'Selecciona una fecha válida.';
  }

  if ([0, 6].includes(dia.getUTCDay())) {
    return 'No se pueden reservar citas los sábados ni domingos. Elige un día de lunes a viernes.';
  }

  if (hora < '09:00' || hora >= '18:00') {
    return 'El horario de atención es de lunes a viernes, desde las 09:00 hasta antes de las 18:00.';
  }

  const actual = fechaHoraChile(ahora);
  if (fecha < actual.fecha || (fecha === actual.fecha && hora <= actual.hora)) {
    return 'La fecha y hora deben ser futuras (hora de Chile).';
  }

  return null;
}
