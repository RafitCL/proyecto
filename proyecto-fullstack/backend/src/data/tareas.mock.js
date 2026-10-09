/**
 * Capa de datos simulados (mock).
 *
 * POR QUÉ EXISTE: el enunciado prohíbe base de datos, así que guardamos
 * las tareas en un arreglo de JavaScript que vive en la memoria del proceso
 * Node. Mientras el servidor no se reinicie, los cambios persisten.
 * Al reiniciarse, vuelve al estado inicial de este arreglo.
 */

// Arreglo inicial con 6 tareas de ejemplo. Nota: los valores son literales
// fijos (no se recalculan al importar), igual que una tabla "sembrada".
const tareas = [
  {
    id: 1,
    titulo: 'Preparar diapositivas de la defensa',
    descripcion: 'Crear slides que expliquen arquitectura cliente-servidor y el flujo de datos.',
    prioridad: 'alta',
    completada: false,
    creadaEn: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 2,
    titulo: 'Repasar ciclo de vida de React',
    descripcion: 'Montaje, actualización y desmontaje; y por qué useEffect necesita la bandera de limpieza.',
    prioridad: 'alta',
    completada: false,
    creadaEn: '2026-10-01T10:05:00.000Z'
  },
  {
    id: 3,
    titulo: 'Documentar endpoints en el README',
    descripcion: 'Tabla con métodos, rutas, códigos de estado y ejemplos curl.',
    prioridad: 'media',
    completada: true,
    creadaEn: '2026-10-02T09:00:00.000Z'
  },
  {
    id: 4,
    titulo: 'Practicar explicación del Event Loop',
    descripcion: 'Entender por qué fetch no bloquea el hilo principal en el navegador ni en Node.',
    prioridad: 'media',
    completada: false,
    creadaEn: '2026-10-02T11:30:00.000Z'
  },
  {
    id: 5,
    titulo: 'Revisar manejo de errores HTTP',
    descripcion: 'Diferenciar 400 (validación), 404 (no existe) y 500 (error interno).',
    prioridad: 'baja',
    completada: false,
    creadaEn: '2026-10-03T08:15:00.000Z'
  },
  {
    id: 6,
    titulo: 'Probar la aplicación de punta a punta',
    descripcion: 'Levantar backend y frontend, verificar CORS y el build de producción.',
    prioridad: 'baja',
    completada: true,
    creadaEn: '2026-10-03T18:45:00.000Z'
  }
];

/**
 * Genera el siguiente id disponible.
 *
 * POR QUÉ NO USAMOS autoincrement de BD: al no haber base de datos,
 * derivamos el id del mayor id existente + 1. Math.max recorre el arreglo
 * (operación O(n)) y con -Infinity como inicial cubre el caso arreglo vacío.
 */
function siguienteId() {
  if (tareas.length === 0) return 1;
  return Math.max(...tareas.map((tarea) => tarea.id)) + 1;
}

// CommonJS: exportamos el arreglo (mutable, compartido por toda la app)
// y la fábrica de ids.
module.exports = { tareas, siguienteId };
