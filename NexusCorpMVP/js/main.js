// main.js - Inicializador del Juego

document.addEventListener('DOMContentLoaded', () => {
    LocalSave.init();
    UI.init();
    const restored = LocalSave.load();
    if (typeof Research !== 'undefined' && Research.init) Research.init();
    if (typeof SupplyChain !== 'undefined' && SupplyChain.init) SupplyChain.init();
    if (typeof Corporate !== 'undefined' && Corporate.init) Corporate.init();
    if (typeof ManufacturingIntegration !== 'undefined' && ManufacturingIntegration.init) ManufacturingIntegration.init();
    UI.updateAll();
    Engine.init();
    if (typeof CloudSync !== 'undefined' && CloudSync.init) CloudSync.init();
    try {
        const ownerData = JSON.parse(localStorage.getItem(LocalSave.ownerKey) || '{}');
        if (ownerData.role === 'admin') {
            const adminNavBtn = document.getElementById('btn-nav-admin');
            if (adminNavBtn) adminNavBtn.style.display = 'flex';
            if (localStorage.getItem('nexuscorp_admin_active') === 'true') {
                const adminPowers = document.getElementById('admin-powers');
                if (adminPowers) adminPowers.classList.remove('hidden');
                const ownerBadge = document.getElementById('owner-badge');
                if (ownerBadge) ownerBadge.textContent = 'ADMIN ◆';
            }
        }
    } catch (e) {}
    const params = new URLSearchParams(window.location.search);
    const panelParam = params.get('panel');
    if (panelParam && document.querySelector(`[data-target="panel-${panelParam}"]`)) {
        UI.openPanel(`panel-${panelParam}`, document.querySelector(`[data-target="panel-${panelParam}"]`));
    }
    UI.notify(restored ? '🎮 Partida Restaurada' : '🏢 Nueva Empresa', restored ? 'Tu imperio tecnológico continúa.' : 'Bienvenido a NexusCorp. ¡Construye tu imperio!', 'success');
    window.addEventListener('beforeunload', () => LocalSave.save());
});
