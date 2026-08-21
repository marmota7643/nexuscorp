// local-save.js — Gestión del guardado y restauración local de la partida en NexusCorp
const LocalSave = {
    key: 'nexuscorp_local_tycoon_v3',
    ownerKey: 'nexuscorp_local_owner',

    // Inicializa la configuración de propiedad local asegurando el rol por defecto
    init() {
        if (!localStorage.getItem(this.ownerKey)) {
            localStorage.setItem(this.ownerKey, JSON.stringify({ role: 'player', createdAt: new Date().toISOString() }));
        }
    },

    // Genera una instantánea completa del estado actual de todos los módulos del juego
    snapshot() {
        if (typeof Engine === 'undefined' || typeof ManuCore === 'undefined') return null;
        const state = {
            version: 3,
            savedAt: new Date().toISOString(),
            engine: {
                money: Engine.state.money,
                reputation: Engine.state.reputation,
                monthlyIncome: Engine.state.monthlyIncome,
                currentDate: Engine.state.currentDate.toISOString(),
                debt: Engine.state.debt,
                customInterest: Engine.state.customInterest,
                companyName: Engine.state.companyName,
                marketDemand: Engine.state.marketDemand,
                marketTrend: Engine.state.marketTrend,
                cloudRevision: Engine.state.cloudRevision || 0,
                sandboxMode: Engine.state.sandboxMode || false,
                companyValuation: Engine.state.companyValuation || 100000,
                publicShares: Engine.state.publicShares || 0,
                isPublic: Engine.state.isPublic || false,
                achievedMilestones: Engine.state.achievedMilestones || []
            }
        };
        if (typeof TechStart !== 'undefined') state.techStart = TechStart.state;
        state.manuCore = ManuCore.state;
        if (typeof Research !== 'undefined') state.research = Research.state;
        if (typeof OSDesigner !== 'undefined') state.osDesigner = OSDesigner.state;
        if (typeof HR !== 'undefined') state.hr = HR.state;
        if (typeof Marketing !== 'undefined') state.marketing = Marketing.state;
        if (typeof Rivals !== 'undefined') state.rivals = Rivals.state;
        return state;
    },

    // Guarda el estado actual en LocalStorage y programa sincronización en la nube si está disponible
    save() {
        const payload = this.snapshot();
        if (!payload) return;
        try {
            localStorage.setItem(this.key, JSON.stringify(payload));
        } catch (e) {
            console.warn('Error al guardar:', e);
        }
        if (typeof CloudSync !== 'undefined' && CloudSync.scheduleSync) CloudSync.scheduleSync(payload);
    },

    // Restaura todos los módulos del juego a partir de los datos almacenados
    load() {
        try {
            const raw = localStorage.getItem(this.key);
            if (!raw) return false;
            const data = JSON.parse(raw);
            if (!data.engine) return false;
            
            // Restaurar estado principal del motor
            Object.assign(Engine.state, data.engine, { currentDate: new Date(data.engine.currentDate) });
            
            // Restaurar todos los subsistemas con validación de seguridad contra nulos
            if (data.techStart && typeof TechStart !== 'undefined') Object.assign(TechStart.state, data.techStart);
            if (data.manuCore && typeof ManuCore !== 'undefined') Object.assign(ManuCore.state, data.manuCore);
            if (data.research && typeof Research !== 'undefined') Object.assign(Research.state, data.research);
            if (data.osDesigner && typeof OSDesigner !== 'undefined') Object.assign(OSDesigner.state, data.osDesigner);
            if (data.hr && typeof HR !== 'undefined') Object.assign(HR.state, data.hr);
            if (data.marketing && typeof Marketing !== 'undefined') Object.assign(Marketing.state, data.marketing);
            if (data.rivals && typeof Rivals !== 'undefined') Object.assign(Rivals.state, data.rivals);
            
            return true;
        } catch (error) {
            console.warn('No se pudo restaurar la partida local:', error);
            return false;
        }
    },

    // Reinicia la partida local y limpia credenciales temporales
    reset() {
        localStorage.removeItem(this.key);
        localStorage.removeItem('nexuscorp_admin_active');
        window.location.reload();
    }
};
