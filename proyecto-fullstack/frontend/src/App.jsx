/**
 * App: componente RAÍZ de la aplicación.
 *
 * Su único trabajo es COMPOSAR: consume el hook useTasks (donde vive el
 * estado y la comunicación con la API) y reparte datos (props-down) y
 * callbacks (events-up) entre los componentes presentacionales.
 */

import useTasks from './hooks/useTasks';
import TaskForm from './components/TaskForm';
import Filter from './components/Filter';
import TaskList from './components/TaskList';

export default function App() {
  // Todo el estado y las acciones salen de un único hook.
  const {
    tareas,
    cargando,
    error,
    filtros,
    agregar,
    alternar,
    editar,
    eliminar,
    actualizarFiltro,
    limpiarError
  } = useTasks();

  // Contador derivado: NO es estado, se recalcula en cada render con reduce.
  // Si fuera useState habría que mantenerlo a mano y se desincronizaría.
  const pendientes = tareas.filter((tarea) => !tarea.completada).length;

  // Los manjeadores son async: si algo falla (backend caído, 404...),
  // capturamos aquí para que la UI muestre el error en lugar de romperse.
  const manejarAccion = (accion) => async (...argumentos) => {
    try {
      await accion(...argumentos);
    } catch (err) {
      alert(`No se pudo completar la operación: ${err.message}`);
    }
  };

  return (
    <div className="contenedor">
      <header className="cabecera">
        <h1> Gestionador de Tareas</h1>
        {/* Estado derivado visible: cuántas tareas quedan por hacer */}
        <p className="contador">
          {pendientes} {pendientes === 1 ? 'tarea pendiente' : 'tareas pendientes'}
        </p>
      </header>

      {/*
        Mensaje de error de la API: se muestra aunque estemos cargando,
        para que un fallo de red nunca quede oculto tras un spinner.
        role="alert" => accesibilidad (anuncio inmediato).
      */}
      {error && (
        <div className="alerta-error" role="alert">
          <span>⚠ {error}</span>
          <button
            type="button"
            className="boton boton-mini"
            onClick={limpiarError}
          >
            Cerrar
          </button>
        </div>
      )}

      <main>
        <TaskForm onAgregar={manejarAccion(agregar)} />

        <Filter filtros={filtros} onCambio={actualizarFiltro} />

        {/* Cargando solo cuando aún no hay respuesta del servidor */}
        {cargando ? (
          <p className="cargando">Cargando...</p>
        ) : (
          <TaskList
            tareas={tareas}
            onAlternar={manejarAccion(alternar)}
            onEliminar={manejarAccion(eliminar)}
            onEditar={manejarAccion(editar)}
          />
        )}
      </main>

      <footer className="pie">
        <small>
          Proyecto académico · React 18 + Express · Datos en memoria (sin base
          de datos)
        </small>
      </footer>
    </div>
  );
}
