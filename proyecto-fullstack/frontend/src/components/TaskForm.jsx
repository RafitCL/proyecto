/**
 * TaskForm: formulario de CREACIÓN de tareas.
 *
 * Es un componente CONTROLADO: los inputs leen de estado local (value + onChange)
 * para que React sea la única fuente de verdad de lo que se escribe.
 * No conoce la API: solo llama a props.onAgregar(datos) y deja que el padre
 * (App -> useTasks) haga el fetch. Así es 100% presentacional y testeable.
 */

import { useState } from 'react';

// Estado vacío del formulario; lo usamos también para reiniciar tras enviar.
const ESTADO_INICIAL = { titulo: '', descripcion: '', prioridad: 'media' };

export default function TaskForm({ onAgregar }) {
  const [formulario, setFormulario] = useState(ESTADO_INICIAL);
  const [errorLocal, setErrorLocal] = useState('');

  // Un solo manejador para todos los campos: usamos [nombre] como clave
  // dinámica, así añadir un campo nuevo no obliga a escribir otra función.
  const cambiarCampo = (evento) => {
    const { name, value } = evento.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    // Borra el aviso en cuanto el usuario vuelve a escribir.
    if (errorLocal) setErrorLocal('');
  };

  const enviar = (evento) => {
    // PREVENIMOS el refresco de página por defecto del <form>.
    // Sin esto, el navegador recargaría y perderíamos todo el estado React.
    evento.preventDefault();

    // Validación en cliente: título obligatorio y no vacío.
    if (formulario.titulo.trim() === '') {
      setErrorLocal('El título es obligatorio.');
      return; // no seguimos: evitamos una petición inútil al servidor
    }

    // Elevamos el evento hacia arriba con los datos ya "limpios".
    onAgregar({
      titulo: formulario.titulo.trim(),
      descripcion: formulario.descripcion.trim(),
      prioridad: formulario.prioridad
    });

    // Reiniciamos el formulario y el error local tras un envío válido.
    setFormulario(ESTADO_INICIAL);
    setErrorLocal('');
  };

  return (
    <section className="tarjeta-formulario">
      <h2>Nueva tarea</h2>

      <form onSubmit={enviar} noValidate>
        <div className="campo">
          {/* htmlFor/id asocian label con input (accesibilidad + foco al clic) */}
          <label htmlFor="titulo">Título *</label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            placeholder="Ej.: Repasar Effect y dependencias"
            value={formulario.titulo}
            onChange={cambiarCampo}
            // aria-invalid y aria-describedby ayudan a lectores de pantalla
            // a anunciar que el campo tiene un error.
            aria-invalid={errorLocal ? 'true' : 'false'}
          />
        </div>

        <div className="campo">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            rows="3"
            placeholder="Detalles opcionales..."
            value={formulario.descripcion}
            onChange={cambiarCampo}
          />
        </div>

        <div className="campo">
          <label htmlFor="prioridad">Prioridad</label>
          <select
            id="prioridad"
            name="prioridad"
            value={formulario.prioridad}
            onChange={cambiarCampo}
          >
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>

        {/* role="alert" hace que el lector de pantalla anuncie el error al aparecer */}
        {errorLocal && (
          <p className="mensaje-error" role="alert">
            {errorLocal}
          </p>
        )}

        <button type="submit" className="boton boton-primario">
          Agregar tarea
        </button>
      </form>
    </section>
  );
}
