# ✨ Rastreador Avanzado de Duración de Sesión V24.0 para GTM

Bienvenido al que **definitivamente** es el script de seguimiento de duración de sesión más robusto, inteligente y flexible que puedas implementar en Google Tag Manager.

Este no es un simple temporizador. Es una solución de **nivel enterprise** diseñada para ofrecer datos de la más alta calidad, con una arquitectura resiliente que protege la integridad de tu analítica y la experiencia de tus usuarios, ahora con **capacidades cross-subdomain** y **detección automática de contexto**.

---

## 🚀 ¿Por Qué Este Script V24.0 es Diferente?

Mientras que la mayoría de los scripts se limitan a contar segundos, esta solución fue concebida para resolver los problemas del mundo real a los que se enfrentan los analistas y desarrolladores modernos:

### 🎯 **Precisión Absoluta con Inteligencia Contextual**
- **Timestamps reales**: Olvídate de los errores acumulados de `setInterval`. Medimos el tiempo real que un usuario pasa **activamente** en tu sitio.
- **Detección automática**: El script **sabe** cuándo está midiendo segundos vs minutos y ajusta las variables automáticamente.
- **Cross-subdomain nativo**: Una sesión que comienza en `blog.tusite.com` continúa perfectamente en `shop.tusite.com`.

### 🛡️ **Integridad de Datos Inquebrantable**
- **Sistema de fallback inteligente**: ¿Cookies bloqueadas? Pasa a localStorage. ¿También bloqueado? Usa sessionStorage. ¿Modo incógnito extremo? Funciona en memoria.
- **Validación de sesión**: Detecta y descarta sesiones corruptas o demasiado antiguas automáticamente.
- **Protección de calidad**: Si algo falla, se desactiva elegantemente, protegiendo la pureza de tus datos.

### ⚙️ **Configuración Ultra-Flexible**
- **Variables específicas**: `tiempo_seconds` para segundos, `tiempo_minuts` para minutos - como debe ser.
- **Milestones configurables**: Desde `0,5,15,30` hasta `60,120,300,1800` - tú decides qué medir.
- **Control total desde GTM**: Cambiar configuración = cambiar una variable. Sin tocar código.

### 🔧 **Arquitectura de Nivel Profesional**
- **Debugging integrado**: Logs detallados, información de estado, monitoreo en tiempo real.
- **Compatibility layer**: Funciona en todos los navegadores, incluso los más antiguos.
- **Zero-impact design**: Nunca romperá la ejecución de otras funcionalidades.

---

## ⚙️ Guía de Instalación y Configuración

Implementar esta bestia de la ingeniería es sorprendentemente sencillo. Sigue estos pasos:

### ✅ **Paso 1: Crear la Variable de Configuración en GTM**

Esta variable le dice al script cuándo disparar eventos con **total flexibilidad**:

1. En GTM: **Variables** → **Variables definidas por el usuario** → **Nueva**
2. **Tipo**: Constante
3. **Nombre**: `c_sessionMilestones` *(exacto, es case-sensitive)*
4. **Valor**: Los segundos que quieres medir, separados por comas

#### 💡 **Ejemplos de Configuración Inteligente:**

```javascript
// Para sitios de contenido (lectura)
"0,5,15,30,60,180,300,600"

// Para e-commerce (decisión de compra)  
"0,10,30,60,120,300,600,1200"

// Para SaaS (engagement profundo)
"0,5,15,30,60,120,300,600,900,1800"

// Solo segundos (landing pages)
"0,5,10,15,30,45"

// Solo minutos (aplicaciones)
"60,120,180,300,600,900,1200,1500,1800"
```

**El script automáticamente detecta:**
- `< 60` segundos → Variable `tiempo_seconds`
- `≥ 60` segundos → Variable `tiempo_minuts` (convierte a minutos)

### ✅ **Paso 2: Implementar el Script**

1. **Etiquetas** → **Nueva** → **HTML Personalizado**
2. **Nombre**: `Session Duration Tracker V24.0`
3. **Activa** en: `All Pages` (o tu trigger preferido)
4. **Pega el código** del script V24.0

### ✅ **Paso 3: Configurar el Activador Universal**

El script usa un **único evento** para todo:

1. **Activadores** → **Nuevo** → **Evento personalizado**
2. **Nombre del evento**: `session_duration`
3. **Aplica a**: `Todos los eventos personalizados`

---

## 📊 **Datos que Recibirás (DataLayer)**

### **Para Segundos** (ej: 15 segundos):
```javascript
{
  'event': 'session_duration',
  'tiempo_seconds': 15,
  'session_duration_label': '15_seconds',
  'session_duration_seconds': 15,
  'session_storage_method': 'cookies',
  'session_cross_subdomain': true,
  'session_tracker_version': 'V24.0'
}
```

### **Para Minutos** (ej: 300 segundos = 5 minutos):
```javascript
{
  'event': 'session_duration', 
  'tiempo_minuts': 5,
  'session_duration_label': '5_minutes',
  'session_duration_seconds': 300,
  'session_storage_method': 'cookies',
  'session_cross_subdomain': true,
  'session_tracker_version': 'V24.0'
}
```

### **Caso Especial - Carga de Página**:
```javascript
{
  'event': 'session_duration',
  'tiempo_seconds': 0,
  'session_duration_label': 'page_load',
  // ... resto de datos
}
```

---

## 🛡️ **Gestión de Errores: La Diferencia Profesional**

### ⚠️ **Detección Automática de Problemas**

El script V24.0 no solo funciona - **se adapta**:

- **Cookies bloqueadas** → Fallback a localStorage
- **LocalStorage deshabilitado** → Fallback a sessionStorage  
- **Todo bloqueado** → Modo memoria (funcionalidad limitada)

### 📊 **Eventos de Diagnóstico**

Si hay problemas, recibirás eventos informativos:
```javascript
{
  'event': 'session_duration',
  'session_duration_label': 'tracker_storage_blocked',
  'session_storage_method': 'memory'
}
```

---

## 🔍 **Debugging y Monitoreo Avanzado**

### **Comandos de Consola (Modo Dios):**

```javascript
// Activar logging detallado
gtmSessionTrackerDebug.enableDebug();

// Ver estado completo de la sesión
gtmSessionTrackerDebug.getInfo();

// Ver todos los milestones configurados  
gtmSessionTrackerDebug.getMilestones();

// Desactivar logs
gtmSessionTrackerDebug.disableDebug();
```

### **Información que obtendrás:**
- Tiempo total vs tiempo activo
- Método de storage utilizado
- Milestones alcanzados y pendientes
- Capacidad cross-subdomain
- Estado de cookies/localStorage

---

## 🧹 **Testing y Depuración**

### **Limpiar Estado para Testing:**
```javascript
// Borrar solo la cookie del tracker
document.cookie = "gtm_session_tracker_state=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
localStorage.removeItem('gtm_session_tracker_state');
sessionStorage.removeItem('gtm_session_tracker_state');
console.log("Tracker reseteado - sesión nueva en próxima carga");
```

### **Verificar Funcionamiento:**
1. Abre DevTools → Console
2. Ejecuta: `gtmSessionTrackerDebug.enableDebug()`
3. Recarga la página
4. Observa los logs del tracker

---

## 🎯 **Casos de Uso Reales**

### **E-commerce:**
```javascript
"0,10,30,60,120,300,600" // Momento de decisión de compra
```

### **Content/Blog:**
```javascript
"0,15,30,60,180,300,600,1200" // Engagement de lectura
```

### **SaaS/App:**
```javascript
"0,30,60,180,300,600,1200,1800" // Uso profundo de producto
```

### **Landing Page:**
```javascript
"0,5,10,15,30,45" // Micro-interacciones
```

---

## 💡 **Pro Tips**

1. **Cross-subdomain**: Funciona automáticamente si usas cookies
2. **Testing**: Usa modo incógnito para sesiones limpias
3. **Análisis**: Combina `tiempo_seconds` y `tiempo_minuts` en GA4 para insights completos
4. **Performance**: El script se auto-desactiva cuando completa todos los milestones

---

## 📜 **Licencia y Atribución**

### **🔒 Términos de Uso**

Este script está desarrollado por **Convertiam.com** y **Juan Carlos Díaz**. Es de **uso gratuito** bajo las siguientes condiciones:

#### ✅ **Permitido:**
- ✅ Uso comercial y personal
- ✅ Modificación del código para tus necesidades
- ✅ Redistribución (con atribución obligatoria)
- ✅ Implementación en proyectos de clientes

#### ⚠️ **Requisitos Obligatorios:**
- 🏷️ **Mantener los comentarios de atribución** en el código
- 📝 **Mencionar a Convertiam.com** en documentación del proyecto
- 🔗 **Enlazar a este repositorio** si redistribuyes
- 👨‍💻 **Crédito a Juan Carlos Díaz** como autor original

#### ❌ **Prohibido:**
- ❌ Revender el script como producto propio
- ❌ Quitar los créditos del código fuente
- ❌ Reclamar autoría del trabajo

### **📄 Atribución Requerida:**
```
GTM Session Duration Tracker V24.0
Desarrollado por Juan Carlos Díaz - Convertiam.com
Web: https://convertiam.com?utm_source=attribution&utm_medium=code_credit&utm_campaign=session_tracker_v24
Contacto: jcarlos@convertiam.com
```

---

## 🤝 **Soporte Profesional**

### **🚀 ¿Necesitas Más que un Script?**

En **[Convertiam.com](https://convertiam.com?utm_source=github&utm_medium=readme&utm_campaign=session_tracker_v24&utm_content=servicios_profesionales)** no solo creamos herramientas - construimos **ecosistemas completos de medición**:

- 🎯 **Implementación enterprise** con configuración personalizada
- 📊 **Estrategia de medición** completa para tu negocio
- 🔧 **Integración avanzada** con GA4, Adobe Analytics, mixpanel, etc.
- 📈 **Dashboard personalizados** y automatización de reportes
- 🛡️ **Auditorías de tracking** y optimización de rendimiento

### **📧 Contacto Directo:**
**Juan Carlos Díaz**  
📧 **Email:** jcarlos@convertiam.com  
🌐 **Web:** [convertiam.com](https://convertiam.com?utm_source=github&utm_medium=readme&utm_campaign=session_tracker_v24&utm_content=contacto_directo)  
💼 **LinkedIn:** [Juan Carlos Díaz - Convertiam](https://www.linkedin.com/in/juancarlosdiazsanchez/)

*"No solo instalamos el tracker - diseñamos la arquitectura de datos que impulsa tu crecimiento."*

---

## 🏢 **Sobre Convertiam**

**[Convertiam.com](https://convertiam.com?utm_source=github&utm_medium=readme&utm_campaign=session_tracker_v24&utm_content=sobre_convertiam)** es la consultora especializada en **analítica web avanzada** y **optimización de conversión** para empresas que buscan datos que realmente importen.

### **🎯 Nuestros Servicios:**
- 📊 **Implementación de tracking avanzado** (GA4, GTM, Data Studios)
- 🔍 **Auditorías técnicas** de medición y rendimiento
- 📈 **Estrategia de datos** y arquitectura de medición
- 🚀 **CRO y optimización** basada en datos
- 🎓 **Formación técnica** para equipos internos

### **💼 ¿Por Qué Elegirnos?**
- ✅ **+8 años** especializados en analítica web
- ✅ **+200 proyectos** implementados exitosamente  
- ✅ **Certificados oficiales** en todas las plataformas principales
- ✅ **Código abierto** - contribuimos a la comunidad
- ✅ **Soporte técnico** real, no bots

---

**[Convertiam.com](https://convertiam.com?utm_source=github&utm_medium=readme&utm_campaign=session_tracker_v24&utm_content=footer_branding)** - *Donde la analítica web se convierte en ventaja competitiva*

---

### 📈 **Versión V24.0 - Changelog**
- ✅ Milestones completamente configurables
- ✅ Variables específicas tiempo_seconds/tiempo_minuts  
- ✅ Detección automática segundos vs minutos
- ✅ Cross-subdomain nativo con fallbacks
- ✅ Sistema de storage resiliente
- ✅ Debugging avanzado integrado
- ✅ Compatibilidad total con versiones anteriores

---

### **⭐ ¿Te Ha Sido Útil?**

Si este script te ha ahorrado tiempo y te ha dado mejores datos:

1. ⭐ **Star** este repositorio
2. 🔄 **Comparte** con tu equipo
3. 💬 **Menciona** @convertiam en redes sociales
4. 📧 **Cuéntanos** tu caso de éxito: jcarlos@convertiam.com

**¡Tu éxito es nuestro mejor marketing!** 🚀