/**
 * Middleware NOT FOUND (404).
 *
 * POR QUÉ EXISTE: Express solo responde 404 por sí solo si ninguna ruta
 * coincide, pero con mensaje HTML poco amigable. Al montarlo DESPUÉS de
 * todas las rutas (app.use(rutas); app.use(notFound)), solo se ejecuta si
 * la petición llegó al final sin coincidir con ningún endpoint: es nuestro
 * "catch-all" de URLs inexistentes.
 */
function notFound(req, res) {
  // No llamamos a next(): aquí la respuesta TERMINA (404 en JSON).
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
}

module.exports = notFound;
