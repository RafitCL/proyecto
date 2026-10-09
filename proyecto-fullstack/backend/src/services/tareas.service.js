/**
 * Capa de servicios: contiene la LÓGICA DE NEGOCIO pura.
 *
 * POR QUÉ EXISTE: separamos "qué hace la app" (aquí) de "cómo responde
 * HTTP" (controller) y "cómo se rutea" (routes). Así el controller solo
 * valida y formatea respuestas, y si mañana cambia la fuente de datos
 * (por ejemplo, una BD) solo se toca este archivo.
 *
 * Todas las funciones son síncronas porque operan sobre un arreglo en
 * memoria: no hay I/O real (ni disco ni red), por eso devuelven valores
 * directos en lugar de Promesas.
 */

// Acceso a los datos simulados compartidos por referencia (misma instancia).
const { tareas, siguienteId } = require('../data/tareas.mock');

/**
 * Lista tareas aplicando filtros opcionales.
 * @param {{ q?: string, completada?: boolean }} filtros
 * @returns {Array} arreglo filtrado (nunca el original, para no mutarlo por error)
 */
function listar(filtros = {}) {
  // Copia superficial del arreglo para no exponer el estado interno.
  let resultado = [...tareas];

  // Filtro de texto: busca coincidencia parcial e insensible a mayúsculas
  // en título O descripción. `q` puede venir vacío, por eso se comprueba.
  if (filtros.q) {
    const texto = filtros.q.toLowerCase();
    resultado = resultado.filter(
      (tarea) =>
        tarea.titulo.toLowerCase().includes(texto) ||
        tarea.descripcion.toLowerCase().includes(texto)
    );
  }

  // Filtro de estado: solo se aplica si llegó un booleano explícito.
  // Si es undefined (el cliente no filtró), devolvemos todo.
  if (typeof filtros.completada === 'boolean') {
    resultado = resultado.filter((tarea) => tarea.completada === filtros.completada);
  }

  return resultado;
}

/**
 * Busca una tarea por su id.
 * @param {number} id
 * @returns {object|undefined} la tarea o undefined si no existe
 */
function obtenerPorId(id) {
  // find devuelve el primer elemento que cumple la condición o undefined.
  return tareas.find((tarea) => tarea.id === id);
}

/**
 * Crea una tarea a partir de un payload ya validado por el controller.
 * @param {{ titulo: string, descripcion?: string, prioridad?: string, completada?: boolean }} datos
 * @returns {object} la tarea creada
 */
function crear(datos) {
  const nueva = {
    id: siguienteId(),
    titulo: datos.titulo.trim(),
    descripcion: (datos.descripcion || '').trim(),
    // Valor por defecto: si el cliente no manda prioridad, queda 'media'.
    prioridad: datos.prioridad || 'media',
    // Valor por defecto: toda tarea nueva nace pendiente.
    completada: typeof datos.completada === 'boolean' ? datos.completada : false,
    // toISOString() genera el estándar ISO 8601 que después parsea el front.
    creadaEn: new Date().toISOString()
  };
  // push muta el arreglo en memoria: ese es el "guardado" de este proyecto.
  tareas.push(nueva);
  return nueva;
}

/**
 * Actualiza una tarea existente (patrón PATCH parcial: solo los campos enviados).
 * @param {number} id
 * @param {object} datosCampos campos ya validados
 * @returns {{ ok: boolean, tarea?: object }}
 */
function actualizar(id, datosCampos) {
  const existente = obtenerPorId(id);
  if (!existente) return { ok: false };

  // Solo sobrescribimos lo que el cliente mandó (?? = "usa el valor actual
  // si la propiedad es null/undefined"). Así un PUT parcial no borra campos.
  const actualizada = {
    ...existente,
    titulo: datosCampos.titulo !== undefined ? datosCampos.titulo.trim() : existente.titulo,
    descripcion:
      datosCampos.descripcion !== undefined ? datosCampos.descripcion.trim() : existente.descripcion,
    prioridad: datosCampos.prioridad !== undefined ? datosCampos.prioridad : existente.prioridad,
    completada:
      datosCampos.completada !== undefined ? datosCampos.completada : existente.completada
  };

  // findIndex + asignación por índice: reemplazamos el objeto en su posición
  // manteniendo el mismo id y creadaEn (que no se editan).
  const indice = tareas.findIndex((tarea) => tarea.id === id);
  tareas[indice] = actualizada;
  return { ok: true, tarea: actualizada };
}

/**
 * Elimina una tarea del arreglo en memoria.
 * @param {number} id
 * @returns {boolean} true si se eliminó, false si no existía
 */
function eliminar(id) {
  const indice = tareas.findIndex((tarea) => tarea.id === id);
  if (indice === -1) return false;
  // splice borra 1 elemento en la posición 'indice'.
  tareas.splice(indice, 1);
  return true;
}

// Exportamos todas las operaciones como un "repositorio" de tareas.
module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
