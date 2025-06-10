
/**
 * Duración de Sesión en GTM (V15.0) - Modificado para intervalos exponenciales por convertiam.com
 * Modificado para incluir intervalos de tiempo específicos (0, 5s, 15s, 30s, 1m, 2m, 3m, 4m, 5m, 10m, 15m, 20m, 25m).
 * Utilizando sessionStorage para rastrear eventos sin duplicación, con ajustes de intervalo dinámicos para una única sesión.
 */
var sessionDuration = {
    init: function() {
        this.durationSeconds = this.getExistingDuration();
        this.lastLabelFired = this.getExistingLastLabel();
        this.setupInterval();
        this.setupVisibilityChange();
        if (this.durationSeconds === 0 && this.lastLabelFired === '') {
            this.pushDataLayer(0); 
        }
    },

    getExistingDuration: function() {
        var existingDuration = parseInt(sessionStorage.getItem('convertiam_session_duration'), 10);
        return !isNaN(existingDuration) ? existingDuration : 0;
    },

    getExistingLastLabel: function() {
        return sessionStorage.getItem('convertiam_last_label_fired') || '';
    },

    setupInterval: function() {
        this.calculateInterval();
        this.startInterval();
    },

    calculateInterval: function() {
        var minutes = Math.floor(this.durationSeconds / 60);
        if (minutes < 1) this.interval = 5000; // Cada 5 segundos durante el primer minuto
        else if (minutes < 5) this.interval = 30000; // Cada 30 segundos hasta 5 minutos
        else if (minutes < 15) this.interval = 60000; // Cada 60 segundos hasta 15 minutos
        else this.interval = 300000; // Cada 5 minutos después de 15 minutos
    },

    startInterval: function() {
        var self = this;
        this.intervalInstance = setInterval(function() {
            self.durationSeconds += self.interval / 1000;
            sessionStorage.setItem('convertiam_session_duration', self.durationSeconds.toString());
            self.calculateInterval(); // Recalcular el intervalo en cada tick
            var currentLabel = self.getLabel(self.durationSeconds);
            if (currentLabel !== self.lastLabelFired) {
                self.pushDataLayer(self.durationSeconds);
                self.lastLabelFired = currentLabel;
                sessionStorage.setItem('convertiam_last_label_fired', currentLabel);
            }
        }, this.interval);
    },

    stopInterval: function() {
        if (this.intervalInstance) {
            clearInterval(this.intervalInstance);
            this.intervalInstance = null;
        }
    },

    setupVisibilityChange: function() {
        var self = this;
        document.addEventListener("visibilitychange", function() {
            if (document.hidden) {
                self.stopInterval();
            } else if (!sessionStorage.getItem('convertiam_last_label_fired')) {
                self.startInterval();  // Reinicia el intervalo si la página se hace visible y no hay etiqueta previa
            }
        });
    },

    getLabel: function(seconds) {
        var minutes = Math.floor(seconds / 60);
        if (seconds < 5) return '0_seconds';
        else if (seconds < 15) return '5_seconds';        git add .
        else if (seconds < 30) return '15_seconds';
        else if (seconds < 60) return '30_seconds';
        else if (minutes < 2) return '1_minute';
        else if (minutes < 3) return '2_minutes';
        else if (minutes < 4) return '3_minutes';
        else if (minutes < 5) return '4_minutes';
        else if (minutes < 10) return '5_minutes';
        else if (minutes < 15) return '10_minutes';
        else if (minutes < 20) return '15_minutes';
        else if (minutes < 25) return '20_minutes';
        else return '25_minutes';
    },

    pushDataLayer: function(seconds) {
        var label = this.getLabel(seconds);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'session_duration',
            'session_duration_label': label
        });
        sessionStorage.setItem('convertiam_last_label_fired', label); // Actualizar la última etiqueta disparada
    }
};

sessionDuration.init();

