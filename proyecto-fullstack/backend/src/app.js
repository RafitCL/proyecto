/**
 * Configuración de la APLICACIÓN Express (sin escuchar puertos).
 *
 * POR QUÉ ESTÁ SEPARADO DE server.js: separar "cómo configuro el app"
 * de "cómo arranco el proceso" permite importar `app` en tests sin abrir
 * puertos. Es un estándar de proyectos Express en producción.
 *
 * ORDEN DE LOS MIDDLEWARES (crítico, se explica en la defensa):
 *   1. express.json()  -> parsea el body JSON antes de llegar a las rutas
 *   2. cors()           -> responde a las peticiones "preflight" OPTIONS y
 *                          añade las cabeceras de origen permitido
 *   3. logger           -> observa cada petición
 *   4. rutas /api       -> lógica real
 *   5. notFound         -> solo se ejecuta si NINGUNA ruta coincidió
 *   6. errorHandler     -> solo se ejecuta si alguien llamó next(error)
 */

const express = require('express');
const cors = require('cors');
const logger = require('./middlewares/logger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const tareasRoutes = require('./routes/tareas.routes');
const { health } = require('./controllers/tareas.controller');

const app = express();

// 1) Body parser: transforma req.body de JSON a objeto JS. Sin esto,
// req.body sería undefined y el POST fallaría siempre.
app.use(express.json());

// 2) CORS: el navegador bloquea que http://localhost:5173 lea respuestas de
// http://localhost:3001 (misma política "same-origin"). CORS le dice al
// navegador "ese origen SÍ está autorizado".
// `origin` restringe el permiso al dominio del frontend (variable CLIENT_URL),
// que es más seguro que usar origin: true en cualquier origen.
app.use(cors());

// 3) Logger de peticiones.
app.use(logger);

// Ruta de salud: responde 200 con el uptime para comprobar que el proceso
// está vivo. Va bajo /api por convención de la API.
app.get('/api/health', health);

// 4) Montamos el router de tareas bajo /api/tareas. Todo lo que declare
// el router queda "prefijado" con esa base.
app.use('/api/tareas', tareasRoutes);

// 5) Cualquier URL que no coincida cae aquí (404 en JSON).
app.use(notFound);

// 6) Siempre el ÚLTIMO: captura errores lanzados o pasados con next(error).
app.use(errorHandler);

// Exportamos solo la app: server.js se encarga de escuchar.
module.exports = app;
