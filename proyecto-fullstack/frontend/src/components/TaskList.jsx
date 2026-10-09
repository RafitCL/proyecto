/**
 * TaskList: contenedor de las tarjetas.
 *
 * Presentacional: no decide nada, solo itera y reparte callbacks hacia
 * cada TaskItem. Recibe `tareas` (array) y los manejadores del hook.
 */

import TaskItem from './TaskItem';

export default function TaskList({ tareas, onAlternar, onEliminar, onEditar }) {
  // Estado vacío amigable: mejor un mensaje que una lista en blanco.
  if (tareas.length === 0) {
    return (
      <p className="lista-vacia">
        No hay tareas que coincidan con el filtro actual.
      </p>
    );
  }

  return (
    <ul className="lista-tareas">
      {/*
        key=id: React identifica cada nodo de forma única. Con key estable
        (el id del servidor) reutiliza el DOM en vez de repintar toda la
        lista en cada actualización. Nunca usar el índice del map.
      */}
      {tareas.map((tarea) => (
        <TaskItem
          key={tarea.id}
          tarea={tarea}
          onAlternar={onAlternar}
          onEliminar={onEliminar}
          onEditar={onEditar}
        />
      ))}
    </ul>
  );
}
