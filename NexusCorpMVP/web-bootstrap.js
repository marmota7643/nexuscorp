// web-bootstrap.js - robust web-only bootstrap
(() => {
  'use strict';
  const start = () => {
    document.documentElement.classList.add('nexus-web-ready');
    window.NexusWeb = { version: '1.0.0', platform: 'web', ready: true };
    if (window.NexusGameEnhancement?.notify) window.NexusGameEnhancement.notify('NexusCorp', 'Simulación web lista.', 'success');
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
