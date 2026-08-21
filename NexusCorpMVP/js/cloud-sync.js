// cloud-sync.js — Sincronización anónima de partidas y consola web de administración.
const CloudSync = {
    deviceKey: 'nexuscorp_device_id', tokenKey: 'nexuscorp_admin_token', selectedCompanyId: null, timer: null, companies: [],
    get config() { return window.NEXUS_CLOUD_CONFIG || { enabled: false }; },
    get enabled() { return Boolean(this.config.enabled && this.config.endpoint && !this.config.endpoint.includes('TU-PROYECTO')); },
    get deviceId() {
        let id = localStorage.getItem(this.deviceKey);
        if (!id) { id = crypto.randomUUID(); localStorage.setItem(this.deviceKey, id); }
        return id;
    },
    get token() { return localStorage.getItem(this.tokenKey) || ''; },
    async request(action, body = {}, admin = false) {
        if (!this.enabled) throw new Error('La nube no está configurada.');
        const response = await fetch(this.config.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(admin ? { 'X-Nexus-Admin': this.token } : {}) }, body: JSON.stringify({ action, deviceId: this.deviceId, ...body }) });
        const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || 'No se pudo contactar al servidor.'); return data;
    },
    init() {
        UI.setAdminCloudState(this.enabled ? 'Conectando modo híbrido…' : 'Modo local: configura el servidor para administrar todas las empresas.', false);
        if (!this.enabled) return;
        this.sendSnapshot(LocalSave.snapshot()).catch(() => {});
        if (this.token) this.refreshAdmin().catch(() => { localStorage.removeItem(this.tokenKey); UI.setAdminCloudState('La autorización web expiró. Actívala de nuevo.', false); });
    },
    scheduleSync(payload) {
        if (!this.enabled) return;
        clearTimeout(this.timer); this.timer = setTimeout(() => this.sendSnapshot(payload).catch(error => console.warn('Sincronización pendiente:', error.message)), 1200);
    },
    async sendSnapshot(payload) {
        const data = await this.request('sync', { companyName: Engine.state.companyName, save: payload, revision: Engine.state.cloudRevision || 0 });
        if (data.force && data.save) this.applyRemoteSave(data.save, data.revision);
        else if (Number.isInteger(data.revision)) Engine.state.cloudRevision = data.revision;
    },
    applyRemoteSave(save, revision) {
        if (!save?.engine) return;
        Object.assign(Engine.state, save.engine, { currentDate: new Date(save.engine.currentDate), cloudRevision: revision });
        Object.assign(TechStart.state, save.techStart || {}); Object.assign(ManuCore.state, save.manuCore || {});
        UI.updateAll(); LocalSave.save(); UI.notify('Mandato del administrador', 'Tu empresa fue actualizada desde la consola web.', 'alert');
    },
    async unlockAdmin(passphrase) {
        if (!passphrase) return UI.notify('Consola web', 'Introduce tu clave de administrador.', 'alert');
        try {
            const data = await this.request('admin-login', { passphrase }); localStorage.setItem(this.tokenKey, data.token); document.getElementById('admin-passphrase').value = '';
            await this.refreshAdmin(); UI.notify('Poderes web activos', 'Esta instalación quedó vinculada como administrador.', 'success');
        } catch (error) { UI.notify('Acceso denegado', error.message, 'alert'); }
    },
    async refreshAdmin() {
        const data = await this.request('admin-list', {}, true); this.companies = data.companies || []; UI.setAdminCloudState(`Administrador web activo · ${this.companies.length} empresas sincronizadas.`, true); UI.renderAdminCompanies(this.companies, this.selectedCompanyId);
    },
    selectCompany(id) { this.selectedCompanyId = id; const company = this.companies.find(item => item.id === id); UI.renderAdminCompanies(this.companies, id); UI.setSelectedCompany(company); },
    async applyAdminUpdate() {
        if (!this.selectedCompanyId) return UI.notify('Consola web', 'Selecciona una empresa primero.', 'alert');
        const money = document.getElementById('admin-money').value; const reputation = document.getElementById('admin-reputation').value;
        if (money === '' && reputation === '') return UI.notify('Consola web', 'Indica al menos un valor para modificar.', 'alert');
        try { await this.request('admin-update', { corporationId: this.selectedCompanyId, money: money === '' ? undefined : Number(money), reputation: reputation === '' ? undefined : Number(reputation) }, true); await this.refreshAdmin(); UI.notify('Poder aplicado', 'La empresa fue actualizada en la nube.', 'success'); }
        catch (error) { UI.notify('No se pudo aplicar', error.message, 'alert'); }
    }
};
