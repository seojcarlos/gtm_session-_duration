/**
 * Duración de Sesión en GTM (V21.0 - Final)
 *
 *
 * CARACTERÍSTICAS:
 * - Configurable vía Variable de GTM: Los hitos de tiempo se definen en la variable {{c_sessionMilestones}}.
 * - Notificación de Error Integrada: Si sessionStorage está bloqueado, envía un único evento
 * 'session_duration' con la etiqueta 'tracker_storage_blocked' y se desactiva.
 * - Integridad de Datos: No mezcla métricas. O mide la duración de la sesión o notifica un error.
 * - Alta Precisión: Usa timestamps para evitar la deriva de setInterval.
 * - Código Robusto y Seguro: Usa try-catch y es 100% compatible con ES5.
 * - by Juan Carlos Díaz Conveertiam.com
 */
(function() {
    var sessionDurationTracker = {
        // --- CONFIGURACIÓN ---
        // GTM reemplazará '{{c_sessionMilestones}}' por el valor de tu variable.
        // Asegúrate de que tu variable se llame c_sessionMilestones en la UI de GTM.
        config: {
            gtmVariableValue: '{{c_sessionMilestones}}',
            defaultMilestones: '0,5,15,30,60,300' // Fallback si la variable de GTM está vacía.
        },
        MILESTONES: [],

        // --- ESTADO INTERNO ---
        isDisabled: false, // El script se deshabilita si hay un error crítico.
        timer: null,
        timeWhenPaused: 0,
        nextMilestoneIndex: 0,
        storageKeys: {
            startTime: 'gtm_session_start_time',
            inactiveTime: 'gtm_session_inactive_time',
            lastMilestoneIndex: 'gtm_session_last_milestone'
        },

        // --- MÉTODOS DE INICIALIZACIÓN Y CONFIGURACIÓN ---
        generateLabel: function(seconds) {
            if (seconds < 60) {
                return seconds + '_seconds';
            }
            var minutes = Math.floor(seconds / 60);
            return minutes + '_minutes';
        },

        loadConfig: function() {
            try {
                var milestoneString = this.config.gtmVariableValue;
                // GTM puede devolver el string 'undefined' si la variable no existe.
                if (!milestoneString || milestoneString === 'undefined') {
                    milestoneString = this.config.defaultMilestones;
                }
                
                var milestoneSeconds = milestoneString.split(',').map(function(s) {
                    return parseInt(s.trim(), 10);
                });

                this.MILESTONES = milestoneSeconds
                    .filter(function(s) { return !isNaN(s); })
                    .sort(function(a, b) { return a - b; })
                    .map(function(s) {
                        return { seconds: s, label: this.generateLabel(s) };
                    }, this);

            } catch (e) {
                console.error('GTM Session Tracker: Error fatal procesando la configuración de hitos.', e);
                this.isDisabled = true; // Desactivar si la configuración es errónea.
            }
        },

        init: function() {
            this.loadConfig();
            if (this.isDisabled) return; // Detener si la configuración falló.

            // Intenta acceder a sessionStorage. Este es el punto de control principal.
            try {
                sessionStorage.setItem('gtm_storage_test', 'test');
                sessionStorage.removeItem('gtm_storage_test');
            } catch (e) {
                // FALLO CRÍTICO: El almacenamiento está bloqueado.
                this.isDisabled = true;
                console.warn('GTM Session Tracker: sessionStorage no accesible. Notificando y desactivando tracker.', e);
                // Notificar el error usando el activador existente.
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event': 'session_duration',
                    'session_duration_label': 'tracker_storage_blocked'
                });
                return; // Detener toda ejecución posterior.
            }

            // Si llegamos aquí, el almacenamiento funciona. Procedemos con la operación normal.
            this.loadState();
            this.startTimer();
            this.setupVisibilityChange();

            if (this.nextMilestoneIndex === 0) {
                this.fireMilestone(0);
            }
        },

        loadState: function() {
            var now = new Date().getTime();
            var startTime = sessionStorage.getItem(this.storageKeys.startTime);
            
            if (!startTime) {
                startTime = now;
                sessionStorage.setItem(this.storageKeys.startTime, startTime);
            }

            this.startTime = parseInt(startTime, 10);
            this.inactiveTime = parseInt(sessionStorage.getItem(this.storageKeys.inactiveTime) || '0', 10);
            this.nextMilestoneIndex = parseInt(sessionStorage.getItem(this.storageKeys.lastMilestoneIndex) || '0', 10);
        },

        // --- MÉTODOS DE OPERACIÓN ---
        startTimer: function() {
            if (this.timer || this.isDisabled) return;
            var self = this;
            this.timer = setInterval(function() {
                self.checkMilestones();
            }, 1000);
        },

        stopTimer: function() {
            clearInterval(this.timer);
            this.timer = null;
        },

        checkMilestones: function() {
            if (this.isDisabled) {
                this.stopTimer();
                return;
            }
            var activeTime = Math.floor((new Date().getTime() - this.startTime - this.inactiveTime) / 1000);
            var nextMilestone = this.MILESTONES[this.nextMilestoneIndex];

            if (nextMilestone && activeTime >= nextMilestone.seconds) {
                this.fireMilestone(this.nextMilestoneIndex);
            }
        },

        fireMilestone: function(milestoneIndex) {
            var milestone = this.MILESTONES[milestoneIndex];
            if (!milestone) {
                this.stopTimer();
                return;
            }

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'session_duration',
                'session_duration_label': milestone.label,
                'session_duration_seconds': milestone.seconds
            });

            this.nextMilestoneIndex = milestoneIndex + 1;
            sessionStorage.setItem(this.storageKeys.lastMilestoneIndex, this.nextMilestoneIndex.toString());
        },

        setupVisibilityChange: function() {
            if (this.isDisabled) return;
            var self = this;
            document.addEventListener("visibilitychange", function() {
                if (self.isDisabled) return;
                if (document.hidden) {
                    self.stopTimer();
                    self.timeWhenPaused = new Date().getTime();
                } else {
                    if (self.timeWhenPaused > 0) {
                        var elapsedWhileHidden = new Date().getTime() - self.timeWhenPaused;
                        self.inactiveTime += elapsedWhileHidden;
                        sessionStorage.setItem(self.storageKeys.inactiveTime, self.inactiveTime.toString());
                        self.timeWhenPaused = 0;
                    }
                    self.startTimer();
                }
            });
        }
    };

    // --- PUNTO DE ENTRADA ---
    // Envolvemos la ejecución en una función anónima y un try-catch final como red de seguridad.
    try {
        sessionDurationTracker.init();
    } catch (e) {
        console.error('GTM Session Tracker: Error fatal inesperado durante la inicialización.', e);
    }
})();