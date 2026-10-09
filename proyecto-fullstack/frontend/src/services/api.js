/**
 * Capa de SERVICIOS HTTP del frontend (cliente API).
 */

// URL absoluta directa al puerto del backend
const API_URL = 'http://localhost:3001/api';

/**
 * Helper interno: hace la petición, maneja errores de red y de HTTP.
 */
async function pedir(path, options = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${path}`, options);
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. ¿Está el backend activo?');
  }

  if (respuesta.status === 204) return null;

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(datos?.error || `Error ${respuesta.status}`);
  }

  return datos;
}

/**
 * GET /api/tareas?q=&completada=
 */
export async function getTareas(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.q) params.set('q', filtros.q);
  if (filtros.completada) params.set('completada', filtros.completada);

  const query = params.toString();
  // Corregido de forma limpia sin barras invertidas accidentales
  return pedir(query ? `/tareas?${query}` : '/tareas');
}

/**
 * POST /api/tareas
 */
export async function crearTarea(tarea) {
  return pedir('/tareas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tarea)
  });
}

/**
 * PUT /api/tareas/:id
 */
export async function actualizarTarea(id, tarea) {
  return pedir(`/tareas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tarea)
  });
}

/**
 * DELETE /api/tareas/:id
 */
export async function eliminarTarea(id) {
  return pedir(`/tareas/${id}`, { method: 'DELETE' });
}
