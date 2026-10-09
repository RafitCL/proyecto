/**
 * Definición de rutas de tareas (capa de ENRUTAMIENTO).
 *
 * POR QUÉ EXISTE: Express sigue el patrón "rutas -> controller -> service".
 * Este archivo solo dice QUÉ URL llama a QUÉ función; no contiene lógica
 * de negocio ni validaciones (eso vive en el controller). Así las rutas
 * quedan legibles de un vistazo para documentar la API.
 */

const express = require('express');
const controller = require('../controllers/tareas.controller');

const router = express.Router();

// Rutas CRUD. El prefijo /api/tareas lo añade app.js con app.use(),
// por eso aquí solo escribimos las rutas relativas.

// Lectura de todas las tareas (acepta ?q= y ?completada=).
router.get('/', controller.listar);

// Lectura de una tarea por id. Express distingue /:id de /health.
router.get('/:id', controller.obtenerPorId);

// Creación. 201 en el controller.
router.post('/', controller.crear);

// Actualización completa/parcial.
router.put('/:id', controller.actualizar);

// Eliminación. 204 en el controller.
router.delete('/:id', controller.eliminar);

module.exports = router;
