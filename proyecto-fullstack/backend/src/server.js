/**
 * Punto de ENTRADA del backend (entry point).
 *
 * POR QUÉ SEPARADO DE app.js: aquí solo viven las preocupaciones del
 * PROCESO: cargar variables de entorno y abrir el puerto. Si mañana
 * corremos en otro puerto o con otro runtime, solo tocamos este archivo.
 */

// dotenv config() lee el archivo .env y crea (o NO sobreescribe) las
// variables en process.env. Debe ir PRIMERO, porque app.js y otros módulos
// leen esas variables al hacer require.
require('dotenv').config();

// Importamos la app ya configurada.
const app = require('./app');

// PORT con valor por defecto 3001: si no hay .env, igual arranca.
// (process.env.PORT siempre es string o undefined -> Number evita sorpresas.)
const PORT = process.env.PORT || 3001;

// app.listen abre el socket TCP y delega en el Event Loop de Node para
// atender conexiones sin bloquear el hilo principal.
app.listen(PORT, () => {
  // Mensaje de arranque: confirma que el servidor está vivo y en qué puerto.
  console.log(`✔ Backend escuchando en http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
});
