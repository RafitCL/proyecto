/**
 * Custom Hook useTasks: CENTRO DE ESTADO de la aplicación.
 *
 * POR QUÉ EXISTE: React nos da useState/useEffect, pero la lógica de
 * "cargar tareas, mantener filtros, manejar loading y errores, y exponer
 * acciones" se repetiría en cualquier componente que la necesitara.
 * Extraerla a un hook = reutilización + componentes presentacionales puros.
 *
 * Regla de oro: el hook tiene ESTADO y EFECTOS; los componentes solo
 * pintan y emiten eventos (props-down / events-up).
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getTareas,
  crearTarea,
  actualizarTarea,
  eliminarTarea
} from '../services/api';

// Estado inicial de los filtros. `completada: ''` significa "sin filtrar"
// (el backend solo recibe el parámetro si tiene valor).
const FILTROS_INICIALES = { q: '', completada: '' };

export default function useTasks() {
  // --- ESTADO ---
  const [tareas, setTareas] = useState([]); // datos a renderizar
  const [cargando, setCargando] = useState(true); // muestra "Cargando..."
  const [error, setError] = useState(null); // mensaje legible para el usuario
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);

  /**
   * Efecto de CARGA: se ejecuta en el montaje y cada vez que `filtros`
   * cambia (dependencia). Esa dependencia es intencional: cambiar el
   * texto de búsqueda debe volver a pedir la lista filtrada al servidor.
   *
   * BANDERA DE LIMPIEZA (`activo`): al cambiar los filtros o al desmontar,
   * React ejecuta el cleanup y pone `activo = false`. Así, si la respuesta
   * vieja llega DESPUÉS del cambio, NO escribimos un estado obsoleto
   * (evita el clásico "Can't perform a React state update on an
   * unmounted component" y el parpadeo de datos viejos).
   */
  useEffect(() => {
    let activo = true; // bandera viva para ESTA ejecución del efecto

    setCargando(true);

    getTareas(filtros)
      .then((datos) => {
        // Solo actualizamos si esta petición sigue siendo la relevante.
        if (activo) {
          setTareas(datos);
          setError(null);
        }
      })
      .catch((err) => {
        if (activo) setError(err.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    // Limpieza: se ejecuta ANTES del siguiente efecto y al desmontar.
    return () => {
      activo = false;
    };
  }, [filtros]); // ← dependencia explícita: filtros

  /**
   * Recarga silenciosa tras una mutación (crear/editar/borrar).
   * No toca `cargando` para no parpadear la lista entera: el servidor es
   * la única fuente de verdad y así los filtros siguen aplicándose.
   */
  const recargar = useCallback(async () => {
    try {
      const datos = await getTareas(filtros);
      setTareas(datos);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [filtros]);

  // --- ACCIONES expuestas a la UI (todas async porque hablan con la API) ---

  /** Crea una tarea y recarga la lista. */
  const agregar = useCallback(
    async (datosTarea) => {
      const nueva = await crearTarea(datosTarea);
      await recargar();
      return nueva;
    },
    [recargar]
  );

  /** Invierte el flag `completada` de una tarea existente. */
  const alternar = useCallback(
    async (tarea) => {
      await actualizarTarea(tarea.id, {
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        prioridad: tarea.prioridad,
        completada: !tarea.completada
      });
      await recargar();
    },
    [recargar]
  );

  /** Aplica una edición parcial (solo los campos enviados). */
  const editar = useCallback(
    async (id, cambios) => {
      await actualizarTarea(id, cambios);
      await recargar();
    },
    [recargar]
  );

  /** Elimina una tarea por id y recarga. */
  const eliminar = useCallback(
    async (id) => {
      await eliminarTarea(id);
      await recargar();
    },
    [recargar]
  );

  /** Actualiza un filtro concreto (llamado por el componente Filter). */
  const actualizarFiltro = useCallback((nombre, valor) => {
    // Actualización funcional: respetamos el resto de filtros que no cambian.
    setFiltros((prev) => ({ ...prev, [nombre]: valor }));
  }, []);

  /** Permite cerrar el mensaje de error desde la UI. */
  const limpiarError = useCallback(() => setError(null), []);

  return {
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
  };
}
