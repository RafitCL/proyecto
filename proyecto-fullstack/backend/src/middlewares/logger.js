/**
 * Middleware LOGGER.
 *
 * POR QUÉ EXISTE: middleware = función con firma (req, res, next) que se
 * ejecuta EN CADENA antes de llegar a la ruta. Este no altera la petición,
 * solo observa y al final llama a next() para continuar la cadena.
 * Nos sirve para trazar cada petición en la consola del servidor, algo
 * fundamental para depurar (y para demostrar en la defensa que el
 * middleware se ejecuta antes que el handler).
 */

function logger(req, res, next) {
  // Guardamos el instante de inicio con performance.now() (milisegundos
  // con decimales, monótono) para medir la duración real de la respuesta.
  const inicio = Date.now();

  // 'finish' es un evento del stream de respuesta: se dispara UNA VEZ cuando
  // Express ha terminado de enviar los bytes al cliente. Ahí sí conocemos
  // el código de estado final (res.statusCode).
  res.on('finish', () => {
    const duracion = Date.now() - inicio;
    // Formato legible: MÉTODO  URL  CÓDIGO  DURACIÓN ms
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duracion}ms`);
  });

  // Obligatorio: sin next() la petición se quedaría COLGADA aquí.
  next();
}

module.exports = logger;
