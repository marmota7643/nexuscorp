const OSDesigner = {
    state: {
        systems: [],     // array of created OS objects
        activeOS: null   // ID of the currently selected OS for new devices
    },
    
    config: {
        kernels: [
            { id: 'light', name: 'Ligero', qualityBonus: 0.3, description: 'Rápido pero limitado' },
            { id: 'balanced', name: 'Equilibrado', qualityBonus: 0.5, description: 'Buena compatibilidad' },
            { id: 'heavy', name: 'Completo', qualityBonus: 0.8, description: 'Máximas funciones, más lento' }
        ],
        uiStyles: [
            { id: 'minimal', name: 'Minimalista', qualityBonus: 0.4, description: 'Limpio y moderno' },
            { id: 'material', name: 'Material Design', qualityBonus: 0.6, description: 'Intuitivo y popular' },
            { id: 'skeuomorphic', name: 'Esqueumórfico', qualityBonus: 0.3, description: 'Clásico y familiar' },
            { id: 'neomorphic', name: 'Neomórfico', qualityBonus: 0.7, description: 'Moderno y elegante' }
        ],
        assistants: [
            { id: 'none', name: 'Sin asistente', qualityBonus: 0, description: 'Sin IA integrada', requires: null },
            { id: 'basic', name: 'Asistente básico', qualityBonus: 0.5, description: 'Comandos simples', requires: null },
            { id: 'advanced', name: 'IA Avanzada', qualityBonus: 1.0, description: 'Asistente inteligente', requires: 'cam_ai' }
        ],
        appStores: [
            { id: 'closed', name: 'Cerrada', qualityBonus: 0.3, description: 'Control total, menos apps' },
            { id: 'open', name: 'Abierta', qualityBonus: 0.5, description: 'Más apps, menos control' },
            { id: 'hybrid', name: 'Híbrida', qualityBonus: 0.7, description: 'Equilibrio perfecto' }
        ],
        security: [
            { id: 'basic', name: 'Básica', qualityBonus: 0.2, description: 'Protección mínima' },
            { id: 'advanced', name: 'Avanzada', qualityBonus: 0.5, description: 'Cifrado y biometría' },
            { id: 'military', name: 'Nivel militar', qualityBonus: 0.9, description: 'Máxima seguridad', requires: 'cpu_gen3' }
        ]
    },

    // Crea un nuevo sistema operativo
    // config: { name, kernel, uiStyle, assistant, appStore, security }
    createOS(osConfig) {
        const baseCost = 5000;

        // Validar requisitos de investigación (si aplica)
        const assistantDef = this.config.assistants.find(a => a.id === osConfig.assistant);
        const securityDef = this.config.security.find(s => s.id === osConfig.security);

        if (assistantDef && assistantDef.requires) {
            if (typeof Research !== 'undefined' && !Research.isCompleted(assistantDef.requires)) {
                if (typeof UI !== 'undefined') UI.notify('Requisito faltante', 'No has investigado la tecnología necesaria para este Asistente.', 'alert');
                return null;
            }
        }

        if (securityDef && securityDef.requires) {
            if (typeof Research !== 'undefined' && !Research.isCompleted(securityDef.requires)) {
                if (typeof UI !== 'undefined') UI.notify('Requisito faltante', 'No has investigado la tecnología necesaria para esta Seguridad.', 'alert');
                return null;
            }
        }

        // Deducir el coste base de creación del OS
        if (typeof Engine !== 'undefined' && !Engine.deductMoney(baseCost)) {
            if (typeof UI !== 'undefined') UI.notify('Sin fondos', `No tienes ${baseCost}$ para desarrollar el sistema operativo.`, 'alert');
            return null;
        }

        // Crear el objeto del SO
        const newOSId = 'os_' + Date.now();
        const newOS = {
            id: newOSId,
            name: osConfig.name || 'NexOS',
            kernel: osConfig.kernel,
            uiStyle: osConfig.uiStyle,
            assistant: osConfig.assistant,
            appStore: osConfig.appStore,
            security: osConfig.security,
            qualityBonus: 0,
            createdAt: new Date().toISOString().split('T')[0] // 'YYYY-MM-DD' aproximado
        };

        // Calcular el bonus total de calidad
        newOS.qualityBonus = this._calculateQualityBonus(newOS);

        this.state.systems.push(newOS);

        // Si es el primer SO, ponerlo como activo
        if (!this.state.activeOS) {
            this.state.activeOS = newOSId;
        }

        if (typeof UI !== 'undefined') {
            UI.notify('OS Desarrollado', `Has completado el desarrollo de ${newOS.name} con éxito.`, 'success');
        }

        return newOS;
    },

    // Calcula el bonus de calidad sumando todas las partes
    _calculateQualityBonus(os) {
        let total = 0;
        const kernelDef = this.config.kernels.find(k => k.id === os.kernel);
        const uiDef = this.config.uiStyles.find(u => u.id === os.uiStyle);
        const astDef = this.config.assistants.find(a => a.id === os.assistant);
        const storeDef = this.config.appStores.find(s => s.id === os.appStore);
        const secDef = this.config.security.find(s => s.id === os.security);

        if (kernelDef) total += kernelDef.qualityBonus;
        if (uiDef) total += uiDef.qualityBonus;
        if (astDef) total += astDef.qualityBonus;
        if (storeDef) total += storeDef.qualityBonus;
        if (secDef) total += secDef.qualityBonus;

        return parseFloat(total.toFixed(2));
    },

    // Obtener bonus de calidad a partir del ID del SO
    getQualityBonus(osId) {
        const os = this.state.systems.find(sys => sys.id === osId);
        if (os) {
            return os.qualityBonus;
        }
        return 0;
    },

    // Eliminar un sistema operativo
    deleteOS(osId) {
        if (this.state.activeOS === osId) {
            if (typeof UI !== 'undefined') {
                UI.notify('No se puede eliminar', 'No puedes eliminar el Sistema Operativo activo.', 'alert');
            }
            return false;
        }

        const index = this.state.systems.findIndex(sys => sys.id === osId);
        if (index !== -1) {
            const osName = this.state.systems[index].name;
            this.state.systems.splice(index, 1);
            if (typeof UI !== 'undefined') {
                UI.notify('OS Eliminado', `El sistema operativo ${osName} ha sido eliminado.`, 'info');
            }
            return true;
        }
        return false;
    },

    // Establecer como SO activo por defecto
    setActiveOS(osId) {
        const os = this.state.systems.find(sys => sys.id === osId);
        if (os) {
            this.state.activeOS = osId;
            if (typeof UI !== 'undefined') {
                UI.notify('OS Activo', `El sistema ${os.name} es ahora el predeterminado.`, 'success');
            }
            return true;
        }
        return false;
    },

    // Obtener el objeto del SO activo
    getActiveOS() {
        if (!this.state.activeOS) return null;
        return this.state.systems.find(sys => sys.id === this.state.activeOS) || null;
    }
};
