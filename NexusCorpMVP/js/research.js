const Research = {
    state: {
        completed: [],      // array of completed tech IDs
        active: [],         // array of { id, name, progress, requiredWork, branch }
        researchers: 0      // number of researchers
    },

    config: {
        researcherSalary: 2500,
        researcherHireCost: 800,
        workPerDay: 4       // per researcher
    },

    technologies: [
        // Branch 1: 🔧 Procesadores
        { id: 'cpu_gen1', name: 'Procesador Gen 1', description: 'CPU básica de nivel de entrada.', branch: 'processors', branchIcon: '🔧', cost: 0, requiredWork: 0, requires: [], unlocks: 'Procesador Gen 1', isStarter: true },
        { id: 'cpu_gen2', name: 'Procesador Gen 2', description: 'Mejor rendimiento y eficiencia.', branch: 'processors', branchIcon: '🔧', cost: 10000, requiredWork: 90, requires: ['cpu_gen1'], unlocks: 'Procesador Gen 2', isStarter: false },
        { id: 'cpu_gen3', name: 'Procesador Gen 3', description: 'Arquitectura de alto rendimiento.', branch: 'processors', branchIcon: '🔧', cost: 30000, requiredWork: 150, requires: ['cpu_gen2'], unlocks: 'Procesador Gen 3', isStarter: false },
        { id: 'cpu_quantum', name: 'Procesador Cuántico', description: 'El futuro de la computación móvil.', branch: 'processors', branchIcon: '🔧', cost: 80000, requiredWork: 240, requires: ['cpu_gen3'], unlocks: 'Procesador Cuántico', isStarter: false },
        { id: 'cpu_6cores', name: 'CPU 6 Núcleos', description: 'Aumenta el rendimiento multitarea.', branch: 'processors', branchIcon: '🔧', cost: 8000, requiredWork: 60, requires: ['cpu_gen1'], unlocks: 'Arquitectura de 6 núcleos', isStarter: false },
        { id: 'cpu_8cores', name: 'CPU 8 Núcleos', description: 'Potencia ideal para dispositivos de gama alta.', branch: 'processors', branchIcon: '🔧', cost: 20000, requiredWork: 120, requires: ['cpu_6cores'], unlocks: 'Arquitectura de 8 núcleos', isStarter: false },
        { id: 'cpu_12cores', name: 'CPU 12 Núcleos', description: 'Rendimiento extremo para entusiastas.', branch: 'processors', branchIcon: '🔧', cost: 40000, requiredWork: 180, requires: ['cpu_8cores'], unlocks: 'Arquitectura de 12 núcleos', isStarter: false },
        { id: 'cpu_highfreq', name: 'Modo Alta Frecuencia', description: 'Frecuencia de reloj aumentada para máxima velocidad.', branch: 'processors', branchIcon: '🔧', cost: 12000, requiredWork: 80, requires: ['cpu_gen2'], unlocks: 'Overclocking de fábrica', isStarter: false },

        // Branch 2: 🖥️ Pantallas
        { id: 'screen_lcd', name: 'Pantalla LCD', description: 'Tecnología de pantalla estándar y económica.', branch: 'screens', branchIcon: '🖥️', cost: 0, requiredWork: 0, requires: [], unlocks: 'Pantallas LCD', isStarter: true },
        { id: 'screen_oled', name: 'Pantalla OLED', description: 'Colores vibrantes y negros perfectos.', branch: 'screens', branchIcon: '🖥️', cost: 8000, requiredWork: 60, requires: ['screen_lcd'], unlocks: 'Pantallas OLED', isStarter: false },
        { id: 'screen_miniled', name: 'Pantalla Mini-LED', description: 'Brillo superior y mejor contraste.', branch: 'screens', branchIcon: '🖥️', cost: 15000, requiredWork: 90, requires: ['screen_oled'], unlocks: 'Pantallas Mini-LED', isStarter: false },
        { id: 'screen_flexible', name: 'Pantalla Flexible', description: 'Permite dispositivos plegables.', branch: 'screens', branchIcon: '🖥️', cost: 25000, requiredWork: 150, requires: ['screen_oled'], unlocks: 'Pantallas Plegables', isStarter: false },
        { id: 'screen_holographic', name: 'Pantalla Holográfica', description: 'Proyección 3D sin gafas.', branch: 'screens', branchIcon: '🖥️', cost: 100000, requiredWork: 300, requires: ['screen_flexible'], unlocks: 'Pantallas Holográficas', isStarter: false },
        { id: 'screen_90hz', name: 'Tasa de Refresco 90Hz', description: 'Animaciones más fluidas.', branch: 'screens', branchIcon: '🖥️', cost: 6000, requiredWork: 60, requires: ['screen_lcd'], unlocks: 'Opción de 90Hz', isStarter: false },
        { id: 'screen_120hz', name: 'Tasa de Refresco 120Hz', description: 'Fluidez ideal para gaming.', branch: 'screens', branchIcon: '🖥️', cost: 10000, requiredWork: 80, requires: ['screen_90hz'], unlocks: 'Opción de 120Hz', isStarter: false },
        { id: 'screen_144hz', name: 'Tasa de Refresco 144Hz', description: 'Ultra fluidez para e-sports.', branch: 'screens', branchIcon: '🖥️', cost: 15000, requiredWork: 100, requires: ['screen_120hz'], unlocks: 'Opción de 144Hz', isStarter: false },
        { id: 'screen_240hz', name: 'Tasa de Refresco 240Hz', description: 'Máxima tasa de refresco del mercado.', branch: 'screens', branchIcon: '🖥️', cost: 25000, requiredWork: 140, requires: ['screen_144hz'], unlocks: 'Opción de 240Hz', isStarter: false },
        { id: 'screen_qhd', name: 'Resolución QHD', description: 'Mayor densidad de píxeles.', branch: 'screens', branchIcon: '🖥️', cost: 8000, requiredWork: 70, requires: ['screen_oled'], unlocks: 'Resolución 2K/QHD', isStarter: false },
        { id: 'screen_4k', name: 'Resolución 4K', description: 'Claridad absoluta para consumo multimedia.', branch: 'screens', branchIcon: '🖥️', cost: 18000, requiredWork: 110, requires: ['screen_qhd'], unlocks: 'Resolución 4K', isStarter: false },

        // Branch 3: 🔋 Energía
        { id: 'bat_standard', name: 'Batería Estándar', description: 'Batería de iones de litio convencional.', branch: 'battery', branchIcon: '🔋', cost: 0, requiredWork: 0, requires: [], unlocks: 'Batería Básica', isStarter: true },
        { id: 'bat_fastcharge', name: 'Carga Rápida', description: 'Reduce el tiempo de carga a la mitad.', branch: 'battery', branchIcon: '🔋', cost: 6000, requiredWork: 60, requires: ['bat_standard'], unlocks: 'Carga Rápida (30W)', isStarter: false },
        { id: 'bat_ultrafast', name: 'Carga Ultra Rápida', description: 'Carga completa en minutos.', branch: 'battery', branchIcon: '🔋', cost: 15000, requiredWork: 90, requires: ['bat_fastcharge'], unlocks: 'Carga Ultra Rápida (120W)', isStarter: false },
        { id: 'bat_wireless', name: 'Carga Inalámbrica', description: 'Comodidad sin cables.', branch: 'battery', branchIcon: '🔋', cost: 10000, requiredWork: 90, requires: ['bat_standard'], unlocks: 'Soporte Qi', isStarter: false },
        { id: 'bat_wireless_fast', name: 'Carga Inalámbrica Rápida', description: 'Carga sin cables de alta velocidad.', branch: 'battery', branchIcon: '🔋', cost: 20000, requiredWork: 120, requires: ['bat_wireless'], unlocks: 'Carga Inalámbrica 50W', isStarter: false },
        { id: 'bat_solid', name: 'Batería de Estado Sólido', description: 'Mayor densidad energética y seguridad.', branch: 'battery', branchIcon: '🔋', cost: 30000, requiredWork: 150, requires: ['bat_fastcharge'], unlocks: 'Baterías Sólidas', isStarter: false },
        { id: 'bat_graphene', name: 'Batería de Grafeno', description: 'Duración extrema y sin degradación.', branch: 'battery', branchIcon: '🔋', cost: 60000, requiredWork: 200, requires: ['bat_solid'], unlocks: 'Baterías de Grafeno', isStarter: false },

        // Branch 4: 📷 Cámara
        { id: 'cam_12mp', name: 'Cámara 12MP', description: 'Sensor estándar para fotos básicas.', branch: 'camera', branchIcon: '📷', cost: 0, requiredWork: 0, requires: [], unlocks: 'Lente 12MP', isStarter: true },
        { id: 'cam_48mp', name: 'Cámara 48MP', description: 'Mayor detalle fotográfico.', branch: 'camera', branchIcon: '📷', cost: 5000, requiredWork: 60, requires: ['cam_12mp'], unlocks: 'Lente 48MP', isStarter: false },
        { id: 'cam_108mp', name: 'Cámara 108MP', description: 'Fotografía de ultra alta resolución.', branch: 'camera', branchIcon: '📷', cost: 18000, requiredWork: 120, requires: ['cam_48mp'], unlocks: 'Lente 108MP', isStarter: false },
        { id: 'cam_200mp', name: 'Cámara 200MP', description: 'El límite de la resolución móvil actual.', branch: 'camera', branchIcon: '📷', cost: 35000, requiredWork: 160, requires: ['cam_108mp'], unlocks: 'Lente 200MP', isStarter: false },
        { id: 'cam_multilens', name: 'Sistema Multilente', description: 'Permite cámaras gran angular y macro.', branch: 'camera', branchIcon: '📷', cost: 8000, requiredWork: 60, requires: ['cam_12mp'], unlocks: 'Módulos de 2 y 3 cámaras', isStarter: false },
        { id: 'cam_periscope', name: 'Lente Periscopio', description: 'Zoom óptico de largo alcance.', branch: 'camera', branchIcon: '📷', cost: 15000, requiredWork: 100, requires: ['cam_multilens'], unlocks: 'Zoom Óptico 10x', isStarter: false },
        { id: 'cam_ai', name: 'Procesamiento IA', description: 'Mejora las fotos mediante software.', branch: 'camera', branchIcon: '📷', cost: 15000, requiredWork: 90, requires: ['cam_48mp'], unlocks: 'Modo Noche Avanzado', isStarter: false },
        { id: 'cam_ai_advanced', name: 'IA Fotográfica Avanzada', description: 'Fotografía computacional revolucionaria.', branch: 'camera', branchIcon: '📷', cost: 25000, requiredWork: 130, requires: ['cam_ai'], unlocks: 'Borrado mágico y HDR+', isStarter: false },

        // Branch 5: 🔌 Conectividad
        { id: 'net_4g', name: 'Red 4G LTE', description: 'Conectividad de banda ancha estándar.', branch: 'connectivity', branchIcon: '🔌', cost: 0, requiredWork: 0, requires: [], unlocks: 'Módem 4G', isStarter: true },
        { id: 'net_5g', name: 'Red 5G', description: 'Velocidades ultrarrápidas y baja latencia.', branch: 'connectivity', branchIcon: '🔌', cost: 15000, requiredWork: 120, requires: ['net_4g'], unlocks: 'Módem 5G', isStarter: false },
        { id: 'net_5g_plus', name: 'Red 5G+ (mmWave)', description: 'Conectividad gigabit en entornos urbanos.', branch: 'connectivity', branchIcon: '🔌', cost: 25000, requiredWork: 150, requires: ['net_5g'], unlocks: 'Módem 5G mmWave', isStarter: false },
        { id: 'net_6g', name: 'Red 6G', description: 'La próxima generación de conectividad inalámbrica.', branch: 'connectivity', branchIcon: '🔌', cost: 60000, requiredWork: 210, requires: ['net_5g_plus'], unlocks: 'Módem 6G', isStarter: false },
        { id: 'wifi_5', name: 'Wi-Fi 5', description: 'Estándar Wi-Fi AC.', branch: 'connectivity', branchIcon: '🔌', cost: 0, requiredWork: 0, requires: [], unlocks: 'Wi-Fi 5', isStarter: true },
        { id: 'wifi_6', name: 'Wi-Fi 6', description: 'Mejor rendimiento en redes congestionadas.', branch: 'connectivity', branchIcon: '🔌', cost: 8000, requiredWork: 60, requires: ['wifi_5'], unlocks: 'Wi-Fi 6', isStarter: false },
        { id: 'wifi_6e', name: 'Wi-Fi 6E', description: 'Aprovecha la banda de 6GHz.', branch: 'connectivity', branchIcon: '🔌', cost: 12000, requiredWork: 80, requires: ['wifi_6'], unlocks: 'Wi-Fi 6E', isStarter: false },
        { id: 'wifi_7', name: 'Wi-Fi 7', description: 'Velocidades extremadamente altas.', branch: 'connectivity', branchIcon: '🔌', cost: 20000, requiredWork: 120, requires: ['wifi_6e'], unlocks: 'Wi-Fi 7', isStarter: false },
        { id: 'bt_50', name: 'Bluetooth 5.0', description: 'Conexión estable de bajo consumo.', branch: 'connectivity', branchIcon: '🔌', cost: 0, requiredWork: 0, requires: [], unlocks: 'Bluetooth 5.0', isStarter: true },
        { id: 'bt_53', name: 'Bluetooth 5.3', description: 'Mejor eficiencia y alcance.', branch: 'connectivity', branchIcon: '🔌', cost: 5000, requiredWork: 40, requires: ['bt_50'], unlocks: 'Bluetooth 5.3', isStarter: false },
        { id: 'bt_60', name: 'Bluetooth 6.0', description: 'Conexión simultánea sin pérdida.', branch: 'connectivity', branchIcon: '🔌', cost: 12000, requiredWork: 80, requires: ['bt_53'], unlocks: 'Bluetooth 6.0', isStarter: false },
        { id: 'port_usbc', name: 'Puerto USB-C', description: 'El estándar universal moderno.', branch: 'connectivity', branchIcon: '🔌', cost: 3000, requiredWork: 30, requires: ['net_4g'], unlocks: 'Puerto USB-C', isStarter: false },
        { id: 'port_thunderbolt', name: 'Puerto Thunderbolt', description: 'Transferencias de datos a 40Gbps.', branch: 'connectivity', branchIcon: '🔌', cost: 10000, requiredWork: 80, requires: ['port_usbc'], unlocks: 'Puerto Thunderbolt', isStarter: false },

        // Branch 6: 🎨 Materiales
        { id: 'mat_plastic', name: 'Cuerpo de Plástico', description: 'Material económico y resistente.', branch: 'materials', branchIcon: '🎨', cost: 0, requiredWork: 0, requires: [], unlocks: 'Carcasa de Plástico', isStarter: true },
        { id: 'mat_aluminum', name: 'Cuerpo de Aluminio', description: 'Material premium y ligero.', branch: 'materials', branchIcon: '🎨', cost: 5000, requiredWork: 30, requires: ['mat_plastic'], unlocks: 'Carcasa de Aluminio', isStarter: false },
        { id: 'mat_titanium', name: 'Marco de Titanio', description: 'Ligereza extrema y máxima resistencia.', branch: 'materials', branchIcon: '🎨', cost: 20000, requiredWork: 90, requires: ['mat_aluminum'], unlocks: 'Carcasa de Titanio', isStarter: false },
        { id: 'mat_ceramic', name: 'Espalda de Cerámica', description: 'Tacto premium resistente a arañazos.', branch: 'materials', branchIcon: '🎨', cost: 15000, requiredWork: 90, requires: ['mat_aluminum'], unlocks: 'Trasera Cerámica', isStarter: false },
        { id: 'mat_glass', name: 'Espalda de Cristal', description: 'Elegante y permite carga inalámbrica.', branch: 'materials', branchIcon: '🎨', cost: 8000, requiredWork: 50, requires: ['mat_aluminum'], unlocks: 'Trasera de Cristal', isStarter: false },
        { id: 'finish_matte', name: 'Acabado Mate', description: 'Evita las huellas dactilares.', branch: 'materials', branchIcon: '🎨', cost: 2000, requiredWork: 20, requires: ['mat_plastic'], unlocks: 'Pintura Mate', isStarter: false },
        { id: 'finish_texture', name: 'Acabado Texturizado', description: 'Mejor agarre del dispositivo.', branch: 'materials', branchIcon: '🎨', cost: 3000, requiredWork: 25, requires: ['mat_plastic'], unlocks: 'Pintura Texturizada', isStarter: false },

        // Branch 7: 💾 Almacenamiento
        { id: 'stor_emmc', name: 'Almacenamiento eMMC', description: 'Memoria básica para dispositivos económicos.', branch: 'storage', branchIcon: '💾', cost: 0, requiredWork: 0, requires: [], unlocks: 'Memoria eMMC', isStarter: true },
        { id: 'stor_ufs', name: 'Almacenamiento UFS', description: 'Lectura y escritura mucho más rápidas.', branch: 'storage', branchIcon: '💾', cost: 5000, requiredWork: 30, requires: ['stor_emmc'], unlocks: 'Memoria UFS', isStarter: false },
        { id: 'stor_nvme', name: 'Almacenamiento NVMe', description: 'Velocidades a nivel de PC.', branch: 'storage', branchIcon: '💾', cost: 12000, requiredWork: 80, requires: ['stor_ufs'], unlocks: 'Memoria NVMe', isStarter: false },
        { id: 'stor_nvme_gen5', name: 'NVMe Gen 5', description: 'Velocidad de almacenamiento extrema.', branch: 'storage', branchIcon: '💾', cost: 25000, requiredWork: 120, requires: ['stor_nvme'], unlocks: 'Memoria NVMe Ultra Rápida', isStarter: false },
        { id: 'stor_512gb', name: 'Chips de 512GB', description: 'Aumenta la capacidad máxima.', branch: 'storage', branchIcon: '💾', cost: 6000, requiredWork: 40, requires: ['stor_ufs'], unlocks: 'Opciones hasta 512GB', isStarter: false },
        { id: 'stor_1tb', name: 'Chips de 1TB', description: 'Capacidad masiva de almacenamiento.', branch: 'storage', branchIcon: '💾', cost: 12000, requiredWork: 70, requires: ['stor_512gb'], unlocks: 'Opciones hasta 1TB', isStarter: false },
        { id: 'stor_2tb', name: 'Chips de 2TB', description: 'Almacenamiento para profesionales.', branch: 'storage', branchIcon: '💾', cost: 20000, requiredWork: 100, requires: ['stor_1tb'], unlocks: 'Opciones hasta 2TB', isStarter: false },

        // Branch 8: 🏭 Fabricación
        { id: 'fab_basic', name: 'Ensamblaje Manual', description: 'Técnicas de fabricación básicas.', branch: 'manufacturing', branchIcon: '🏭', cost: 0, requiredWork: 0, requires: [], unlocks: 'Fábrica Básica', isStarter: true },
        { id: 'fab_auto', name: 'Líneas Automatizadas', description: 'Aumenta la velocidad de producción.', branch: 'manufacturing', branchIcon: '🏭', cost: 20000, requiredWork: 90, requires: ['fab_basic'], unlocks: 'Producción rápida', isStarter: false },
        { id: 'fab_robotic', name: 'Ensamblaje Robótico', description: 'Precisión absoluta y reducción de errores.', branch: 'manufacturing', branchIcon: '🏭', cost: 50000, requiredWork: 150, requires: ['fab_auto'], unlocks: 'Mayor calidad de ensamblaje', isStarter: false },
        { id: 'fab_ai', name: 'Gestión por IA', description: 'Optimización de fábricas mediante IA.', branch: 'manufacturing', branchIcon: '🏭', cost: 100000, requiredWork: 240, requires: ['fab_robotic'], unlocks: 'Eficiencia máxima', isStarter: false },
        { id: 'fab_qc', name: 'Control de Calidad (QC)', description: 'Reduce productos defectuosos.', branch: 'manufacturing', branchIcon: '🏭', cost: 8000, requiredWork: 50, requires: ['fab_basic'], unlocks: 'Menos devoluciones', isStarter: false },
        { id: 'fab_qc_advanced', name: 'QC Avanzado', description: 'Garantiza calidad premium.', branch: 'manufacturing', branchIcon: '🏭', cost: 18000, requiredWork: 90, requires: ['fab_qc'], unlocks: 'Reputación de marca mejorada', isStarter: false },
        { id: 'fab_miniaturization', name: 'Miniaturización', description: 'Permite componentes más pequeños.', branch: 'manufacturing', branchIcon: '🏭', cost: 30000, requiredWork: 120, requires: ['fab_auto'], unlocks: 'Diseños más delgados', isStarter: false }
    ],

    // Inicializa la investigación
    init() {
        this.technologies.forEach(tech => {
            if (tech.isStarter && !this.state.completed.includes(tech.id)) {
                this.state.completed.push(tech.id);
            }
        });
    },

    // Contrata un nuevo investigador
    hireResearcher() {
        if (typeof Engine !== 'undefined' && Engine.deductMoney(this.config.researcherHireCost)) {
            this.state.researchers++;
            if (typeof UI !== 'undefined') {
                UI.notify('Investigador contratado', `Has contratado un nuevo investigador. Total: ${this.state.researchers}`, 'success');
            }
            return true;
        } else {
            if (typeof UI !== 'undefined') {
                UI.notify('Sin fondos', `No tienes suficiente dinero para contratar (${this.config.researcherHireCost}$)`, 'alert');
            }
            return false;
        }
    },

    // Comprueba si una tecnología está completada
    isCompleted(techId) {
        return this.state.completed.includes(techId);
    },

    // Comprueba si se cumplen los requisitos para iniciar la investigación
    isAvailable(techId) {
        if (this.isCompleted(techId)) return false;
        
        // Comprobar si ya está en progreso
        const isActive = this.state.active.some(p => p.id === techId);
        if (isActive) return false;

        const tech = this.technologies.find(t => t.id === techId);
        if (!tech) return false;

        // Todas las dependencias deben estar completadas
        return tech.requires.every(reqId => this.isCompleted(reqId));
    },

    // Inicia una investigación
    startResearch(techId) {
        const tech = this.technologies.find(t => t.id === techId);
        
        if (!tech) return false;
        if (!this.isAvailable(techId)) return false;

        if (typeof Engine !== 'undefined' && Engine.deductMoney(tech.cost)) {
            this.state.active.push({
                id: tech.id,
                name: tech.name,
                progress: 0,
                requiredWork: tech.requiredWork,
                branch: tech.branch
            });

            if (typeof UI !== 'undefined') {
                UI.notify('Investigación iniciada', `Comenzaste a investigar: ${tech.name}`, 'info');
            }
            return true;
        } else {
            if (typeof UI !== 'undefined') {
                UI.notify('Fondos insuficientes', `No puedes pagar la investigación de ${tech.name} (${tech.cost}$)`, 'alert');
            }
            return false;
        }
    },

    // Progreso diario
    onDayPass() {
        if (this.state.active.length === 0 || this.state.researchers === 0) return;

        // Repartir trabajo entre proyectos activos
        const workTotal = this.state.researchers * this.config.workPerDay;
        const workPerProject = workTotal / this.state.active.length;

        for (let i = this.state.active.length - 1; i >= 0; i--) {
            let project = this.state.active[i];
            project.progress += workPerProject;

            if (project.progress >= project.requiredWork) {
                this.finishResearch(project);
                this.state.active.splice(i, 1);
            }
        }
    },

    // Completa la investigación
    finishResearch(project) {
        if (!this.state.completed.includes(project.id)) {
            this.state.completed.push(project.id);
        }
        
        // Sumar reputación si es posible (asumiendo que Engine gestiona reputación, o notificar)
        // No especificado cómo se suma reputación, así que lo simularemos en el objeto si existe
        if (typeof Engine !== 'undefined' && Engine.state) {
            if (typeof Engine.state.reputation === 'number') {
                Engine.state.reputation += 3;
            }
        }

        if (typeof UI !== 'undefined') {
            UI.notify('Investigación Completada', `¡Has desbloqueado: ${project.name}! (+3 Reputación)`, 'success');
        }
    },

    // Cheat para completar todas las activas
    forceCompleteAll() {
        while (this.state.active.length > 0) {
            let project = this.state.active.pop();
            this.finishResearch(project);
        }
    },

    // Cheat para desbloquear todas
    unlockAll() {
        this.technologies.forEach(tech => {
            if (!this.state.completed.includes(tech.id)) {
                this.state.completed.push(tech.id);
            }
        });
        if (typeof UI !== 'undefined') {
            UI.notify('Admin', 'Todas las tecnologías han sido desbloqueadas.', 'info');
        }
    },

    // Agrupa por rama
    getByBranch() {
        const branches = {};
        this.technologies.forEach(tech => {
            if (!branches[tech.branch]) {
                branches[tech.branch] = [];
            }
            branches[tech.branch].push(tech);
        });
        return branches;
    },

    // Obtener porcentaje de progreso de un proyecto activo
    getProgress(techId) {
        const project = this.state.active.find(p => p.id === techId);
        if (!project) return 0;
        let percent = (project.progress / project.requiredWork) * 100;
        return Math.min(100, Math.max(0, percent));
    }
};

// Auto-inicializar si ya se cargó
if (typeof Research !== 'undefined') {
    Research.init();
}
