// manucore.js — I+D y catálogo de hardware personalizable.
const ManuCore = {
    state: {
        factoryLevel: 1, 
        assemblyLines: 1, 
        components: { chips: 0, screens: 0, batteries: 0, alloys: 0 }, 
        devices: []
    },
    config: {
        batchSize: 10, 
        componentLotCost: 4000, 
        factoryBaseUpgrade: 18000,
        deviceTypes: {
            // PHONES
            'phone_basic':    { name: 'Smartphone Básico',    category: 'phones',    baseCost: 80,   marketValue: 250,   recipe: { chips:1, screens:1, batteries:1, alloys:1 }, requires: null },
            'phone_mid':      { name: 'Smartphone Gama Media', category: 'phones',   baseCost: 150,  marketValue: 500,   recipe: { chips:2, screens:1, batteries:1, alloys:1 }, requires: 'cpu_gen2' },
            'phone_flagship': { name: 'Smartphone Flagship',   category: 'phones',   baseCost: 280,  marketValue: 1000,  recipe: { chips:3, screens:2, batteries:2, alloys:2 }, requires: 'cpu_gen3' },
            'phone_foldable': { name: 'Smartphone Plegable',   category: 'phones',   baseCost: 400,  marketValue: 1600,  recipe: { chips:3, screens:3, batteries:2, alloys:3 }, requires: 'screen_flexible' },
            
            // LAPTOPS
            'laptop_ultrabook':  { name: 'Ultrabook',          category: 'laptops',  baseCost: 300,  marketValue: 900,   recipe: { chips:2, screens:1, batteries:2, alloys:2 }, requires: 'cpu_gen2' },
            'laptop_gaming':     { name: 'Laptop Gaming',      category: 'laptops',  baseCost: 500,  marketValue: 1500,  recipe: { chips:4, screens:2, batteries:3, alloys:3 }, requires: 'cpu_gen3' },
            'laptop_workstation':{ name: 'Workstation',         category: 'laptops',  baseCost: 600,  marketValue: 2200,  recipe: { chips:5, screens:2, batteries:3, alloys:4 }, requires: 'cpu_gen3' },
            'laptop_2in1':       { name: 'Laptop 2-en-1',      category: 'laptops',  baseCost: 350,  marketValue: 1100,  recipe: { chips:2, screens:2, batteries:2, alloys:2 }, requires: 'screen_oled' },
            
            // TABLETS
            'tablet_basic':   { name: 'Tablet Económica',     category: 'tablets',  baseCost: 100,  marketValue: 300,   recipe: { chips:1, screens:1, batteries:2, alloys:1 }, requires: null },
            'tablet_pro':     { name: 'Tablet Pro',            category: 'tablets',  baseCost: 250,  marketValue: 700,   recipe: { chips:2, screens:2, batteries:2, alloys:2 }, requires: 'cpu_gen2' },
            'tablet_gaming':  { name: 'Tablet Gaming',         category: 'tablets',  baseCost: 300,  marketValue: 900,   recipe: { chips:3, screens:2, batteries:3, alloys:2 }, requires: 'screen_120hz' },
            
            // WEARABLES
            'watch_smart':    { name: 'Smartwatch',            category: 'wearables', baseCost: 50,  marketValue: 200,   recipe: { chips:1, screens:1, batteries:1, alloys:1 }, requires: null },
            'watch_fitness':  { name: 'Fitness Band',          category: 'wearables', baseCost: 25,  marketValue: 80,    recipe: { chips:1, batteries:1, alloys:1 }, requires: null },
            'watch_ring':     { name: 'Smart Ring',            category: 'wearables', baseCost: 40,  marketValue: 180,   recipe: { chips:1, batteries:1, alloys:1 }, requires: 'fab_miniaturization' },
            
            // AUDIO
            'audio_earbuds':  { name: 'Earbuds TWS',          category: 'audio',    baseCost: 20,  marketValue: 100,   recipe: { chips:1, batteries:1, alloys:1 }, requires: null },
            'audio_headphones':{ name: 'Headphones Over-Ear', category: 'audio',    baseCost: 40,  marketValue: 200,   recipe: { chips:1, batteries:1, alloys:2 }, requires: null },
            'audio_soundbar': { name: 'Soundbar',              category: 'audio',    baseCost: 80,  marketValue: 350,   recipe: { chips:1, batteries:1, alloys:3 }, requires: 'cpu_gen2' },
            
            // CONSOLES
            'console_portable':{ name: 'Consola Portátil',    category: 'consoles', baseCost: 150, marketValue: 350,   recipe: { chips:2, screens:1, batteries:2, alloys:2 }, requires: 'cpu_gen2' },
            'console_home':    { name: 'Consola Sobremesa',    category: 'consoles', baseCost: 250, marketValue: 500,   recipe: { chips:4, alloys:3 }, requires: 'cpu_gen3' },
            'console_hybrid':  { name: 'Consola Híbrida',      category: 'consoles', baseCost: 200, marketValue: 450,   recipe: { chips:3, screens:1, batteries:2, alloys:2 }, requires: 'cpu_gen3' },
            
            // TVs/MONITORS
            'tv_smart':       { name: 'Smart TV',              category: 'tvs',     baseCost: 200, marketValue: 600,   recipe: { chips:1, screens:3, alloys:3 }, requires: 'screen_oled' },
            'tv_monitor_gaming':{ name: 'Monitor Gaming',      category: 'tvs',     baseCost: 180, marketValue: 500,   recipe: { chips:1, screens:2, alloys:2 }, requires: 'screen_144hz' },
            'tv_monitor_pro':  { name: 'Monitor Pro',          category: 'tvs',     baseCost: 250, marketValue: 800,   recipe: { chips:1, screens:3, alloys:3 }, requires: 'screen_4k' }
        },
        specifications: {
            processor: {
                label: 'Procesador', icon: '⚙️', appliesTo: ['phones', 'laptops', 'tablets', 'wearables', 'consoles', 'tvs'],
                options: [
                    { id: 'entry',       name: 'Básico',           qualityBonus: 0,    extraComponents: {}, requires: null },
                    { id: 'balanced',    name: 'Equilibrado',      qualityBonus: 0.5,  extraComponents: { chips: 1 }, requires: null },
                    { id: 'high',        name: 'Alto Rendimiento', qualityBonus: 1.0,  extraComponents: { chips: 2, alloys: 1 }, requires: 'cpu_gen2' },
                    { id: 'flagship',    name: 'Flagship',         qualityBonus: 1.8,  extraComponents: { chips: 3, alloys: 1 }, requires: 'cpu_gen3' },
                    { id: 'quantum',     name: 'Cuántico',         qualityBonus: 3.0,  extraComponents: { chips: 5, alloys: 2 }, requires: 'cpu_quantum' }
                ]
            },
            screen: {
                label: 'Pantalla', icon: '🖥️', appliesTo: ['phones', 'laptops', 'tablets', 'tvs'],
                options: [
                    { id: 'lcd',      name: 'LCD',          qualityBonus: 0,    extraComponents: {}, requires: null },
                    { id: 'oled',     name: 'OLED',         qualityBonus: 0.7,  extraComponents: { screens: 1 }, requires: 'screen_oled' },
                    { id: 'miniled',  name: 'Mini-LED',     qualityBonus: 1.2,  extraComponents: { screens: 2 }, requires: 'screen_miniled' },
                    { id: 'flexible', name: 'Flexible',     qualityBonus: 1.8,  extraComponents: { screens: 2, chips: 1 }, requires: 'screen_flexible' },
                    { id: 'holo',     name: 'Holográfica',  qualityBonus: 3.5,  extraComponents: { screens: 4, chips: 2 }, requires: 'screen_holographic' }
                ]
            },
            refresh: {
                label: 'Tasa Refresco', icon: '📊', appliesTo: ['phones', 'laptops', 'tablets', 'tvs'],
                options: [
                    { id: '60hz',   name: '60 Hz',   qualityBonus: 0,    extraComponents: {}, requires: null },
                    { id: '90hz',   name: '90 Hz',   qualityBonus: 0.3,  extraComponents: { chips: 1 }, requires: 'screen_90hz' },
                    { id: '120hz',  name: '120 Hz',  qualityBonus: 0.6,  extraComponents: { chips: 1 }, requires: 'screen_120hz' },
                    { id: '144hz',  name: '144 Hz',  qualityBonus: 0.9,  extraComponents: { chips: 1 }, requires: 'screen_144hz' },
                    { id: '240hz',  name: '240 Hz',  qualityBonus: 1.5,  extraComponents: { chips: 2 }, requires: 'screen_240hz' }
                ]
            },
            battery: {
                label: 'Batería', icon: '🔋', appliesTo: ['phones', 'laptops', 'tablets', 'wearables', 'audio', 'consoles'],
                options: [
                    { id: 'standard',   name: 'Estándar',      qualityBonus: 0,    extraComponents: {}, requires: null },
                    { id: 'extended',   name: 'Extendida',     qualityBonus: 0.4,  extraComponents: { batteries: 1 }, requires: null },
                    { id: 'fastcharge', name: 'Carga Rápida',  qualityBonus: 0.7,  extraComponents: { batteries: 1, chips: 1 }, requires: 'bat_fastcharge' },
                    { id: 'ultrafast',  name: 'Ultra-Rápida',  qualityBonus: 1.0,  extraComponents: { batteries: 2, chips: 1 }, requires: 'bat_ultrafast' },
                    { id: 'solid',      name: 'Sólida',        qualityBonus: 1.5,  extraComponents: { batteries: 2, alloys: 1 }, requires: 'bat_solid' },
                    { id: 'graphene',   name: 'Grafeno',       qualityBonus: 2.5,  extraComponents: { batteries: 3, alloys: 2 }, requires: 'bat_graphene' }
                ]
            },
            camera: {
                label: 'Cámara', icon: '📷', appliesTo: ['phones', 'tablets', 'laptops'],
                options: [
                    { id: 'none',     name: 'Sin cámara',   qualityBonus: 0,    extraComponents: {}, requires: null },
                    { id: '12mp',     name: '12 MP',         qualityBonus: 0.3,  extraComponents: {}, requires: null },
                    { id: '48mp',     name: '48 MP',         qualityBonus: 0.7,  extraComponents: { chips: 1 }, requires: 'cam_48mp' },
                    { id: '108mp',    name: '108 MP',        qualityBonus: 1.2,  extraComponents: { chips: 1, screens: 1 }, requires: 'cam_108mp' },
                    { id: '200mp',    name: '200 MP',        qualityBonus: 1.8,  extraComponents: { chips: 2, screens: 1 }, requires: 'cam_200mp' }
                ]
            },
            storage: {
                label: 'Almacenamiento', icon: '💾', appliesTo: ['phones', 'laptops', 'tablets', 'consoles'],
                options: [
                    { id: 'emmc_64',   name: '64GB eMMC',    qualityBonus: 0,    extraComponents: {}, requires: null },
                    { id: 'ufs_128',   name: '128GB UFS',    qualityBonus: 0.3,  extraComponents: { chips: 1 }, requires: 'stor_ufs' },
                    { id: 'ufs_256',   name: '256GB UFS',    qualityBonus: 0.5,  extraComponents: { chips: 1 }, requires: 'stor_ufs' },
                    { id: 'nvme_512',  name: '512GB NVMe',   qualityBonus: 0.8,  extraComponents: { chips: 2 }, requires: 'stor_nvme' },
                    { id: 'nvme_1tb',  name: '1TB NVMe',     qualityBonus: 1.2,  extraComponents: { chips: 2 }, requires: 'stor_1tb' },
                    { id: 'nvme5_2tb', name: '2TB NVMe G5',  qualityBonus: 2.0,  extraComponents: { chips: 3 }, requires: 'stor_2tb' }
                ]
            },
            connectivity: {
                label: 'Conectividad', icon: '🔌', appliesTo: ['phones', 'laptops', 'tablets', 'wearables', 'consoles'],
                options: [
                    { id: 'wifi_only', name: 'Solo WiFi',     qualityBonus: 0,    extraComponents: {}, requires: null },
                    { id: '4g',        name: '4G LTE',        qualityBonus: 0.3,  extraComponents: { chips: 1 }, requires: null },
                    { id: '5g',        name: '5G',            qualityBonus: 0.8,  extraComponents: { chips: 2 }, requires: 'net_5g' },
                    { id: '5g_plus',   name: '5G+',           qualityBonus: 1.2,  extraComponents: { chips: 2, alloys: 1 }, requires: 'net_5g_plus' },
                    { id: '6g',        name: '6G',            qualityBonus: 2.0,  extraComponents: { chips: 3, alloys: 1 }, requires: 'net_6g' }
                ]
            },
            material: {
                label: 'Material', icon: '🎨', appliesTo: ['phones', 'laptops', 'tablets', 'wearables', 'audio', 'consoles', 'tvs'],
                options: [
                    { id: 'plastic',   name: 'Plástico',     qualityBonus: 0,    extraComponents: {}, requires: null },
                    { id: 'aluminum',  name: 'Aluminio',     qualityBonus: 0.5,  extraComponents: { alloys: 1 }, requires: 'mat_aluminum' },
                    { id: 'glass',     name: 'Vidrio',       qualityBonus: 0.6,  extraComponents: { alloys: 1 }, requires: 'mat_glass' },
                    { id: 'ceramic',   name: 'Cerámica',     qualityBonus: 0.9,  extraComponents: { alloys: 2 }, requires: 'mat_ceramic' },
                    { id: 'titanium',  name: 'Titanio',      qualityBonus: 1.5,  extraComponents: { alloys: 3 }, requires: 'mat_titanium' }
                ]
            },
            color: {
                label: 'Color Principal', icon: '🎨', appliesTo: ['phones', 'laptops', 'tablets', 'wearables', 'audio', 'consoles', 'tvs'],
                options: [
                    { id: 'black',   name: 'Negro Místico',   qualityBonus: 0,    extraComponents: {}, requires: null },
                    { id: 'white',   name: 'Blanco Nieve',    qualityBonus: 0,    extraComponents: {}, requires: null },
                    { id: 'silver',  name: 'Gris Espacial',   qualityBonus: 0.1,  extraComponents: {}, requires: null },
                    { id: 'blue',    name: 'Azul Océano',     qualityBonus: 0.1,  extraComponents: {}, requires: null },
                    { id: 'red',     name: 'Rojo Fuego',      qualityBonus: 0.2,  extraComponents: {}, requires: null }
                ]
            },
            finish: {
                label: 'Acabado', icon: '✨', appliesTo: ['phones', 'laptops', 'tablets', 'wearables', 'audio', 'consoles', 'tvs'],
                options: [
                    { id: 'matte',    name: 'Mate',      qualityBonus: 0.1,  extraComponents: {}, requires: null },
                    { id: 'glossy',   name: 'Brillante', qualityBonus: 0,    extraComponents: {}, requires: null },
                    { id: 'glass_fin',name: 'Cristal',   qualityBonus: 0.3,  extraComponents: { alloys: 1 }, requires: null }
                ]
            },
            cam_layout: {
                label: 'Disposición de Cámara', icon: '📐', appliesTo: ['phones', 'tablets'],
                options: [
                    { id: 'vertical',   name: 'Vertical',   qualityBonus: 0,    extraComponents: {}, requires: null },
                    { id: 'horizontal', name: 'Horizontal', qualityBonus: 0,    extraComponents: {}, requires: null },
                    { id: 'square',     name: 'Cuadrada',   qualityBonus: 0.1,  extraComponents: {}, requires: null },
                    { id: 'circular',   name: 'Circular',   qualityBonus: 0.2,  extraComponents: {}, requires: null }
                ]
            }
        }
    },

    buyComponents() {
        if (!Engine.deductMoney(this.config.componentLotCost)) {
            return UI.notify('Sin fondos', 'El lote de componentes cuesta $4,000.', 'alert');
        }
        const bonus = this.state.factoryLevel * 2;
        Object.keys(this.state.components).forEach(key => this.state.components[key] += 20 + bonus);
        UI.updateManuCore();
        UI.notify('Componentes recibidos', `Inventario reforzado (+${20 + bonus} de cada tipo).`, 'success');
        LocalSave.save();
    },

    upgradeFactory() {
        const cost = this.config.factoryBaseUpgrade * this.state.factoryLevel;
        if (!Engine.deductMoney(cost)) {
            return UI.notify('Sin fondos', `La ampliación cuesta $${cost.toLocaleString()}.`, 'alert');
        }
        this.state.factoryLevel++;
        this.state.assemblyLines++;
        UI.updateManuCore();
        UI.notify('Planta ampliada', `Nivel ${this.state.factoryLevel}: más capacidad de producción.`, 'success');
        LocalSave.save();
    },

    getApplicableSpecs(category) {
        const applicable = {};
        Object.entries(this.config.specifications).forEach(([specKey, specData]) => {
            if (specData.appliesTo.includes(category)) {
                applicable[specKey] = specData;
            }
        });
        return applicable;
    },

    isSpecAvailable(specCategory, optionId) {
        const specData = this.config.specifications[specCategory];
        if (!specData) return false;
        const option = specData.options.find(opt => opt.id === optionId);
        if (!option) return false;
        return !option.requires || (typeof Research !== 'undefined' && Research.isCompleted(option.requires));
    },

    getCurrentDesign() {
        const typeId = document.getElementById('device-type').value;
        const model = this.config.deviceTypes[typeId];
        if (!model) return null;

        const applicableSpecs = this.getApplicableSpecs(model.category);
        const selections = {};
        const recipeBonus = { chips: 0, screens: 0, batteries: 0, alloys: 0 };
        let qualityBonus = 0;
        const labels = [];

        Object.keys(applicableSpecs).forEach(category => {
            const selectEl = document.getElementById(`device-${category}`);
            if (selectEl && selectEl.value) {
                const value = selectEl.value;
                const option = applicableSpecs[category].options.find(opt => opt.id === value);
                if (option) {
                    selections[category] = value;
                    labels.push(option.name);
                    qualityBonus += option.qualityBonus;
                    Object.entries(option.extraComponents).forEach(([comp, amt]) => {
                        recipeBonus[comp] += amt;
                    });
                }
            }
        });

        return { selections, recipeBonus, qualityBonus, label: labels.join(' · ') };
    },

    getRecipe(model, design) {
        const recipe = { ...model.recipe };
        if (design && design.recipeBonus) {
            Object.entries(design.recipeBonus).forEach(([component, amount]) => {
                recipe[component] = (recipe[component] || 0) + amount;
            });
        }
        return recipe;
    },

    previewDesign() {
        const type = document.getElementById('device-type').value;
        const model = this.config.deviceTypes[type];
        if (!model) return;

        const design = this.getCurrentDesign();
        if (!design) return;

        let osBonus = 0;
        if (typeof TechStart !== 'undefined') {
            const hasOS = TechStart.state.activeProducts.some(p => p.type === 'os');
            if (hasOS) osBonus = 0.5;
        }

        const value = Math.round(model.marketValue * (1 + (design.qualityBonus + osBonus) * 0.15));
        const preview = document.getElementById('design-preview');
        if (preview) {
            preview.textContent = `${design.label || 'Diseño estándar'}. Valor percibido estimado: $${value.toLocaleString()}.`;
        }
        const priceEl = document.getElementById('device-price');
        if (priceEl && !priceEl.value) priceEl.value = Math.round(model.baseCost * 1.5); // auto-suggest price
    },

    manufacture() {
        const type = document.getElementById('device-type').value;
        const model = this.config.deviceTypes[type];
        
        if (!model) return;
        
        if (model.requires && typeof Research !== 'undefined' && !Research.isCompleted(model.requires)) {
            return UI.notify('Diseño bloqueado', 'Investiga esta tecnología antes de producirla.', 'alert');
        }

        const batch = this.config.batchSize * this.state.assemblyLines;
        const capacity = this.state.factoryLevel * 40;
        const madeThisMonth = this.state.devices.reduce((sum, device) => sum + (device.madeThisMonth || 0), 0);
        
        if (madeThisMonth + batch > capacity) {
            return UI.notify('Capacidad agotada', `La planta solo puede producir ${capacity} unidades este mes.`, 'alert');
        }

        const design = this.getCurrentDesign();
        if (!design) return;

        const recipe = this.getRecipe(model, design);

        for (const [component, amount] of Object.entries(recipe)) {
            if ((this.state.components[component] || 0) < amount * batch) {
                return UI.notify('Faltan componentes', `No hay suficientes ${component} para este diseño.`, 'alert');
            }
        }

        Object.entries(recipe).forEach(([component, amount]) => {
            this.state.components[component] -= amount * batch;
        });

        const customNameEl = document.getElementById('device-name');
        const customName = customNameEl ? customNameEl.value.trim() : '';
        const name = customName || model.name;
        
        const enteredPrice = Number(document.getElementById('device-price').value);
        const price = enteredPrice >= 50 ? Math.round(enteredPrice) : Math.round(model.baseCost * 1.5);

        let osBonus = 0;
        if (typeof TechStart !== 'undefined') {
            const hasOS = TechStart.state.activeProducts.some(p => p.type === 'os');
            if (hasOS) osBonus = 0.5;
        }

        const quality = Number((0 + design.qualityBonus + osBonus).toFixed(2));
        const hypeMultiplier = typeof Marketing !== 'undefined' ? Marketing.consumeHype() : 1;
        const marketValue = Math.round((model.baseCost + (quality * model.marketValue * 0.15)) * hypeMultiplier);
        
        let reviewScore = Math.min(10, Math.max(1, 4 + quality * 1.5 + (Math.random() * 2 - 1)));
        const reviewSites = ["NexoTech", "The Vertex", "IGN-Tech", "WiredCorp", "TechRadarX"];
        const site = reviewSites[Math.floor(Math.random() * reviewSites.length)];
        let reviewText = "";
        if (reviewScore >= 9) {
            reviewText = `Un dispositivo revolucionario, marca un antes y un después.`;
        } else if (reviewScore >= 7) {
            reviewText = `Muy bueno, excelente rendimiento aunque la batería podría ser mejor.`;
        } else if (reviewScore >= 5) {
            reviewText = `Aceptable, pero con demasiada competencia en este rango de precio.`;
        } else {
            reviewText = `Decepcionante. Necesita un rediseño urgente.`;
        }
        const review = `${reviewScore.toFixed(1)}/10 "${site}: ${reviewText}"`;
        
        const fingerprint = `${type}:${name}:${JSON.stringify(design.selections)}`;
        let device = this.state.devices.find(item => item.fingerprint === fingerprint && item.price === price);
        
        if (device) {
            device.inventory += batch;
            device.madeThisMonth = (device.madeThisMonth || 0) + batch;
            device.review = review; // Update review on new batch
        } else {
            device = {
                id: `${type}-${Date.now()}`,
                fingerprint,
                type,
                name,
                inventory: batch,
                madeThisMonth: batch,
                price,
                quality,
                marketValue,
                design: design.selections,
                designLabel: design.label,
                review: review
            };
            this.state.devices.push(device);
        }

        if (customNameEl) customNameEl.value = '';
        UI.updateManuCore();
        UI.notify('Lote terminado', `${batch} unidades de ${name} producidas.\nReseña: ${review}`, 'success');
        LocalSave.save();
    },

    updateDevicePrice(id, rawPrice) {
        const price = Number(rawPrice);
        if (!Number.isFinite(price) || price < 50) {
            return UI.notify('Precio inválido', 'Define un precio de al menos $50.', 'alert');
        }
        const device = this.state.devices.find(item => item.id === id);
        if (!device) return;
        device.price = Math.round(price);
        UI.updateManuCore();
        LocalSave.save();
        UI.notify('Precio actualizado', `${device.name} se venderá por $${device.price.toLocaleString()}.`, 'success');
    },

    processMonthEnd() {
        let revenue = 0;
        let soldUnits = 0;

        this.state.devices.forEach(device => {
            const model = this.config.deviceTypes[device.type];
            if (!model) return;
            
            const demand = Engine.state.marketDemand[model.category] || 1;
            const quality = device.quality || 0;
            const marketValue = device.marketValue || model.marketValue;
            
            const priceFactor = Math.max(0.08, Math.min(1.35, 1.45 - (device.price / marketValue) * 0.65));
            const marketShare = Math.min(0.92, (0.16 + Engine.state.reputation / 280 + quality * 0.07) * priceFactor);
            const potential = Math.max(1, Math.floor((18 + this.state.factoryLevel * 5) * demand * marketShare));
            const sold = Math.min(device.inventory, potential);
            
            device.inventory -= sold;
            soldUnits += sold;
            revenue += sold * device.price;
            device.madeThisMonth = 0;
        });

        this.state.devices = this.state.devices.filter(device => device.inventory > 0);
        return { revenue, soldUnits };
    }
};
