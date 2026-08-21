// techstart.js - Módulo de desarrollo y personal

const TechStart = {
    state: {
        devs: 0,
        projects: [], // {id, name, progress, requiredWork, completed, type}
        activeProducts: [] // {id, name, monthlySales}
    },
    
    config: {
        devSalary: 2000,
        hireCost: 500, // Costo de headhunting
        devWorkPerDay: 5 // Puntos de progreso que aporta 1 dev al día
    },

    hireDev() {
        if (Engine.deductMoney(this.config.hireCost)) {
            this.state.devs++;
            UI.updateTechStats();
            UI.notify('Nuevo Empleado', `Has contratado un nuevo Dev. Salario: $${this.config.devSalary}/mes`, 'success');
            LocalSave.save();
        } else {
            UI.notify('Sin Fondos', 'No tienes suficiente liquidez para contratar.', 'alert');
        }
    },

    startProject() {
        const typeSelect = document.getElementById('software-type').value;
        let cost = 5000;
        let work = 150;
        let namePrefix = "App";

        if (typeSelect === 'social') { cost = 2000; work = 100; namePrefix = "SocialNexo"; }
        if (typeSelect === 'game') { cost = 8000; work = 250; namePrefix = "NexoGame"; }
        if (typeSelect === 'enterprise') { cost = 15000; work = 400; namePrefix = "CorpSuite"; }

        if (this.state.devs === 0) {
            UI.notify('Atención', 'Necesitas contratar al menos a un Desarrollador primero.', 'alert');
            return;
        }

        if (Engine.deductMoney(cost)) {
            const project = {
                id: Date.now(),
                name: `${namePrefix} v${this.state.projects.length + this.state.activeProducts.length + 1}.0`,
                type: typeSelect,
                progress: 0,
                requiredWork: work,
                completed: false
            };
            this.state.projects.push(project);
            UI.renderProjects();
            UI.notify('Proyecto Iniciado', `Desarrollo de ${project.name} en marcha.`, 'success');
            LocalSave.save();
        } else {
            UI.notify('Sin Fondos', `Cuesta $${cost.toLocaleString()} iniciar este proyecto.`, 'alert');
        }
    },

    onDayPass() {
        if (this.state.devs === 0) return;

        // Repartir trabajo entre proyectos activos
        const activeProjects = this.state.projects.filter(p => !p.completed);
        if (activeProjects.length > 0) {
            const workPerProject = (this.state.devs * this.config.devWorkPerDay) / activeProjects.length;
            
            activeProjects.forEach(p => {
                p.progress += workPerProject;
                if (p.progress >= p.requiredWork) {
                    p.progress = p.requiredWork;
                    p.completed = true;
                    this.finishProject(p);
                }
            });
            UI.renderProjects(); // Refresh total al cambiar día
        }
    },

    updateVisualProgress() {
        // Actualiza la barra de UI de forma suave basado en el estado
        this.state.projects.forEach(p => {
            if (!p.completed) {
                UI.updateProjectBar(p.id, (p.progress / p.requiredWork) * 100);
            }
        });
    },

    finishProject(project) {
        // Calcular calidad (simulada)
        const rating = (Math.random() * 4 + 6).toFixed(1); // 6.0 a 10.0
        
        let baseSales = 0;
        let repBoost = 0;

        // Potencial de ventas mensual según tipo
        if (project.type === 'social') baseSales = 1500;
        if (project.type === 'game') baseSales = 5000;
        if (project.type === 'enterprise') baseSales = 8000;

        if (rating >= 9.0) {
            baseSales *= 2.5;
            repBoost = 5;
            UI.notify('¡Éxito Rotundo!', `${project.name} obtuvo un ${rating}/10. Excelente previsión de ventas.`, 'success');
        } else if (rating >= 7.0) {
            baseSales *= 1.2;
            repBoost = 2;
            UI.notify('Buen Lanzamiento', `${project.name} obtuvo un ${rating}/10.`, 'success');
        } else {
            baseSales *= 0.5; // Fracaso
            repBoost = -2;
            UI.notify('Lanzamiento Mediocre', `${project.name} obtuvo un ${rating}/10. Las ventas serán bajas.`, 'alert');
        }

        Engine.state.reputation = Math.min(100, Math.max(0, Engine.state.reputation + repBoost));
        UI.updateReputation();
        
        // Añadir a productos activos para generar ingreso pasivo
        this.state.activeProducts.push({
            id: project.id,
            name: project.name,
            monthlySales: Math.floor(baseSales)
        });
        
        UI.renderProjects();
        UI.renderActiveProducts();
        LocalSave.save();
        
        // Quitarlo de la lista de desarrollo
        setTimeout(() => {
            this.state.projects = this.state.projects.filter(p => p.id !== project.id);
            UI.renderProjects();
        }, 3000);
    }
};
