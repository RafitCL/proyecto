/**
 * Capa de controladores: valida la ENTRADA y decide la RESPUESTA HTTP.
 *
 * POR QUÉ EXISTE: aquí es donde se traduce HTTP <-> lógica de negocio.
 * El controller no "sabe" cómo se almacenan las tareas (eso es trabajo del
 * service), solo valida, llama al service y responde con el código de
 * estado correcto (200, 201, 204, 400, 404).
 *
 * Todas las funciones reciben (req, res, next) para poder usar next(error)
 * y delegar en el middleware errorHandler centralizado.
 */

// Importamos el service: única puerta de acceso a los datos.
const service = require('../services/tareas.service');

// Lista de prioridades permitidas: la valida el controller, no el service,
// porque es una restricción de la API (contrato con el cliente).
const PRIORIDADES_VALIDAS = ['alta', 'media', 'baja'];

/**
 * GET /api/health
 * Endpoint "de vida": comprueba que el servidor responde y expone el
 * uptime (segundos desde que arrancó el proceso Node).
 */
function health(req, res) {
  // process.uptime() -> segundos con decimales; multiplicamos para 2 decimales.
  res.status(200).json({
    status: 'ok',
    uptime: Number(process.uptime().toFixed(2))
  });
}

/**
 * GET /api/tareas?q=texto&completada=true|false
 * Normaliza los query params (que llegan como string) antes de filtrar.
 */
function listar(req, res, next) {
  try {
    const filtros = {};

    // El query string siempre llega como texto: lo pasamos tal cual.
    if (req.query.q) filtros.q = String(req.query.q);

    // Convertimos "true"/"false" a booleano REAL. Cualquier otro valor se
    // ignora para no devolver listas incoherentes por un typo en la URL.
    if (req.query.completada === 'true') filtros.completada = true;
    else if (req.query.completada === 'false') filtros.completada = false;

    res.status(200).json(service.listar(filtros));
  } catch (error) {
    // Si algo falla, no respondemos 200: delegamos en errorHandler (500).
    next(error);
  }
}

/**
 * GET /api/tareas/:id
 * El param de ruta llega SIEMPRE como string, por eso lo convertimos a Number
 * antes de buscarlo en el arreglo de objetos con ids numéricos.
 */
function obtenerPorId(req, res, next) {
  try {
    const id = Number(req.params.id);

    // Defensa: "abc" -> NaN, y NaN no está en el arreglo, así que respondemos
    // 404 en lugar de dejar que la lógica interna falle silenciosamente.
    if (Number.isNaN(id)) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const tarea = service.obtenerPorId(id);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.status(200).json(tarea);
  } catch (error) {
    next(error);
  }
}

/**
 * Valida el cuerpo de POST/PUT. Devuelve un array de mensajes de error
 * (vacío = todo correcto). Compartimos la validación entre crear y
 * actualizar para no duplicar código (DRY).
 * @param {object} body cuerpo de la petición
 * @param {{ esActualizacion: boolean }} opciones en actualización el título
 *   puede omitirse, pero si viene debe ser válido.
 * @returns {string[]} errores encontrados
 */
function validar(body = {}, { esActualizacion = false } = {}) {
  const errores = [];

  // Regla: título obligatorio y no vacío (o solo espacios).
  if (body.titulo !== undefined) {
    if (typeof body.titulo !== 'string' || body.titulo.trim() === '') {
      errores.push('El título es obligatorio y no puede estar vacío');
    }
  } else if (!esActualizacion) {
    errores.push('El título es obligatorio y no puede estar vacío');
  }

  // Regla: prioridad solo puede ser alta | media | baja.
  if (body.prioridad !== undefined && !PRIORIDADES_VALIDAS.includes(body.prioridad)) {
    errores.push(`La prioridad debe ser una de: ${PRIORIDADES_VALIDAS.join(', ')}`);
  }

  // Regla: completada debe ser booleano de verdad (no el string "true").
  if (body.completada !== undefined && typeof body.completada !== 'boolean') {
    errores.push('El campo "completada" debe ser booleano (true o false)');
  }

  // Regla: descripción, si viene, debe ser texto.
  if (body.descripcion !== undefined && typeof body.descripcion !== 'string') {
    errores.push('El campo "descripcion" debe ser texto');
  }

  return errores;
}

/**
 * POST /api/tarea  ->  201 Created
 * Devolvemos 201 (y no 200) porque el servidor CREÓ un recurso nuevo:
 * es el código semántico que espera un cliente REST.
 */
function crear(req, res, next) {
  try {
    const errores = validar(req.body);
    if (errores.length > 0) {
      return res.status(400).json({ error: errores.join(' | ') });
    }
    const creada = service.crear(req.body);
    res.status(201).json(creada);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/tareas/:id  ->  200 | 400 | 404
 */
function actualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const errores = validar(req.body, { esActualizacion: true });
    if (errores.length > 0) {
      return res.status(400).json({ error: errores.join(' | ') });
    }

    const resultado = service.actualizar(id, req.body);
    if (!resultado.ok) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.status(200).json(resultado.tarea);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/tareas/:id  ->  204 | 404
 * 204 = "No Content": la operación salió bien pero no hay cuerpo que
 * devolver, por eso usamos res.status(204).send() sin .json().
 */
function eliminar(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const eliminada = service.eliminar(id);
    if (!eliminada) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { health, listar, obtenerPorId, crear, actualizar, eliminar };
