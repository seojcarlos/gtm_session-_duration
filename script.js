/**
 * Duración de Sesión en GTM (V24.0 - Milestones Configurables)
 *
 * Script profesional para el seguimiento unificado de la duración de la sesión a través de múltiples subdominios.
 *
 * CARACTERÍSTICAS V24.0:
 * - Milestones completamente configurables
 * - Detección automática de segundos vs minutos
 * - Variables de dataLayer específicas: tiempo_seconds / tiempo_minuts
 * - Soporte Cross-Subdomain: Utiliza cookies de origen para mantener el estado de la sesión al navegar entre subdominios.
 * - Sistema de Fallback: localStorage/sessionStorage cuando cookies no están disponibles (modo incógnito, extensiones).
 * - Detección automática de capacidades de storage y modo incógnito.
 * - Validación robusta de estado y expiración automática de sesiones antiguas.
 * - Debugging integrado configurable para troubleshooting.
 * - Compatibilidad mejorada cross-browser con prefijos vendor.
 *
 * CONFIGURACIÓN DE MILESTONES:
 * Puedes configurar cualquier combinación de segundos y minutos:
 * - Segundos: 0,5,10,15,30,45
 * - Minutos: 60,120,180,300,600,900,1200,1500,1800 (1,2,3,5,10,15,20,25,30 min)
 * - Mixto: 0,5,15,30,60,120,300,600,1200,1800
 *
 * Realizado por CONVERTIAM.COM By Juan Carlos Díaz
 * Contacto: jcarlos@convertiam.com | ¿Necesitas ayuda? ¡Escríbeme!
 */
(function() {
    var sessionDurationTracker = {
        // --- CONFIGURACIÓN ---
        config: {
            gtmVariableValue: '{{c_sessionMilestones}}',
            // Configuración por defecto con segundos y minutos
            defaultMilestones: '0,5,15,30,60,120,180,240,300,600,900,1200,1500,1800', // 0,5,15,30s + 1,2,3,4,5,10,15,20,25,30min
            cookieName: 'gtm_session_tracker_state',
            maxSessionAge: 24 * 60 * 60 * 1000, // 24 horas máximo para considerar sesión válida
            debugMode: false // Para activar logs de debugging
        },
        MILESTONES: [],
        // --- ESTADO INTERNO ---
        isDisabled: false,
        timer: null,
        timeWhenPaused: 0,
        nextMilestoneIndex: 0,
        storageMethod: 'cookies', // cookies, localStorage, sessionStorage o memory
        memoryState: null, // Fallback para modo memoria
        // El estado ahora se gestiona en un solo objeto para guardarlo en la cookie.
        state: {
            startTime: 0,
            inactiveTime: 0,
            lastMilestoneIndex: 0,
            version: 'V24.0'
        },

        // --- MÉTODOS DE UTILIDAD ---
        log: function(message, type) {
            if (!this.config.debugMode && type !== 'error') return;
            var prefix = 'GTM Session Tracker V24.0: ';
            if (type === 'error') {
                console.error(prefix + message);
            } else if (type === 'warn') {
                console.warn(prefix + message);
            } else {
                console.log(prefix + message);
            }
        },

        detectStorageCapabilities: function() {
            var capabilities = {
                cookies: false,
                localStorage: false,
                sessionStorage: false
            };
            
            // Test cookies
            try {
                document.cookie = "gtm_test=1; path=/";
                capabilities.cookies = document.cookie.indexOf("gtm_test=1") !== -1;
                document.cookie = "gtm_test=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            } catch(e) {
                capabilities.cookies = false;
            }
            
            // Test localStorage  
            try {
                localStorage.setItem('gtm_test', '1');
                localStorage.removeItem('gtm_test');
                capabilities.localStorage = true;
            } catch(e) {
                capabilities.localStorage = false;
            }
            
            // Test sessionStorage
            try {
                sessionStorage.setItem('gtm_test', '1');
                sessionStorage.removeItem('gtm_test');
                capabilities.sessionStorage = true;
            } catch(e) {
                capabilities.sessionStorage = false;
            }
            
            return capabilities;
        },

        initStorageMethod: function() {
            var capabilities = this.detectStorageCapabilities();
            
            if (capabilities.cookies) {
                this.storageMethod = 'cookies';
                this.log('Usando cookies para almacenamiento cross-subdomain');
            } else if (capabilities.localStorage) {
                this.storageMethod = 'localStorage';
                this.log('Cookies no disponibles, usando localStorage (sin cross-subdomain)', 'warn');
            } else if (capabilities.sessionStorage) {
                this.storageMethod = 'sessionStorage';
                this.log('Solo sessionStorage disponible, sesión limitada a pestaña actual', 'warn');
            } else {
                this.storageMethod = 'memory';
                this.log('Sin storage persistente, funcionalidad limitada a página actual', 'warn');
            }
        },

        getRootDomain: function() {
            var hostname = window.location.hostname;
            
            // Casos especiales para localhost e IPs
            if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
                return hostname;
            }
            
            var parts = hostname.split('.');
            if (parts.length <= 2) {
                return hostname;
            }
            return parts.slice(-2).join('.');
        },
        
        // --- MÉTODOS DE ALMACENAMIENTO UNIFICADOS ---
        setSessionState: function(value) {
            try {
                switch(this.storageMethod) {
                    case 'cookies':
                        this.setSessionCookie(value);
                        break;
                    case 'localStorage':
                        localStorage.setItem(this.config.cookieName, JSON.stringify(value));
                        break;
                    case 'sessionStorage':
                        sessionStorage.setItem(this.config.cookieName, JSON.stringify(value));
                        break;
                    case 'memory':
                        this.memoryState = value;
                        break;
                }
            } catch(e) {
                this.log("Error guardando estado: " + e.message, 'error');
                // Fallback a memoria
                this.memoryState = value;
                this.storageMethod = 'memory';
            }
        },

        getSessionState: function() {
            try {
                switch(this.storageMethod) {
                    case 'cookies':
                        return this.getSessionCookie();
                    case 'localStorage':
                        var stored = localStorage.getItem(this.config.cookieName);
                        return stored ? JSON.parse(stored) : null;
                    case 'sessionStorage':
                        var stored = sessionStorage.getItem(this.config.cookieName);
                        return stored ? JSON.parse(stored) : null;
                    case 'memory':
                        return this.memoryState;
                }
            } catch(e) {
                this.log("Error leyendo estado: " + e.message, 'error');
                return null;
            }
            return null;
        },

        setSessionCookie: function(value) {
            try {
                var cookieValue = JSON.stringify(value);
                var rootDomain = this.getRootDomain();
                
                // Intentar con dominio específico primero
                document.cookie = this.config.cookieName + "=" + cookieValue + "; path=/; domain=" + rootDomain;
                
                // Verificar que se guardó correctamente
                var testRead = this.getSessionCookie();
                if (!testRead || testRead.startTime !== value.startTime) {
                    // Fallback sin especificar dominio
                    document.cookie = this.config.cookieName + "=" + cookieValue + "; path=/";
                    this.log('Fallback a cookie sin dominio específico', 'warn');
                }
                
            } catch(e) {
                this.log("Error al escribir la cookie: " + e.message, 'error');
                throw e;
            }
        },

        getSessionCookie: function() {
            try {
                var nameEQ = this.config.cookieName + "=";
                var ca = document.cookie.split(';');
                for(var i=0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0)==' ') c = c.substring(1,c.length);
                    if (c.indexOf(nameEQ) == 0) {
                        var value = c.substring(nameEQ.length,c.length);
                        var parsed = JSON.parse(value);
                        
                        // Validar estructura básica del estado
                        if (parsed && typeof parsed.startTime === 'number' && parsed.startTime > 0) {
                            return parsed;
                        } else {
                            this.log('Estado de cookie inválido, se reiniciará la sesión', 'warn');
                            return null;
                        }
                    }
                }
            } catch (e) {
                this.log("Error al leer o parsear la cookie: " + e.message, 'error');
                return null;
            }
            return null;
        },

        isValidSession: function(storedState, currentTime) {
            if (!storedState || !storedState.startTime) {
                return false;
            }
            
            // Verificar que la sesión no sea demasiado antigua
            var sessionAge = currentTime - storedState.startTime;
            if (sessionAge > this.config.maxSessionAge) {
                this.log('Sesión expirada por antigüedad, iniciando nueva sesión');
                return false;
            }
            
            return true;
        },

        // --- NUEVA LÓGICA PARA DETECTAR SEGUNDOS VS MINUTOS ---
        getMilestoneType: function(seconds) {
            return seconds < 60 ? 'seconds' : 'minutes';
        },

        getMilestoneValue: function(seconds) {
            if (seconds < 60) {
                return seconds; // Para segundos, devolver el valor directo
            } else {
                return Math.round(seconds / 60); // Para minutos, convertir y redondear
            }
        },

        generateMilestoneData: function(seconds) {
            var type = this.getMilestoneType(seconds);
            var value = this.getMilestoneValue(seconds);
            
            if (seconds === 0) {
                return {
                    type: 'special',
                    value: 0,
                    label: 'page_load',
                    dataLayerEvent: 'session_duration',
                    dataLayerVariable: 'tiempo_seconds',
                    dataLayerValue: 0
                };
            }
            
            var label, dataLayerVariable;
            
            if (type === 'seconds') {
                label = value + '_seconds';
                dataLayerVariable = 'tiempo_seconds';
            } else {
                label = value + '_minutes';
                dataLayerVariable = 'tiempo_minuts'; // Mantener el nombre original sin 'e'
            }
            
            return {
                type: type,
                value: value,
                label: label,
                seconds: seconds,
                dataLayerEvent: 'session_duration',
                dataLayerVariable: dataLayerVariable,
                dataLayerValue: value
            };
        },

        // --- LÓGICA PRINCIPAL (MEJORADA PARA MILESTONES CONFIGURABLES) ---
        init: function() {
            this.log('Inicializando Session Duration Tracker V24.0');
            
            // Inicializar método de almacenamiento
            this.initStorageMethod();
            
            this.loadConfig();
            if (this.isDisabled) return;
           
            this.loadState();
            this.startTimer();
            this.setupVisibilityChange();

            if (this.state.lastMilestoneIndex === 0) {
                this.fireMilestone(0);
            }
            
            this.log('Tracker inicializado correctamente con ' + this.MILESTONES.length + ' milestones configurados');
        },

        loadState: function() {
            var now = new Date().getTime();
            var storedState = this.getSessionState();

            if (storedState && this.isValidSession(storedState, now)) {
                this.state = storedState;
                this.log('Estado de sesión existente cargado');
            } else {
                // Es una nueva sesión (o la cookie no existía/era inválida)
                this.state.startTime = now;
                this.state.inactiveTime = 0;
                this.state.lastMilestoneIndex = 0;
                this.state.version = 'V24.0';
                this.log('Nueva sesión iniciada');
            }
        },

        fireMilestone: function(milestoneIndex) {
            var milestone = this.MILESTONES[milestoneIndex];
            if (!milestone) {
                this.stopTimer();
                this.log('Todos los milestones completados');
                return;
            }
            
            window.dataLayer = window.dataLayer || [];
            
            // Crear objeto base del dataLayer
            var dataLayerObject = {
                'event': milestone.dataLayerEvent
            };
            
            // Agregar la variable específica según el tipo
            dataLayerObject[milestone.dataLayerVariable] = milestone.dataLayerValue;
            
            // Agregar información adicional para debugging
            dataLayerObject['session_duration_label'] = milestone.label;
            dataLayerObject['session_duration_seconds'] = milestone.seconds;
            dataLayerObject['session_storage_method'] = this.storageMethod;
            dataLayerObject['session_cross_subdomain'] = this.storageMethod === 'cookies';
            dataLayerObject['session_tracker_version'] = 'V24.0';
            dataLayerObject['milestone_type'] = milestone.type;
            
            window.dataLayer.push(dataLayerObject);
            
            this.log('Milestone disparado: ' + milestone.label + ' (' + milestone.seconds + 's) - Variable: ' + milestone.dataLayerVariable + ' = ' + milestone.dataLayerValue);
            
            // Guardar el nuevo estado
            this.state.lastMilestoneIndex = milestoneIndex + 1;
            this.setSessionState(this.state);
        },

        setupVisibilityChange: function() {
            if (this.isDisabled) return;
            var self = this;
            
            // Usar el evento más compatible
            var visibilityEvent = 'visibilitychange';
            if (typeof document.hidden === "undefined") {
                if (typeof document.webkitHidden !== "undefined") {
                    visibilityEvent = 'webkitvisibilitychange';
                } else if (typeof document.mozHidden !== "undefined") {
                    visibilityEvent = 'mozvisibilitychange';
                } else if (typeof document.msHidden !== "undefined") {
                    visibilityEvent = 'msvisibilitychange';
                }
            }
            
            document.addEventListener(visibilityEvent, function() {
                if (self.isDisabled) return;
                
                var isHidden = document.hidden !== undefined ? document.hidden : 
                              document.webkitHidden !== undefined ? document.webkitHidden :
                              document.mozHidden !== undefined ? document.mozHidden :
                              document.msHidden !== undefined ? document.msHidden : false;
                
                if (isHidden) {
                    self.stopTimer();
                    self.timeWhenPaused = new Date().getTime();
                    self.log('Página oculta, pausando timer');
                } else {
                    if (self.timeWhenPaused > 0) {
                        var elapsedWhileHidden = new Date().getTime() - self.timeWhenPaused;
                        self.state.inactiveTime += elapsedWhileHidden;
                        self.setSessionState(self.state); 
                        self.timeWhenPaused = 0;
                        self.log('Página visible, agregado tiempo inactivo: ' + Math.round(elapsedWhileHidden/1000) + 's');
                    }
                    self.startTimer();
                }
            });
        },
        
        loadConfig: function() {
            try {
                var milestoneString = this.config.gtmVariableValue;
                if (!milestoneString || milestoneString === 'undefined' || milestoneString === '{{c_sessionMilestones}}') {
                    milestoneString = this.config.defaultMilestones;
                    this.log('Usando milestones por defecto: ' + milestoneString);
                }
                
                var milestoneSeconds = milestoneString.split(',').map(function(s) { return parseInt(s.trim(), 10); });
                var validMilestones = milestoneSeconds.filter(function(s) { return !isNaN(s) && s >= 0; });
                
                if (validMilestones.length === 0) {
                    throw new Error('No se encontraron milestones válidos');
                }
                
                // Ordenar milestones y generar datos completos
                var sortedMilestones = validMilestones.sort(function(a, b) { return a - b; });
                this.MILESTONES = sortedMilestones.map(function(seconds) { 
                    return this.generateMilestoneData(seconds);
                }, this);
                
                this.log('Configuración cargada: ' + this.MILESTONES.length + ' milestones');
                this.log('Milestones configurados:', this.MILESTONES.map(function(m) { 
                    return m.label + ' (' + m.dataLayerVariable + '=' + m.dataLayerValue + ')'; 
                }).join(', '));
                
            } catch (e) {
                this.log('Error fatal procesando la configuración de hitos: ' + e.message, 'error');
                this.isDisabled = true;
            }
        },
        
        startTimer: function() {
            if (this.timer || this.isDisabled) return;
            var self = this;
            this.timer = setInterval(function() { self.checkMilestones(); }, 1000);
        },
        
        stopTimer: function() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        },
        
        checkMilestones: function() {
            if (this.isDisabled) { 
                this.stopTimer(); 
                return; 
            }
            
            try {
                var activeTime = Math.floor((new Date().getTime() - this.state.startTime - this.state.inactiveTime) / 1000);
                var nextMilestone = this.MILESTONES[this.state.lastMilestoneIndex];
                
                if (nextMilestone && activeTime >= nextMilestone.seconds) {
                    this.fireMilestone(this.state.lastMilestoneIndex);
                }
            } catch(e) {
                this.log('Error verificando milestones: ' + e.message, 'error');
            }
        },

        // --- MÉTODO PÚBLICO PARA DEBUGGING ---
        getSessionInfo: function() {
            if (this.isDisabled) return null;
            
            var now = new Date().getTime();
            var totalTime = now - this.state.startTime;
            var activeTime = totalTime - this.state.inactiveTime;
            
            return {
                version: 'V24.0',
                storageMethod: this.storageMethod,
                totalTime: Math.floor(totalTime / 1000),
                activeTime: Math.floor(activeTime / 1000),
                inactiveTime: Math.floor(this.state.inactiveTime / 1000),
                milestonesReached: this.state.lastMilestoneIndex,
                nextMilestone: this.MILESTONES[this.state.lastMilestoneIndex] ? this.MILESTONES[this.state.lastMilestoneIndex] : null,
                crossSubdomain: this.storageMethod === 'cookies',
                allMilestones: this.MILESTONES.map(function(m) {
                    return {
                        label: m.label,
                        seconds: m.seconds,
                        variable: m.dataLayerVariable,
                        value: m.dataLayerValue
                    };
                })
            };
        }
    };
    
    try {
        sessionDurationTracker.init();
        
        // Exponer métodos para debugging (opcional)
        if (typeof window !== 'undefined') {
            window.gtmSessionTrackerDebug = {
                getInfo: function() { return sessionDurationTracker.getSessionInfo(); },
                enableDebug: function() { 
                    sessionDurationTracker.config.debugMode = true; 
                    sessionDurationTracker.log('Debug mode habilitado - Tracker V24.0');
                },
                disableDebug: function() { 
                    sessionDurationTracker.config.debugMode = false; 
                },
                getMilestones: function() {
                    return sessionDurationTracker.MILESTONES.map(function(m) {
                        return {
                            label: m.label,
                            seconds: m.seconds,
                            variable: m.dataLayerVariable,
                            value: m.dataLayerValue,
                            type: m.type
                        };
                    });
                }
            };
        }
        
    } catch (e) {
        console.error('GTM Session Tracker V24.0: Error fatal inesperado durante la inicialización.', e);
    }
})();