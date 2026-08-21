// engine.js — Motor Económico y control del Tiempo
const Engine = {
    state: {
        money: 50000,
        reputation: 50,
        monthlyIncome: 0,
        currentDate: new Date(2032, 0, 1),
        timeSpeed: 1,
        sandboxMode: false,
        lastTick: 0,
        debt: 0,
        customInterest: 0.05,
        companyName: 'NEXUS CORP',
        marketTrend: 'estable',
        marketDemand: {
            phones: 1,
            laptops: 1,
            tablets: 1,
            wearables: 1,
            audio: 1,
            consoles: 1,
            tvs: 1
        },
        companyValuation: 100000,
        publicShares: 0,
        isPublic: false,
        cloudRevision: 0,
        achievedMilestones: []
    },

    config: {
        msPerDay: 2000,
    },

    expenses: {
        rent: 2000,
    },

    init() {
        this.lastTick = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    },

    setSpeed(speed) {
        // Aceptar 0, 1, 5, 10, 25
        this.state.timeSpeed = speed;
        UI.updateTimeControls(speed);
        if (speed > 0) UI.notify('Tiempo resumido', `Velocidad: ${speed}x`);
        else UI.notify('Juego Pausado', 'El tiempo se ha detenido', 'alert');
    },

    addMoney(amount) {
        this.state.money += amount;
        UI.updateMoney();
    },

    deductMoney(amount) {
        if (this.state.sandboxMode) return true;
        if (this.state.money >= amount) {
            this.state.money -= amount;
            UI.updateMoney();
            return true;
        }
        return false;
    },

    advanceDay() {
        this.state.currentDate.setDate(this.state.currentDate.getDate() + 1);
        UI.updateDate();
        if (typeof TechStart !== 'undefined' && TechStart.onDayPass) TechStart.onDayPass();
        if (typeof ManuCore !== 'undefined' && ManuCore.onDayPass) ManuCore.onDayPass();
        if (typeof Research !== 'undefined' && Research.onDayPass) Research.onDayPass();
        if (typeof HR !== 'undefined' && HR.onDayPass) HR.onDayPass();
        if (typeof Marketing !== 'undefined' && Marketing.onDayPass) Marketing.onDayPass();
        LocalSave.save();
        if (this.state.currentDate.getDate() === 1) this.processMonthEnd();
        // Evento mundial aleatorio (2% de probabilidad por día)
        if (Math.random() < 0.02) this.triggerWorldEvent();
    },

    triggerWorldEvent() {
        const events = [
            { name: 'Escasez de chips', effect: () => { /* los componentes cuestan 2x por 30 días */ }, message: 'Los costos de fabricación aumentarán temporalmente.' },
            { name: 'Boom tecnológico', effect: () => { for (let key in this.state.marketDemand) this.state.marketDemand[key] += 0.3; }, message: 'La demanda de mercado ha aumentado un 30%.' },
            { name: 'Recesión económica', effect: () => { for (let key in this.state.marketDemand) this.state.marketDemand[key] -= 0.2; }, message: 'La demanda de mercado ha caído un 20%.' },
            { name: 'Hackeo masivo', effect: () => { this.state.reputation -= 10; }, message: 'Tu reputación ha bajado 10 puntos.' },
            { name: 'Feria CES', effect: () => { this.state.reputation += 5; }, message: 'Gran presentación, reputación +5.' },
            { name: 'Subvención gubernamental', effect: () => { this.addMoney(25000); }, message: 'Has recibido $25,000 del gobierno.' },
            { name: 'Demanda judicial', effect: () => { this.deductMoney(30000); }, message: 'Pagas $30,000 en costos legales.' },
            { name: 'Viral en redes', effect: () => { this.state.reputation += 8; }, message: 'Tus productos se hacen virales. Reputación +8.' },
        ];
        const event = events[Math.floor(Math.random() * events.length)];
        event.effect();
        if (typeof UI !== 'undefined' && UI.updateReputation) UI.updateReputation();
        UI.notify('📰 Evento Mundial', `${event.name}: ${event.message}`, 'info');
    },

    processMonthEnd() {
        const interest = this.state.debt * (this.state.customInterest || 0.05);
        let techSalaries = (typeof TechStart !== 'undefined') ? TechStart.state.devs * TechStart.config.devSalary : 0;
        let researchSalaries = (typeof Research !== 'undefined') ? Research.state.researchers * Research.config.researcherSalary : 0;
        let hrSalaries = (typeof HR !== 'undefined') ? HR.state.employees.reduce((sum, e) => sum + e.salary, 0) : 0;
        let totalExpenses = this.expenses.rent + techSalaries + researchSalaries + hrSalaries + interest;

        // Ingresos pasivos
        let totalSales = 0;
        if (typeof TechStart !== 'undefined') {
            TechStart.state.activeProducts.forEach(prod => {
                totalSales += prod.monthlySales;
                prod.monthlySales = Math.floor(prod.monthlySales * 0.85);
            });
        }

        let hardwareResult = { revenue: 0, soldUnits: 0 };
        if (typeof ManuCore !== 'undefined' && ManuCore.processMonthEnd) {
            hardwareResult = ManuCore.processMonthEnd();
        }
        totalSales += hardwareResult.revenue;

        this.state.monthlyIncome = totalSales;
        this.addMoney(totalSales);

        if (typeof Rivals !== 'undefined' && Rivals.onMonthEnd) {
            Rivals.onMonthEnd();
        }

        this.state.companyValuation += Math.floor(totalSales * 0.5) + (this.state.reputation * 1000);

        let profit = totalSales - totalExpenses;
        if (this.state.isPublic && profit > 0) {
            let dividends = Math.floor(profit * 0.1);
            totalExpenses += dividends;
        }

        if (this.deductMoney(totalExpenses)) {
            UI.notify('Cierre de Mes', `Ventas: $${totalSales.toLocaleString()} (${hardwareResult.soldUnits} equipos) | Gastos: $${totalExpenses.toLocaleString()}`, 'info');
        } else {
            this.state.money -= totalExpenses;
            UI.updateMoney();
            UI.notify('¡PELIGRO!', `No pudiste pagar $${totalExpenses.toLocaleString()}.`, 'alert');
            this.state.reputation = Math.max(0, this.state.reputation - 15);
            if (typeof UI !== 'undefined' && UI.updateReputation) UI.updateReputation();
        }

        this.checkCityGrowth();
        
        if (typeof UI !== 'undefined') {
            if (UI.renderActiveProducts) UI.renderActiveProducts();
            if (UI.updateManuCore) UI.updateManuCore();
        }
        this.refreshMarket();

        if (typeof Rivals !== 'undefined' && Rivals.state) {
            let totalRivalShare = Rivals.state.companies.reduce((sum, c) => sum + c.marketShare, 0);
            let playerShare = Math.max(0.01, (100 - totalRivalShare) / 100);
            for (let key in this.state.marketDemand) {
                this.state.marketDemand[key] = Number((this.state.marketDemand[key] * playerShare).toFixed(2));
            }
        }

        if (typeof HR !== 'undefined' && HR.processMonthEnd) HR.processMonthEnd();
        if (typeof Marketing !== 'undefined' && Marketing.onMonthEnd) Marketing.onMonthEnd();

        this.checkMilestones();

        LocalSave.save();
    },

    checkMilestones() {
        const milestones = [
            { id: 'first_100k', check: () => this.state.money >= 100000, reward: 5, message: '¡Primer $100K!' },
            { id: 'first_1m', check: () => this.state.money >= 1000000, reward: 10, message: '¡Primer millón!' },
            { id: 'first_10m', check: () => this.state.money >= 10000000, reward: 15, message: '¡$10 millones!' },
            { id: 'rep_80', check: () => this.state.reputation >= 80, reward: 0, message: '¡Marca de prestigio!' },
        ];
        
        milestones.forEach(m => {
            if (!this.state.achievedMilestones?.includes(m.id) && m.check()) {
                if (!this.state.achievedMilestones) this.state.achievedMilestones = [];
                this.state.achievedMilestones.push(m.id);
                this.state.reputation = Math.min(100, this.state.reputation + m.reward);
                UI.notify('🏆 Hito Alcanzado', m.message, 'success');
                if (typeof UI !== 'undefined' && UI.updateReputation) UI.updateReputation();
            }
        });
    },

    goPublic() {
        if (this.state.isPublic) return false;
        this.state.isPublic = true;
        this.state.publicShares = 100000;
        const cashInjection = Math.floor(this.state.companyValuation * 0.2);
        this.addMoney(cashInjection);
        UI.notify('¡Oferta Pública Inicial!', `Tu empresa ha salido a bolsa. Inyección de capital: $${cashInjection.toLocaleString()}`, 'success');
        return true;
    },

    takeLoan(amount) {
        this.state.debt += amount;
        this.addMoney(amount);
        UI.updateBank();
        UI.notify('Préstamo Aprobado', `+$${amount.toLocaleString()}`, 'success');
    },

    payLoan(amount) {
        if (this.state.debt === 0) return;
        let payment = Math.min(amount, this.state.debt);
        if (this.deductMoney(payment)) {
            this.state.debt -= payment;
            UI.updateBank();
            UI.notify('Abono', `-$${payment.toLocaleString()} de deuda`, 'success');
        } else {
            UI.notify('Sin Fondos', 'No alcanza para este abono.', 'alert');
        }
    },

    checkCityGrowth() {
        if (this.state.money >= 50000000) {
            UI.updateCityLevel('Imperio Global');
        } else if (this.state.money >= 10000000) {
            UI.updateCityLevel('Megacorp');
        } else if (this.state.money >= 2000000) {
            UI.updateCityLevel('Multinacional');
        } else if (this.state.money >= 500000) {
            UI.updateCityLevel('Corporación');
        } else if (this.state.money >= 200000) {
            UI.updateCityLevel('Pyme Tech');
        } else if (this.state.money >= 50000) {
            UI.updateCityLevel('Startup');
        } else {
            UI.updateCityLevel('Garage');
        }
    },

    refreshMarket() {
        const categories = ['phones', 'laptops', 'tablets', 'wearables', 'audio', 'consoles', 'tvs'];
        const numHot = Math.random() > 0.5 ? 2 : 1;
        const shuffled = [...categories].sort(() => 0.5 - Math.random());
        const hotCategories = shuffled.slice(0, numHot);
        
        categories.forEach(category => {
            if (hotCategories.includes(category)) {
                const volatility = 1.25 + Math.random() * 0.30;
                this.state.marketDemand[category] = Number(volatility.toFixed(2));
            } else {
                const volatility = 0.72 + Math.random() * 0.35;
                this.state.marketDemand[category] = Number(volatility.toFixed(2));
            }
        });
        
        let names = hotCategories.map(c => {
            const translation = {
                phones: 'móviles', laptops: 'portátiles', tablets: 'tablets',
                wearables: 'wearables', audio: 'audio', consoles: 'consolas', tvs: 'televisores'
            };
            return translation[c] || c;
        });
        this.state.marketTrend = `fuerte demanda de ${names.join(' y ')}`;
        UI.renderMarket();
    },

    gameLoop(currentTime) {
        if (this.state.timeSpeed > 0) {
            const deltaTime = currentTime - this.lastTick;
            const actualMsPerDay = this.config.msPerDay / this.state.timeSpeed;
            if (deltaTime >= actualMsPerDay) {
                this.advanceDay();
                this.lastTick = currentTime - (deltaTime % actualMsPerDay);
            }
        } else {
            this.lastTick = currentTime;
        }

        if (this.state.timeSpeed > 0 && typeof TechStart !== 'undefined' && TechStart.updateVisualProgress) {
            TechStart.updateVisualProgress();
        }
        requestAnimationFrame(this.gameLoop.bind(this));
    }
};
