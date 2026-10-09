/**
 * Middleware ERROR HANDLER (el último de la cadena).
 *
 * POR QUÉ EXISTE: es el receptor único de todos los next(error) que usan
 * los controllers. Express detecta la FIRMA DE 4 PARÁMETROS (err, req, res,
 * next) y lo trata como error handler, solo se ejecuta si hay un error.
 *
 * Ventaja: centralizamos el manejo de fallos inesperados y NUNCA filtramos
 * stack traces ni mensajes internos al cliente (buenas prácticas de
 * seguridad: el detalle del error queda en el log del servidor).
 *
 * Distinción 4xx vs 5xx:
 *  - Errores de CLIENTE (4xx, p. ej. body-parser con JSON inválido que
 *    marca err.statusCode = 400): devolvemos SU mensaje, porque el cliente
 *    sí debe saber qué corrigió. Ocultarlo sería mala UX.
 *  - Errores de SERVIDOR (5xx o desconocidos): respondemos SIEMPRE el
 *    mensaje genérico "Error interno del servidor" y el detalle solo va al
 *    log. Así no filtramos rutas internas, stack traces ni datos sensibles.
 */
function errorHandler(err, req, res, next) {
  // Log completo en consola del servidor: aquí sí vemos la pila de errores
  // para poder depurar. El cliente jamás la recibe.
  console.error('Error no controlado:', err);

  // Si los headers ya se enviaron (respuesta a medias), no podemos cambiar
  // el código: delegamos en el manejador por defecto de Express.
  if (res.headersSent) {
    return next(err);
  }

  // Express/body-parser marcan el código en statusCode (o status).
  // Si no lo traen, asumimos fallo interno (500).
  const codigo = err.statusCode || err.status || 500;

  if (codigo >= 500) {
    // 500 genérico. json() mantiene la consistencia de la API
    // (el frontend siempre espera { error: string }).
    return res.status(500).json({ error: 'Error interno del servidor' });
  }

  // 4xx: devolvemos el mensaje con el que ya se describió el error.
  res.status(codigo).json({ error: err.message || 'Error en la petición' });
}

module.exports = errorHandler;
