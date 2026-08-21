/**
 * Controlador de Interfaz de Usuario (UI) para NexusCorp.
 * Conecta todos los elementos del DOM con los módulos globales del juego.
 */

const UI = {
    // Inicialización principal
    init() {
        this.bindEvents();
        this.updateAll();
    },

    // Enlace de todos los eventos del usuario a los botones e inputs
    bindEvents() {
        // Controles de tiempo
        document.getElementById('btn-pause')?.addEventListener('click', () => { if (window.Engine) Engine.timeSpeed = 0; });
        document.getElementById('btn-play')?.addEventListener('click', () => { if (window.Engine) Engine.timeSpeed = 1; });
        document.getElementById('btn-fast')?.addEventListener('click', () => { if (window.Engine) Engine.timeSpeed = 5; });
        document.getElementById('btn-fast10')?.addEventListener('click', () => { if (window.Engine) Engine.timeSpeed = 10; });
        document.getElementById('btn-fast25')?.addEventListener('click', () => { if (window.Engine) Engine.timeSpeed = 25; });

        // Navegación principal de módulos
        document.querySelectorAll('.module-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.openPanel(btn.dataset.target, btn);
            });
        });

        // Cambio de pestañas dentro de los paneles
        document.querySelectorAll('.panel-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const panelId = tab.closest('.panel')?.id;
                this.switchTab(panelId, tab.dataset.tab);
            });
        });

        // Eventos del módulo TechStart
        document.getElementById('btn-hire-dev')?.addEventListener('click', () => {
            if (window.Engine?.state && window.TechStart?.state) {
                // Costo base simulado para contratación
                if (Engine.state.money >= 5000) {
                    Engine.state.money -= 5000;
                    TechStart.state.devs = (TechStart.state.devs || 0) + 1;
                    this.updateTechStats();
                    this.updateMoney();
                } else {
                    this.notify("Fondos insuficientes", "Necesitas $5,000 para contratar a un desarrollador.", "error");
                }
            }
        });

        document.getElementById('btn-new-project')?.addEventListener('click', () => {
            if (window.TechStart?.projects) {
                TechStart.projects.push({
                    id: Date.now(),
                    name: "Nuevo Proyecto",
                    progress: 0,
                    requiredWork: 100,
                    completed: 0,
                    type: 'app'
                });
                this.renderProjects();
            }
        });

        // Eventos del Banco
        document.getElementById('btn-take-loan')?.addEventListener('click', () => {
            if (window.Engine?.state) {
                Engine.state.money += 50000;
                Engine.state.debt += 50000;
                this.updateBank();
                this.updateMoney();
            }
        });

        document.getElementById('btn-pay-loan')?.addEventListener('click', () => {
            if (window.Engine?.state) {
                if(Engine.state.money >= 50000 && Engine.state.debt >= 50000) {
                    Engine.state.money -= 50000;
                    Engine.state.debt -= 50000;
                    this.updateBank();
                    this.updateMoney();
                } else {
                    this.notify("Error", "No tienes suficiente dinero o deuda para realizar este pago.", "error");
                }
            }
        });

        // Eventos de Investigación (Research)
        document.getElementById('btn-hire-researcher')?.addEventListener('click', () => {
            window.Research?.hireResearcher?.();
            this.renderResearch();
        });

        // Eventos de Manufactura (ManuCore)
        document.getElementById('btn-buy-components')?.addEventListener('click', () => {
            window.ManuCore?.buyComponents?.();
        });
        
        document.getElementById('btn-upgrade-factory')?.addEventListener('click', () => {
            window.ManuCore?.upgradeFactory?.();
        });
        
        document.getElementById('btn-manufacture')?.addEventListener('click', () => {
            window.ManuCore?.manufacture?.();
        });

        // Diseñador de dispositivos
        document.getElementById('device-type')?.addEventListener('change', () => {
            this.renderDeviceSpecs();
            window.ManuCore?.previewDesign?.();
        });

        document.getElementById('device-price')?.addEventListener('input', () => {
            window.ManuCore?.previewDesign?.();
        });

        // Creador de Sistema Operativo
        document.getElementById('btn-create-os')?.addEventListener('click', () => {
            const config = {
                name: document.getElementById('os-name')?.value || "Nuevo SO",
                kernel: document.getElementById('os-kernel')?.value,
                ui: document.getElementById('os-ui')?.value,
                assistant: document.getElementById('os-assistant')?.value,
                store: document.getElementById('os-store')?.value,
                security: document.getElementById('os-security')?.value
            };
            window.OSDesigner?.createOS?.(config);
            this.renderOSDesigner();
        });

        // Recursos Humanos (HR) - Contratación por rol
        const roles = ['designer', 'programmer', 'engineer', 'tester'];
        roles.forEach(role => {
            document.getElementById(`btn-hire-${role}`)?.addEventListener('click', () => {
                const firstNames = ['Carlos','María','Jorge','Ana','Luis','Sofia','Diego','Valentina','Pablo','Camila'];
                const lastNames = ['García','López','Martínez','Rodríguez','Hernández','Torres','Ramírez','Cruz'];
                const randName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
                const randSkill = Math.floor(Math.random() * 51) + 40; // 40-90
                const randSalary = Math.floor(Math.random() * 2501) + 1500; // 1500-4000
                
                window.HR?.hireEmployee?.(randName, role, randSkill, randSalary);
                this.renderHR();
            });
        });

        document.getElementById('btn-upgrade-office')?.addEventListener('click', () => {
            window.HR?.upgradeOffice?.();
            this.renderHR();
        });

        // Marketing - Lanzamiento de campañas
        ['leaks', 'influencers', 'keynote'].forEach(campId => {
            document.getElementById(`btn-campaign-${campId}`)?.addEventListener('click', () => {
                window.Marketing?.launchCampaign?.(campId);
                this.renderMarketing();
            });
        });

        // Configuración y guardado
        document.getElementById('btn-save-company-name')?.addEventListener('click', () => {
            this.saveCompanyName();
        });

        document.getElementById('btn-reset-save')?.addEventListener('click', () => {
            window.LocalSave?.reset?.();
        });

        // Panel de Administración y código secreto
        document.getElementById('btn-admin-connect')?.addEventListener('click', () => {
            const pass = document.getElementById('admin-password')?.value;
            if (pass === '2409') {
                this.notify("Acceso concedido", "Conectado al panel de administración", "success");
                document.getElementById('admin-tools')?.classList.remove('hidden');
            } else {
                this.notify("Acceso denegado", "Contraseña incorrecta", "error");
            }
        });

        // Todos los botones de poder admin
        document.querySelectorAll('#admin-tools button')?.forEach(btn => {
            btn.addEventListener('click', () => {
                this.notify("Admin", `Herramienta admin ejecutada: ${btn.innerText}`, "info");
            });
        });

        // Detector de secuencia secreta del teclado
        let keySequence = '';
        document.addEventListener('keydown', (e) => {
            keySequence += e.key;
            if (keySequence.length > 4) {
                keySequence = keySequence.slice(-4);
            }
            if (keySequence === '2409') {
                document.getElementById('btn-nav-admin')?.classList.remove('hidden');
                this.notify("Secreto descubierto", "Menú de administración desbloqueado", "success");
                keySequence = ''; // Reiniciar
            }
        });
    },

    // Alternar entre paneles principales
    openPanel(targetId, button = null) {
        document.querySelectorAll('.module-panels .panel').forEach(p => p.classList.add('hidden'));
        document.querySelectorAll('.module-btn').forEach(b => b.classList.remove('active'));

        if (targetId) {
            document.getElementById(targetId)?.classList.remove('hidden');
        }
        if (button) {
            button.classList.add('active');
        }
    },

    // Alternar entre pestañas de un panel
    switchTab(panelId, tabName) {
        if (!panelId || !tabName) return;
        const panel = document.getElementById(panelId);
        if (!panel) return;

        panel.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        panel.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));

        panel.querySelector(`.tab-content[data-tab="${tabName}"]`)?.classList.remove('hidden');
        panel.querySelector(`.panel-tab[data-tab="${tabName}"]`)?.classList.add('active');
    },

    // Actualiza todos los elementos de la interfaz
    updateAll() {
        this.updateMoney();
        this.updateReputation();
        this.updateDate();
        this.updateTechStats();
        this.updateBank();
        this.renderProjects();
        this.renderActiveProducts();
        this.updateManuCore();
        this.renderResearch();
        this.renderOSDesigner();
        this.renderHR();
        this.renderMarketing();
        this.renderRivals();
        this.renderMarket();
    },

    updateMoney() {
        const el = document.getElementById('ui-money');
        if (el && window.Engine?.state) {
            el.innerText = `$${Engine.state.money.toLocaleString()}`;
            el.style.color = Engine.state.money < 0 ? 'red' : 'inherit';
        }
    },

    updateReputation() {
        const el = document.getElementById('ui-reputation');
        if (el && window.Engine?.state) {
            el.innerText = `Rep: ${Engine.state.reputation}`;
        }
    },

    updateDate() {
        const el = document.getElementById('ui-date');
        if (el && window.Engine?.state?.currentDate) {
            const dateObj = new Date(Engine.state.currentDate);
            el.innerText = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
        }
    },

    updateTimeControls(speed) {
        const currentSpeed = speed !== undefined ? speed : (window.Engine?.state?.timeSpeed || 0);
        document.querySelectorAll('.time-control-btn').forEach(btn => btn.classList.remove('active'));
        
        if (currentSpeed === 0) document.getElementById('btn-pause')?.classList.add('active');
        else if (currentSpeed === 1) document.getElementById('btn-play')?.classList.add('active');
        else if (currentSpeed === 5) document.getElementById('btn-fast')?.classList.add('active');
        else if (currentSpeed === 10) document.getElementById('btn-fast10')?.classList.add('active');
        else if (currentSpeed === 25) document.getElementById('btn-fast25')?.classList.add('active');
    },

    updateTechStats() {
        const countEl = document.getElementById('tech-devs-count');
        const costEl = document.getElementById('tech-devs-cost');
        if (window.TechStart?.state) {
            if (countEl) countEl.innerText = TechStart.state.devs || 0;
            if (costEl) costEl.innerText = `$${((TechStart.state.devs || 0) * 1500).toLocaleString()}`; // Base 1500
        }
    },

    updateBank() {
        const debtEl = document.getElementById('bank-debt');
        if (debtEl && window.Engine?.state) {
            debtEl.innerText = `$${(Engine.state.debt || 0).toLocaleString()}`;
        }
    },

    updateCityLevel(level) {
        const el = document.getElementById('city-level');
        if (el) el.innerText = `Nivel: ${level}`;
    },

    renderProjects() {
        const container = document.getElementById('projects-list');
        if (!container) return;
        container.innerHTML = '';
        
        const projs = window.TechStart?.state?.projects || [];
        if (projs.length === 0) {
            this.empty(container, "No hay proyectos en desarrollo.");
            return;
        }

        projs.forEach(p => {
            const percentage = p.requiredWork > 0 ? Math.min(100, Math.floor((p.completed / p.requiredWork) * 100)) : 0;
            this.appendProgress(container, p.id, `${p.name} - ${percentage}%`);
            this.updateProjectBar(p.id, percentage);
        });
    },

    renderActiveProducts() {
        const container = document.getElementById('active-products-list');
        if (!container) return;
        container.innerHTML = '';
        
        const products = window.TechStart?.state?.activeProducts || [];
        if (products.length === 0) {
            this.empty(container, "No hay productos lanzados al mercado.");
            return;
        }

        products.forEach(p => {
            const li = document.createElement('li');
            li.innerText = `${p.name} | Ventas: ${p.monthlySales || 0}/mes`;
            container.appendChild(li);
        });
    },

    updateProjectBar(id, percentage) {
        const bar = document.getElementById(`prog-${id}`);
        if (bar) bar.style.width = `${percentage}%`;
    },

    updateManuCore() {
        const factoryLvl = document.getElementById('factory-level');
        if (factoryLvl && window.ManuCore?.state) {
            factoryLvl.innerText = ManuCore.state.factoryLevel || 1;
        }
        this.renderComponents();
        this.renderDevices();
        this.renderDeviceOptions();
    },

    renderComponents() {
        ['chips', 'screens', 'batteries', 'alloys'].forEach(comp => {
            const el = document.getElementById(`comp-${comp}`);
            if (el && window.ManuCore?.state?.components) {
                el.innerText = ManuCore.state.components[comp] || 0;
            }
        });
    },

    renderDevices() {
        const container = document.getElementById('device-catalog');
        if (!container) return;
        container.innerHTML = '';
        
        const devices = window.ManuCore?.state?.devices || [];
        if (devices.length === 0) {
            this.empty(container, "El catálogo está vacío. Diseña tu primer dispositivo.");
            return;
        }

        devices.forEach(d => {
            const div = document.createElement('div');
            div.className = 'device-card';
            div.innerHTML = `
                <h4>${d.name} (${d.type})</h4>
                <p>Stock: ${d.inventory} | Costo: $${d.marketValue} | Calidad: ${d.quality}</p>
                <p>Reseñas: ${d.reviewScore ? d.reviewScore + '/10' : 'Pendiente'}</p>
                <div class="device-price-control">
                    <label>Precio de Venta:</label>
                    <input type="number" id="edit-price-${d.id}" value="${d.price}">
                    <button id="btn-save-price-${d.id}">Actualizar</button>
                </div>
            `;
            container.appendChild(div);

            document.getElementById(`btn-save-price-${d.id}`)?.addEventListener('click', () => {
                const newPrice = document.getElementById(`edit-price-${d.id}`)?.value;
                if (newPrice && window.ManuCore?.updateDevicePrice) {
                    ManuCore.updateDevicePrice(d.id, Number(newPrice));
                    this.notify("Precio actualizado", `Nuevo precio fijado en $${newPrice}`, "success");
                }
            });
        });
    },

    renderDeviceOptions() {
        const select = document.getElementById('device-type');
        if (!select || !window.ManuCore?.config?.deviceTypes) return;
        
        const currentValue = select.value;
        select.innerHTML = '<option value="">Selecciona una categoría...</option>';
        
        Object.entries(ManuCore.config.deviceTypes).forEach(([category, types]) => {
            const group = document.createElement('optgroup');
            group.label = category.toUpperCase();
            
            if (Array.isArray(types)) {
                types.forEach(t => {
                    const opt = document.createElement('option');
                    opt.value = t.id || t.name; // Depende de la estructura, usando id o name
                    opt.innerText = t.locked ? `🔒 ${t.name}` : t.name;
                    if (t.locked) opt.disabled = true;
                    group.appendChild(opt);
                });
            }
            select.appendChild(group);
        });
        
        if (currentValue) select.value = currentValue;
    },

    renderDeviceSpecs() {
        const select = document.getElementById('device-type');
        const container = document.getElementById('device-specs-container');
        if (!select || !container || !window.ManuCore?.getApplicableSpecs) return;

        container.innerHTML = '';
        const category = select.value;
        if (!category) return;

        // getApplicableSpecs devuelve un objeto con las categorías de especificaciones
        const specs = ManuCore.getApplicableSpecs(category) || {};
        
        Object.entries(specs).forEach(([specKey, specData]) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'spec-group';
            
            const label = document.createElement('label');
            label.htmlFor = `spec-${specKey}`;
            label.innerText = `${specData.icon || ''} ${specData.label || specKey}`;
            
            const specSelect = document.createElement('select');
            specSelect.id = `spec-${specKey}`;
            specSelect.addEventListener('change', () => window.ManuCore?.previewDesign?.());
            
            (specData.options || []).forEach(opt => {
                const optionEl = document.createElement('option');
                optionEl.value = opt.id;
                optionEl.innerText = `${opt.name} (+${opt.qualityBonus || 0} Calidad)`;
                if (opt.requires) optionEl.dataset.requires = opt.requires;
                specSelect.appendChild(optionEl);
            });
            
            wrapper.appendChild(label);
            wrapper.appendChild(specSelect);
            container.appendChild(wrapper);
        });
    },

    renderResearch() {
        const countEl = document.getElementById('researchers-count');
        if (countEl && window.Research?.state) {
            countEl.innerText = Research.state.researchers || 0;
        }

        ['hardware', 'software', 'marketing', 'hr'].forEach(branch => {
            const techs = window.Research?.getByBranch?.(branch) || [];
            this.renderResearchTree(branch, techs);
        });
    },

    renderResearchTree(branchName, techs) {
        const container = document.getElementById(`research-tree-${branchName}`);
        if (!container) return;
        container.innerHTML = '';

        if (techs.length === 0) {
            this.empty(container, "Rama de investigación vacía.");
            return;
        }

        techs.forEach(t => {
            const isCompleted = window.Research?.isCompleted?.(t.id);
            const isAvailable = window.Research?.isAvailable?.(t.id);
            const status = isCompleted ? 'Completado' : 'Pendiente';
            
            const div = document.createElement('div');
            div.className = `tech-node ${isCompleted ? 'completed' : ''} ${!isCompleted && !isAvailable ? 'locked' : ''}`;
            
            let btnHtml = '';
            if (!isCompleted && isAvailable) {
                btnHtml = `<button id="btn-start-res-${t.id}">Investigar</button>`;
            }

            div.innerHTML = `
                <h5>${t.name}</h5>
                <p>Progreso: ${t.progress || 0}/${t.requiredWork || 100}</p>
                <p>Estado: ${status}</p>
                ${btnHtml}
            `;
            container.appendChild(div);

            document.getElementById(`btn-start-res-${t.id}`)?.addEventListener('click', () => {
                window.Research?.startResearch?.(t.id);
                this.renderResearch();
            });
        });
    },

    renderOSDesigner() {
        if (!window.OSDesigner?.config) return;

        const populateSelect = (elementId, dataArray) => {
            const el = document.getElementById(elementId);
            if (!el) return;
            const current = el.value;
            el.innerHTML = '<option value="">Ninguno</option>';
            (dataArray || []).forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.id;
                opt.innerText = `${item.name} (+${item.qualityBonus || 0})`;
                el.appendChild(opt);
            });
            if (current) el.value = current;
        };

        populateSelect('os-kernel', OSDesigner.config.kernels);
        populateSelect('os-ui', OSDesigner.config.uiStyles);
        populateSelect('os-assistant', OSDesigner.config.assistants);
        populateSelect('os-store', OSDesigner.config.appStores);
        populateSelect('os-security', OSDesigner.config.security);

        // Lista de SO creados
        const osList = document.getElementById('created-os-list');
        if (osList && window.OSDesigner?.state?.systems) {
            osList.innerHTML = '';
            if (OSDesigner.state.systems.length === 0) {
                this.empty(osList, "No has desarrollado ningún Sistema Operativo.");
            } else {
                OSDesigner.state.systems.forEach(os => {
                    const isActive = OSDesigner.state.activeOS === os.id;
                    const div = document.createElement('div');
                    div.className = 'os-card';
                    div.innerHTML = `
                        <strong>${os.name}</strong> ${isActive ? '<span class="badge">ACTIVO</span>' : ''}
                        <div>
                            <button id="btn-act-os-${os.id}" ${isActive ? 'disabled' : ''}>Establecer Activo</button>
                            <button id="btn-del-os-${os.id}">Eliminar</button>
                        </div>
                    `;
                    osList.appendChild(div);

                    document.getElementById(`btn-act-os-${os.id}`)?.addEventListener('click', () => {
                        window.OSDesigner?.setActiveOS?.(os.id);
                        this.renderOSDesigner();
                    });
                    document.getElementById(`btn-del-os-${os.id}`)?.addEventListener('click', () => {
                        window.OSDesigner?.deleteOS?.(os.id);
                        this.renderOSDesigner();
                    });
                });
            }
        }
    },

    renderHR() {
        const lvlEl = document.getElementById('office-level');
        const capEl = document.getElementById('office-capacity');
        
        if (window.HR?.state && window.HR?.config) {
            if (lvlEl) lvlEl.innerText = HR.state.officeLevel || 1;
            if (capEl) capEl.innerText = HR.config.officeCapacities?.[HR.state.officeLevel] || 0;
        }

        const empList = document.getElementById('employee-list');
        if (empList && window.HR?.state?.employees) {
            empList.innerHTML = '';
            if (HR.state.employees.length === 0) {
                this.empty(empList, "No tienes empleados en la oficina.");
            } else {
                HR.state.employees.forEach(emp => {
                    const div = document.createElement('div');
                    div.className = 'employee-card';
                    const energyColor = emp.energy > 60 ? '#4caf50' : (emp.energy > 30 ? '#ff9800' : '#f44336');
                    div.innerHTML = `
                        <h4>${emp.name} <span>(${emp.role})</span></h4>
                        <p>Habilidad: ${emp.skill} | Salario: $${emp.salary}</p>
                        <p>Energía: ${emp.energy}%</p>
                        <div class="progress-bg" style="background:#ddd; width:100%; height:8px; margin-bottom:5px;">
                            <div style="background:${energyColor}; width:${emp.energy}%; height:100%;"></div>
                        </div>
                        <button id="btn-fire-emp-${emp.id}">Despedir</button>
                    `;
                    empList.appendChild(div);

                    document.getElementById(`btn-fire-emp-${emp.id}`)?.addEventListener('click', () => {
                        window.HR?.fireEmployee?.(emp.id);
                        this.renderHR();
                    });
                });
            }
        }
    },

    renderMarketing() {
        const hypeBar = document.getElementById('marketing-hype-bar');
        const hypeVal = document.getElementById('marketing-hype-value');
        if (window.Marketing?.state) {
            const hype = Marketing.state.currentHype || 0;
            if (hypeBar) hypeBar.style.width = `${Math.min(100, hype)}%`;
            if (hypeVal) hypeVal.innerText = `${hype}/100 Hype`;
        }
    },

    renderRivals() {
        const list = document.getElementById('rivals-list');
        if (!list) return;
        list.innerHTML = '';
        
        const companies = window.Rivals?.state?.companies || [];
        if (companies.length === 0) {
            this.empty(list, "No hay empresas rivales.");
            return;
        }

        companies.forEach(c => {
            const div = document.createElement('div');
            div.className = 'rival-card';
            div.innerHTML = `
                <h4>${c.name}</h4>
                <p>Valoración: $${(c.marketCap || 0).toLocaleString()} | Cuota de Mercado: ${c.marketShare || 0}%</p>
                <p>Acciones en tu poder: ${c.sharesOwned || 0}%</p>
                <button id="btn-buy-share-${c.id}">Comprar 1% ($${Math.floor((c.marketCap || 0) * 0.01).toLocaleString()})</button>
            `;
            list.appendChild(div);

            document.getElementById(`btn-buy-share-${c.id}`)?.addEventListener('click', () => {
                window.Rivals?.buyShares?.(c.id, 1);
                this.renderRivals();
            });
        });
    },

    renderMarket() {
        const list = document.getElementById('market-demand-list');
        if (!list || !window.Engine?.state?.marketDemand) return;
        list.innerHTML = '';
        
        Object.entries(Engine.state.marketDemand).forEach(([category, multiplier]) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${category.toUpperCase()}:</strong> ${multiplier}x de Demanda`;
            list.appendChild(li);
        });
    },

    notify(title, desc, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notif = document.createElement('div');
        notif.className = `notification notif-${type}`;
        notif.innerHTML = `<strong>${title}</strong><p>${desc}</p>`;
        
        container.appendChild(notif);
        
        // Auto remover
        setTimeout(() => {
            if (notif.parentNode) notif.remove();
        }, 4000);
    },

    showReviewScore(score, text) {
        const modal = document.getElementById('review-modal');
        if (modal) {
            const scoreEl = document.getElementById('review-score-value');
            const textEl = document.getElementById('review-score-text');
            if (scoreEl) scoreEl.innerText = score;
            if (textEl) textEl.innerText = text;
            modal.classList.remove('hidden');

            const closeBtn = document.getElementById('btn-close-review');
            if (closeBtn) {
                closeBtn.onclick = () => modal.classList.add('hidden');
            }
        } else {
            // Fallback a notificación
            this.notify("Reseña Recibida", `Nota: ${score}/10. ${text}`, "info");
        }
    },

    // Utilidad para inyectar barras de progreso
    appendProgress(listEl, id, label) {
        const wrapper = document.createElement('div');
        wrapper.className = 'progress-item';
        wrapper.innerHTML = `
            <span>${label}</span>
            <div class="progress-bar-container" style="background:#e0e0e0; width:100%; height:12px; border-radius:6px; overflow:hidden;">
                <div id="prog-${id}" style="background:#2196f3; width:0%; height:100%; transition: width 0.3s;"></div>
            </div>
        `;
        listEl.appendChild(wrapper);
    },

    // Utilidad para estados vacíos
    empty(element, text) {
        if (element) {
            element.innerHTML = `<div class="empty-state"><i>${text}</i></div>`;
        }
    },

    saveCompanyName() {
        const input = document.getElementById('company-name-input');
        if (input && window.Engine?.state) {
            const newName = input.value.trim();
            if (newName) {
                Engine.state.companyName = newName;
                this.notify("Empresa renombrada", `Tu corporación ahora se llama ${newName}`, "success");
            }
        }
    },

    setAdminCloudState(message, isAdmin) {
        const el = document.getElementById('admin-cloud-state');
        if (el) {
            el.innerText = message;
            el.style.color = isAdmin ? '#4caf50' : '#f44336';
        }
    },

    renderAdminCompanies(companies, selectedId) {
        const select = document.getElementById('admin-company-select');
        if (!select) return;
        select.innerHTML = '<option value="">Selecciona compañía...</option>';
        (companies || []).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.innerText = c.name;
            if (c.id === selectedId) opt.selected = true;
            select.appendChild(opt);
        });
    },

    setSelectedCompany(company) {
        const el = document.getElementById('admin-selected-company');
        if (el) {
            el.innerText = company ? `ID: ${company.id} | ${company.name}` : "Ninguna compañía seleccionada";
        }
    }
};

// Función global requerida
window.closePanels = function() {
    UI.openPanel(null);
};

// Exposición global
window.UI = UI;
