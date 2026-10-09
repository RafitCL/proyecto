/**
 * Filter: barra de BÚSQUEDA y FILTRO por estado.
 *
 * No guarda estado: recibe `filtros` y notifica cambios con `onCambio(nombre, valor)`.
 * El estado vive en el hook useTasks, porque es él quien debe volver a
 * pedir la lista al servidor cuando el filtro cambia.
 */

export default function Filter({ filtros, onCambio }) {
  return (
    <section className="barra-filtros">
      <div className="campo campo-busqueda">
        <label htmlFor="buscar">Buscar</label>
        <input
          id="buscar"
          type="search"
          placeholder="Buscar por título o descripción..."
          // `search` muestra el botón "X" nativo para limpiar.
          value={filtros.q}
          onChange={(evento) => onCambio('q', evento.target.value)}
        />
      </div>

      <div className="campo campo-estado">
        <label htmlFor="estado">Estado</label>
        <select
          id="estado"
          value={filtros.completada}
          onChange={(evento) => onCambio('completada', evento.target.value)}
        >
          {/* '' = sin filtro (el hook no envía el parámetro al backend) */}
          <option value="">Todas</option>
          <option value="false">Pendientes</option>
          <option value="true">Completadas</option>
        </select>
      </div>
    </section>
  );
}
