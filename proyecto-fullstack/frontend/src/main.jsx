/**
 * Punto de ENTRADA del frontend.
 *
 * Aquí React "toma el relevo" del HTML estático: createRoot busca el div
 * #root (definido en index.html) y monta <App /> dentro, gestionando a
 * partir de ahí todo el DOM con el algoritmo de reconciliación.
 */

import React from 'react'; // necesario con el runtime clásico de JSX
import ReactDOM from 'react-dom/client';
import App from './App';
// Estilos globales: Vite los inyecta en <head> durante el build.
import './styles.css';

// StrictMode NO afecta a producción; en desarrollo dobla los efectos
// (montaje -> desmontaje -> montaje) para destapar efectos sin cleanup.
// Que nuestra app siga bien con ello valida la bandera de limpieza.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
