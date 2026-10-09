/**
 * TaskItem: representa UNA tarea (tarjeta).
 *
 * Presentacional: recibe la tarea y 3 callbacks. Todo lo que "hace" lo
 * eleva con props hacia App (events-up) y App delega en el hook.
 * Incluye edición en línea para demostrar el flujo completo de eventos.
 */

import { useState } from 'react';

// Mapa de prioridad -> clase CSS. Lo definimos fuera del componente porque
// es una constante pura: crearlo en cada render sería trabajo innecesario.
const CLASES_PRIORIDAD = {
  alta: 'prioridad-alta',
  media: 'prioridad-media',
  baja: 'prioridad-baja'
};

export default function TaskItem({ tarea, onAlternar, onEliminar, onEditar }) {
  // Modo edición local: este estado SOLO vive aquí, no necesita compartirse.
  const [editando, setEditando] = useState(false);
  const [tituloEditado, setTituloEditado] = useState(tarea.titulo);

  const guardarEdicion = async () => {
    const limpio = tituloEditado.trim();
    // No enviamos peticiones inútiles si no cambió nada o está vacío.
    if (limpio === '' || limpio === tarea.titulo) {
      setTituloEditado(tarea.titulo);
      setEditando(false);
      return;
    }
    await onEditar(tarea.id, { titulo: limpio });
    setEditando(false);
  };

  return (
    <li className={`tarjeta-tarea ${tarea.completada ? 'completada' : ''}`}>
      {/* Checkbox controlado: su estado visual refleja el de la tarea */}
      <input
        type="checkbox"
        className="checkbox-tarea"
        checked={tarea.completada}
        // El evento sube: App -> useTasks.alternar -> PUT /api/tareas/:id
        onChange={() => onAlternar(tarea)}
        aria-label={`Marcar "${tarea.titulo}" como ${
          tarea.completada ? 'pendiente' : 'completada'
        }`}
      />

      <div className="contenido-tarea">
        {editando ? (
          // --- VISTA DE EDICIÓN EN LÍNEA ---
          <div className="edicion">
            <input
              type="text"
              value={tituloEditado}
              onChange={(evento) => setTituloEditado(evento.target.value)}
              // onKeyDown escucha el teclado: Enter guarda, Escape cancela.
              onKeyDown={(evento) => {
                if (evento.key === 'Enter') guardarEdicion();
                if (evento.key === 'Escape') {
                  setTituloEditado(tarea.titulo);
                  setEditando(false);
                }
              }}
              autoFocus
            />
            <div className="botones-edicion">
              <button
                type="button"
                className="boton boton-mini"
                onClick={guardarEdicion}
              >
                Guardar
              </button>
              <button
                type="button"
                className="boton boton-mini boton-secundario"
                onClick={() => {
                  setTituloEditado(tarea.titulo);
                  setEditando(false);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          // --- VISTA DE LECTURA ---
          <>
            <div className="fila-titulo">
              <h3 className={tarea.completada ? 'tachado' : ''}>{tarea.titulo}</h3>
              {/* Badge de prioridad coloreado según la clase asignada */}
              <span className={`badge ${CLASES_PRIORIDAD[tarea.prioridad]}`}>
                {tarea.prioridad}
              </span>
            </div>

            {tarea.descripcion && <p className="descripcion">{tarea.descripcion}</p>}

            <div className="pie-tarea">
              {/* Formato local en español; la API guarda ISO 8601 (UTC) */}
              <small className="fecha">
                {new Date(tarea.creadaEn).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </small>

              <div className="acciones">
                <button
                  type="button"
                  className="boton boton-mini"
                  onClick={() => setEditando(true)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="boton boton-mini boton-peligro"
                  // El id viaja en el closure del onClick.
                  onClick={() => onEliminar(tarea.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </li>
  );
}
