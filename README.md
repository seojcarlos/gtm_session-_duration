✨ Rastreador Avanzado de Duración de Sesión para GTM
Bienvenido al que probablemente sea el script de seguimiento de duración de sesión más robusto, preciso y flexible que puedas implementar en Google Tag Manager.

Este no es un simple temporizador. Es una solución de nivel profesional diseñada para ofrecer datos de la más alta calidad, con una arquitectura resiliente que protege la integridad de tu analítica y la experiencia de tus usuarios.

🚀 ¿Por Qué Este Script es Diferente?
Mientras que la mayoría de los scripts se limitan a contar segundos, esta solución fue concebida para resolver los problemas del mundo real a los que se enfrentan los analistas y desarrolladores:

Precisión Absoluta: Olvídate de los errores acumulados de setInterval. Usamos timestamps para medir el tiempo real que un usuario pasa activamente en tu sitio, con una precisión milimétrica.
Integridad de Datos Inquebrantable: ¿Un usuario navega en modo incógnito o tiene la sessionStorage bloqueada? Otros scripts fallan o, peor aún, envían datos "sucios". El nuestro detecta el problema, notifica y se desactiva elegantemente, protegiendo la calidad de tus informes.
Configuración Centralizada en GTM: No necesitas tocar el código para ajustar los intervalos. Toda la configuración se gestiona desde una Variable de GTM, permitiendo un control total desde la interfaz que ya conoces y amas.
Arquitectura a Prueba de Balas: Envuelto en múltiples capas de seguridad try...catch, este script está diseñado para ser un ciudadano ejemplar en tu sitio web: nunca romperá la ejecución de otras funcionalidades.
⚙️ Guía de Instalación y Configuración
Implementar esta potente herramienta es un proceso sencillo y directo. Sigue estos tres pasos:

✅ Paso 1: Crear la Variable de Configuración en GTM
Esta variable le dirá al script en qué momentos debe disparar un evento.

En GTM, ve a Variables → Variables definidas por el usuario → Nueva.
Tipo de Variable: Constante.
Nombre de la Variable: c_sessionMilestones (es importante que el nombre sea exacto).
Valor: Introduce los segundos de los hitos que deseas medir, separados por comas.
💡 Ejemplo de Valor:

0,5,15,30,60,180,300,600
(Esto disparará eventos a los 0s, 5s, 15s, 30s, 1m, 3m, 5m y 10m)

✅ Paso 2: Crear la Etiqueta de Script Personalizado
Aquí es donde vive la magia.

Ve a Etiquetas → Nueva.
Configuración de la etiqueta: HTML Personalizado.
Nombra la etiqueta: Algo descriptivo, como Custom HTML - Session Duration Tracker.
Pega el siguiente código en el cuadro de HTML: añade al script las etiquetas de apertuta y cierre <script></script>

✅ Paso 3: Configurar el Activador
El script está diseñado para funcionar con un único activador que captura todos sus eventos.

En la configuración de tu nueva etiqueta, ve a la sección Activación.
Crea un nuevo activador de tipo Evento personalizado.
Nombre del evento: session_duration
Este activador se déclenche sur: Todos los eventos personalizados.
Guarda el activador y la etiqueta.
🛡️ Gestión de Errores: La Notificación Inteligente
La verdadera potencia se demuestra cuando las cosas van mal.

⚠️ ¿Qué pasa si sessionStorage está bloqueado?
El script no se rompe. En su lugar, realiza una única acción: empuja un evento al dataLayer con la etiqueta tracker_storage_blocked.

dataLayer.push({ event: 'session_duration', session_duration_label: 'tracker_storage_blocked' })

Después, se desactiva por completo. Esto te da una doble victoria: tu sitio sigue funcionando a la perfección y tú obtienes datos procesables sobre cuántos usuarios experimentan este bloqueo.

📊 Análisis de Datos: Sacando Partido a la Información
Ahora que todo está configurado, puedes explotar estos datos en tus herramientas de análisis.

Crea una Variable de Capa de Datos en GTM para capturar la etiqueta de duración:

Nombre de la Variable: dlv - session_duration_label
Versión de la capa de datos: Versión 2
Nombre de la variable de la capa de datos: session_duration_label
Utiliza esta variable en tus etiquetas (ej. Google Analytics):

Puedes configurar la "Acción de evento" de tu etiqueta de GA para que sea {{dlv - session_duration_label}}.
Esto enviará automáticamente acciones como 5_seconds, 1_minute o la importantísima tracker_storage_blocked, dándote una visión completa y limpia en tus informes.

Si Quieres que te lo implemente yo contactame jcarlos@convertiam.com