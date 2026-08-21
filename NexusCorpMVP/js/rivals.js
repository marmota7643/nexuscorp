const Rivals = {
    state: {
        companies: [
            { id: 'pear', name: 'Pear Inc.', logo: '🍐', color: '#94a3b8', marketCap: 2500000000, marketShare: 35, sharesOwned: 0, products: 12, reputation: 85 },
            { id: 'samzong', name: 'Samzong Electronics', logo: '📱', color: '#3b82f6', marketCap: 1800000000, marketShare: 28, sharesOwned: 0, products: 18, reputation: 75 },
            { id: 'microtech', name: 'MicroTech Corp', logo: '🖥️', color: '#8b5cf6', marketCap: 1200000000, marketShare: 20, sharesOwned: 0, products: 8, reputation: 70 }
        ],
        newsHistory: [],
        // Cuota de mercado inicial
        playerMarketShare: 15 
    },

    buyShares(companyId, percent) {
        const company = this.state.companies.find(c => c.id === companyId);
        if (!company) return false;
        const costPerPercent = Math.floor(company.marketCap * 0.01);
        const totalCost = costPerPercent * percent;
        if (!Engine.deductMoney(totalCost)) {
            UI.notify('Sin Fondos', `Comprar ${percent}% de ${company.name} cuesta $${totalCost.toLocaleString()}.`, 'alert');
            return false;
        }
        company.sharesOwned += percent;
        // Si posees 51%+, ¡adquisición hostil!
        if (company.sharesOwned >= 51) {
            this.hostileTakeover(company);
        } else {
            UI.notify('📈 Acciones', `Has comprado ${percent}% de ${company.name} por $${totalCost.toLocaleString()}. Posees ${company.sharesOwned}%.`, 'success');
        }
        UI.renderRivals();
        LocalSave.save();
        return true;
    },

    hostileTakeover(company) {
        // Absorber su cuota de mercado
        this.state.playerMarketShare += Math.floor(company.marketShare * 0.7);
        const stolenShare = Math.floor(company.marketShare * 0.7);
        company.marketShare = Math.floor(company.marketShare * 0.3);
        company.sharesOwned = 0;
        Engine.state.reputation += 10;
        const cashBonus = Math.floor(company.marketCap * 0.05);
        Engine.addMoney(cashBonus);
        UI.notify('🏴 ¡ADQUISICIÓN HOSTIL!', `Has tomado el control de ${company.name}. +${stolenShare}% cuota de mercado, +$${cashBonus.toLocaleString()} en activos.`, 'success');
    },

    onMonthEnd() {
        this.state.companies.forEach(company => {
            // Fluctuación de capitalización de mercado (-8% a +8%)
            const change = 1 + (Math.random() * 0.16 - 0.08);
            company.marketCap = Math.floor(company.marketCap * change);
            
            // Lanzamientos de productos rivales (15% de probabilidad)
            if (Math.random() < 0.15) {
                const steal = Math.floor(Math.random() * 3) + 1;
                company.marketShare = Math.min(50, company.marketShare + steal);
                this.state.playerMarketShare = Math.max(1, this.state.playerMarketShare - steal);
                company.products++;
                const news = `${company.name} lanza un nuevo producto y roba ${steal}% de cuota de mercado.`;
                this.state.newsHistory.push({ text: news, date: Engine.state.currentDate.toISOString() });
                UI.notify(`${company.logo} Lanzamiento Rival`, news, 'alert');
            }
            
            // El jugador gana cuota por buena reputación
            if (Engine.state.reputation > 70 && Math.random() < 0.1) {
                const gain = 1;
                this.state.playerMarketShare += gain;
                company.marketShare = Math.max(5, company.marketShare - gain);
            }
        });
        
        // Asegurar que el total no exceda 100
        let totalRival = this.state.companies.reduce((s, c) => s + c.marketShare, 0);
        this.state.playerMarketShare = Math.max(1, 100 - totalRival);
    },

    getPlayerMarketShare() {
        let totalRival = this.state.companies.reduce((s, c) => s + c.marketShare, 0);
        return Math.max(1, 100 - totalRival);
    }
};
