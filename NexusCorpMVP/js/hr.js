const HR = {
    state: {
        // 0: Garaje (cap 3), 1: Oficina (cap 10), 2: Campus (cap 25), 3: Rascacielos (cap 50)
        officeLevel: 0, 
        employees: []
    },
    config: {
        offices: [
            { level: 0, name: 'Garaje', capacity: 3, rent: 0 },
            { level: 1, name: 'Oficina Startup', capacity: 10, rent: 3000 },
            { level: 2, name: 'Campus Tech', capacity: 25, rent: 12000 },
            { level: 3, name: 'Rascacielos Corp', capacity: 50, rent: 35000 }
        ],
        // Costo para mejorar A este nivel
        officeCosts: [0, 50000, 250000, 1000000], 
        roles: [
            { id: 'designer', name: 'Diseñador', icon: '🎨', salaryRange: [1800, 3500], skillEffect: 'Mejora calidad visual de productos' },
            { id: 'programmer', name: 'Programador', icon: '💻', salaryRange: [2000, 4000], skillEffect: 'Acelera desarrollo de software' },
            { id: 'engineer', name: 'Ingeniero', icon: '⚙️', salaryRange: [2200, 4500], skillEffect: 'Mejora I+D y fabricación' },
            { id: 'tester', name: 'Tester', icon: '🔍', salaryRange: [1500, 2800], skillEffect: 'Reduce bugs y mejora reseñas' },
            { id: 'marketer', name: 'Marketing', icon: '📢', salaryRange: [1800, 3200], skillEffect: 'Aumenta efectividad del hype' }
        ],
        firstNames: ['Carlos','María','Jorge','Ana','Luis','Sofía','Diego','Valentina','Pablo','Camila','Andrés','Isabella','Mateo','Lucía','Santiago','Emma','Daniel','Martina','Tomás','Laura'],
        lastNames: ['García','López','Martínez','Rodríguez','Hernández','Torres','Ramírez','Cruz','Flores','Moreno','Jiménez','Reyes','Díaz','Vargas','Romero']
    },

    generateEmployee(roleId) {
        const role = this.config.roles.find(r => r.id === roleId);
        if (!role) return null;
        const firstName = this.config.firstNames[Math.floor(Math.random() * this.config.firstNames.length)];
        const lastName = this.config.lastNames[Math.floor(Math.random() * this.config.lastNames.length)];
        const skill = Math.floor(Math.random() * 51) + 40; // 40-90
        const salary = Math.floor(role.salaryRange[0] + (skill / 100) * (role.salaryRange[1] - role.salaryRange[0]));
        return {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            name: `${firstName} ${lastName.charAt(0)}.`,
            role: role.name,
            roleId: roleId,
            icon: role.icon,
            skill: skill,
            energy: 100,
            salary: salary,
            hiredAt: new Date().toISOString()
        };
    },

    hireEmployee(roleId) {
        const office = this.config.offices[this.state.officeLevel];
        if (this.state.employees.length >= office.capacity) {
            UI.notify('Oficina Llena', `Tu ${office.name} solo permite ${office.capacity} empleados. Mejora tu oficina.`, 'alert');
            return false;
        }
        const hireCost = 500;
        if (!Engine.deductMoney(hireCost)) {
            UI.notify('Sin Fondos', `Contratar cuesta $${hireCost}.`, 'alert');
            return false;
        }
        const emp = this.generateEmployee(roleId);
        if (!emp) return false;
        this.state.employees.push(emp);
        UI.notify('✅ Contratación', `${emp.name} (${emp.role}) se une al equipo. Habilidad: ${emp.skill}/100`, 'success');
        UI.renderHR();
        LocalSave.save();
        return true;
    },

    fireEmployee(id) {
        const emp = this.state.employees.find(e => e.id === id);
        if (!emp) return false;
        this.state.employees = this.state.employees.filter(e => e.id !== id);
        UI.notify('Despido', `${emp.name} ha sido despedido/a.`, 'info');
        UI.renderHR();
        LocalSave.save();
        return true;
    },

    upgradeOffice() {
        if (this.state.officeLevel >= 3) {
            UI.notify('Máximo Nivel', 'Ya tienes la mejor oficina posible.', 'alert');
            return false;
        }
        const nextLevel = this.state.officeLevel + 1;
        const cost = this.config.officeCosts[nextLevel];
        if (!Engine.deductMoney(cost)) {
            UI.notify('Sin Fondos', `Mejorar la oficina cuesta $${cost.toLocaleString()}.`, 'alert');
            return false;
        }
        this.state.officeLevel = nextLevel;
        const office = this.config.offices[nextLevel];
        UI.notify('🏢 Oficina Mejorada', `Te has mudado a: ${office.name} (Capacidad: ${office.capacity})`, 'success');
        UI.renderHR();
        LocalSave.save();
        return true;
    },

    onDayPass() {
        this.state.employees.forEach(emp => {
            emp.energy = Math.max(0, emp.energy - (0.5 + Math.random() * 0.5));
            // Recuperación de fin de semana
            const day = Engine.state.currentDate.getDay();
            if (day === 0 || day === 6) emp.energy = Math.min(100, emp.energy + 15);
        });
    },

    processMonthEnd() {
        // Ya manejado por el motor - esto es para lógica extra
        // Crecimiento de habilidad para empleados
        this.state.employees.forEach(emp => {
            if (emp.energy > 30) {
                emp.skill = Math.min(100, emp.skill + Math.floor(Math.random() * 2));
            }
        });
    },

    getCapacityForRole(roleId) {
        return this.state.employees
            .filter(emp => emp.roleId === roleId && emp.energy > 10)
            .reduce((total, emp) => total + emp.skill * (emp.energy / 100), 0);
    },

    getTotalSalaries() {
        return this.state.employees.reduce((sum, emp) => sum + emp.salary, 0);
    },

    getOfficeRent() {
        return this.config.offices[this.state.officeLevel].rent;
    }
};
