// main.js - Inicializador del Juego

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar almacenamiento
    LocalSave.init();
    
    // 2. Inicializar UI (almacena elementos, vincula eventos)
    UI.init();
    
    // 3. Cargar juego guardado
    const restored = LocalSave.load();
    
    // 4. Inicializar módulos que necesitan carga posterior
    if (typeof Research !== 'undefined' && Research.init) Research.init();
    
    // 5. Actualizar toda la UI
    UI.updateAll();
    
    // 6. Iniciar bucle del juego
    Engine.init();
    
    // 7. Sincronización en la nube
    if (typeof CloudSync !== 'undefined' && CloudSync.init) CloudSync.init();
    
    // 8. Chequeo de admin - mostrar navegación si fue desbloqueado previamente
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
    
    // 9. Abrir panel por parámetro de URL
    const params = new URLSearchParams(window.location.search);
    const panelParam = params.get('panel');
    if (panelParam && document.querySelector(`[data-target="panel-${panelParam}"]`)) {
        UI.openPanel(`panel-${panelParam}`, document.querySelector(`[data-target="panel-${panelParam}"]`));
    }
    
    // 10. Mensaje de bienvenida
    UI.notify(
        restored ? '🎮 Partida Restaurada' : '🏢 Nueva Empresa',
        restored ? 'Tu imperio tecnológico continúa.' : 'Bienvenido a NexusCorp. ¡Construye tu imperio!',
        'success'
    );
    
    // 11. Autoguardado al salir
    window.addEventListener('beforeunload', () => LocalSave.save());
});
