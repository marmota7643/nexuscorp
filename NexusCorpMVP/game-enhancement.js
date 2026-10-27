(() => {
  'use strict';

  const KEY = 'nexuscorp_session_v2';
  const LEGACY_KEY = 'nexuscorp_session_v1';
  const MAX_NOTIFICATIONS = 30;
  const state = {
    version: 2,
    lastSave: 0,
    notifications: [],
    settings: { reducedMotion: false }
  };
  let saveTimer = 0;
  let toastHost = null;

  const safeRead = (key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const value = JSON.parse(raw);
      return value && typeof value === 'object' ? value : null;
    } catch (error) {
      console.warn('[NexusCorp] No se pudo leer el guardado local.', error);
      return null;
    }
  };

  const load = () => {
    const saved = safeRead(KEY) || safeRead(LEGACY_KEY);
    if (!saved) return state;
    if (Array.isArray(saved.notifications)) {
      state.notifications = saved.notifications
        .filter(n => n && typeof n.title === 'string' && typeof n.message === 'string')
        .slice(0, MAX_NOTIFICATIONS);
    }
    if (Number.isFinite(saved.lastSave)) state.lastSave = saved.lastSave;
    if (saved.settings && typeof saved.settings === 'object') {
      state.settings.reducedMotion = Boolean(saved.settings.reducedMotion);
    }
    return state;
  };

  const save = () => {
    try {
      state.lastSave = Date.now();
      localStorage.setItem(KEY, JSON.stringify(state));
      document.documentElement.dataset.nexusSave = 'ok';
      return true;
    } catch (error) {
      document.documentElement.dataset.nexusSave = 'error';
      console.warn('[NexusCorp] El navegador no permitió guardar la sesión.', error);
      return false;
    }
  };

  const scheduleSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = 0;
      save();
    }, 180);
  };

  const ensureStyles = () => {
    if (document.getElementById('nexus-enhancement-styles')) return;
    const style = document.createElement('style');
    style.id = 'nexus-enhancement-styles';
    style.textContent = `
      #nexus-notifications{position:fixed;right:18px;bottom:18px;z-index:99999;display:flex;flex-direction:column;gap:10px;width:min(360px,calc(100vw - 36px));pointer-events:none}
      .nexus-toast{pointer-events:auto;display:grid;grid-template-columns:1fr auto;gap:4px 12px;padding:14px 16px;border:1px solid rgba(255,255,255,.15);border-left:4px solid #60a5fa;border-radius:12px;background:rgba(15,23,42,.96);color:#f8fafc;box-shadow:0 12px 36px rgba(0,0,0,.28);opacity:0;transform:translateY(8px);transition:opacity .18s ease,transform .18s ease;font:14px/1.45 system-ui,sans-serif}
      .nexus-toast.show{opacity:1;transform:translateY(0)}
      .nexus-toast.success{border-left-color:#34d399}.nexus-toast.warning{border-left-color:#fbbf24}.nexus-toast.error{border-left-color:#fb7185}
      .nexus-toast strong{font-size:14px}.nexus-toast span{grid-column:1/-1;color:#cbd5e1;overflow-wrap:anywhere}
      .nexus-toast button{grid-column:2;grid-row:1;border:0;background:transparent;color:#cbd5e1;cursor:pointer;font-size:18px;line-height:1;padding:0 2px}
      .nexus-toast button:focus-visible{outline:2px solid #93c5fd;outline-offset:3px;border-radius:3px}
      button.nexus-click{filter:brightness(1.12)}
      @media(prefers-reduced-motion:reduce){.nexus-toast,.nexus-toast.show{transition:none;transform:none}button.nexus-click{filter:none}}
      @media(max-width:520px){#nexus-notifications{right:10px;bottom:10px;width:calc(100vw - 20px)}.nexus-toast{padding:12px}}
    `;
    document.head.appendChild(style);
  };

  const getToastHost = () => {
    if (toastHost && toastHost.isConnected) return toastHost;
    toastHost = document.getElementById('nexus-notifications');
    if (!toastHost) {
      toastHost = document.createElement('div');
      toastHost.id = 'nexus-notifications';
      toastHost.setAttribute('aria-live', 'polite');
      toastHost.setAttribute('aria-relevant', 'additions');
      toastHost.setAttribute('aria-label', 'Notificaciones del juego');
      document.body.appendChild(toastHost);
    }
    return toastHost;
  };

  const notify = (title, message, type = 'info', options = {}) => {
    const entry = {
      title: String(title || 'NexusCorp').slice(0, 120),
      message: String(message || '').slice(0, 500),
      type: ['success', 'warning', 'error'].includes(type) ? type : 'info',
      date: Date.now()
    };
    state.notifications.unshift(entry);
    state.notifications = state.notifications.slice(0, MAX_NOTIFICATIONS);
    scheduleSave();

    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification(entry.title, { body: entry.message, silent: true }); } catch (_) {}
    }

    const host = getToastHost();
    const el = document.createElement('div');
    el.className = 'nexus-toast ' + entry.type;
    el.setAttribute('role', entry.type === 'error' ? 'alert' : 'status');
    const heading = document.createElement('strong');
    heading.textContent = entry.title;
    const body = document.createElement('span');
    body.textContent = entry.message;
    const close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Cerrar notificación');
    close.textContent = '×';
    close.addEventListener('click', () => el.remove());
    el.append(heading, close, body);
    host.prepend(el);

    while (host.children.length > 4) host.lastElementChild.remove();
    requestAnimationFrame(() => el.classList.add('show'));
    const duration = Number.isFinite(options.duration) ? options.duration : 4600;
    const dismiss = () => {
      if (!el.isConnected) return;
      el.classList.remove('show');
      setTimeout(() => el.remove(), 220);
    };
    if (duration > 0) setTimeout(dismiss, duration);
    return entry;
  };

  const enhanceButtons = () => {
    document.querySelectorAll('button').forEach(button => {
      if (button.dataset.nexusEnhanced) return;
      button.dataset.nexusEnhanced = '1';
      button.addEventListener('click', () => {
        button.classList.add('nexus-click');
        setTimeout(() => button.classList.remove('nexus-click'), 160);
      });
    });
  };

  const enhanceAccessibility = () => {
    const money = document.getElementById('ui-money');
    if (money && !money.hasAttribute('aria-label')) money.setAttribute('aria-label', 'Fondos disponibles');
    document.querySelectorAll('button[title]').forEach(button => {
      if (!button.getAttribute('aria-label')) button.setAttribute('aria-label', button.title);
    });
    document.querySelectorAll('input,select,textarea').forEach((field, index) => {
      if (field.id && !document.querySelector('label[for="' + CSS.escape(field.id) + '"]') && !field.getAttribute('aria-label')) {
        const nearby = field.closest('.form-group');
        const label = nearby && nearby.querySelector('label');
        if (label) field.setAttribute('aria-label', label.textContent.trim());
      }
    });
  };

  const bindDiagnostics = () => {
    window.addEventListener('error', event => {
      const message = event && event.message ? event.message : 'Error inesperado en la interfaz.';
      console.error('[NexusCorp] Error de ejecución:', event);
      notify('Error detectado', message, 'error');
    });
    window.addEventListener('unhandledrejection', event => {
      console.error('[NexusCorp] Promesa rechazada:', event.reason);
      notify('Operación incompleta', 'Una tarea falló. Revisa la consola para ver los detalles.', 'warning');
    });
    window.addEventListener('online', () => notify('Conexión recuperada', 'El navegador volvió a estar en línea.', 'success'));
    window.addEventListener('offline', () => notify('Sin conexión', 'La partida local sigue disponible; la sincronización en nube puede pausarse.', 'warning'));
    window.addEventListener('beforeunload', save);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') save();
    });
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        const ok = save();
        notify('Partida local', ok ? 'Guardado local completado.' : 'No se pudo guardar. Revisa el espacio disponible del navegador.', ok ? 'success' : 'error', { duration: 2500 });
      }
      if (event.key === 'Escape') {
        const host = document.getElementById('nexus-notifications');
        if (host && host.lastElementChild) host.lastElementChild.remove();
      }
    });
  };

  const enhance = () => {
    load();
    ensureStyles();
    enhanceButtons();
    enhanceAccessibility();
    bindDiagnostics();
    if (!state.lastSave) {
      notify('NexusCorp listo', 'Mejoras de accesibilidad y diagnóstico activadas. Usa Ctrl+S para guardar la sesión local.', 'success');
    }
    save();
  };

  window.NexusGameEnhancement = {
    notify,
    save,
    load,
    state,
    version: 2,
    getNotifications: () => state.notifications.slice(),
    clearNotifications: () => { state.notifications = []; save(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance, { once: true });
  else enhance();
})();