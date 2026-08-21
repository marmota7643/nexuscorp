const Marketing = {
    state: {
        activeCampaigns: [],
        currentHype: 0,
        totalSpent: 0,
        campaignHistory: []
    },
    config: {
        campaigns: [
            { id: 'leaks', name: 'Filtraciones en Foros', cost: 5000, hypeBoost: 8, icon: '🕵️', cooldownDays: 7, description: 'Filtra renders y specs en foros de tecnología' },
            { id: 'social', name: 'Campaña en Redes', cost: 15000, hypeBoost: 15, icon: '📱', cooldownDays: 14, description: 'Marketing viral en redes sociales' },
            { id: 'influencers', name: 'Patrocinio Influencers', cost: 40000, hypeBoost: 25, icon: '⭐', cooldownDays: 21, description: 'Envía prototipos a YouTubers tech' },
            { id: 'billboard', name: 'Vallas Publicitarias', cost: 25000, hypeBoost: 12, icon: '🏙️', cooldownDays: 30, description: 'Campaña masiva en ciudades principales' },
            { id: 'keynote', name: 'Evento Keynote', cost: 100000, hypeBoost: 50, icon: '🎤', cooldownDays: 60, description: 'Organiza un evento de presentación épico' }
        ]
    },

    launchCampaign(id) {
        const campaign = this.config.campaigns.find(c => c.id === id);
        if (!campaign) return false;
        if (!Engine.deductMoney(campaign.cost)) {
            UI.notify('Sin Fondos', `La campaña "${campaign.name}" cuesta $${campaign.cost.toLocaleString()}.`, 'alert');
            return false;
        }
        this.state.currentHype = Math.min(100, this.state.currentHype + campaign.hypeBoost);
        this.state.totalSpent += campaign.cost;
        this.state.activeCampaigns.push({ id, launchedAt: Engine.state.currentDate.toISOString() });
        this.state.campaignHistory.push({ id, name: campaign.name, cost: campaign.cost, date: Engine.state.currentDate.toISOString() });
        UI.notify(`${campaign.icon} ${campaign.name}`, `¡Hype +${campaign.hypeBoost}%! Hype actual: ${this.state.currentHype}%`, 'success');
        UI.renderMarketing();
        LocalSave.save();
        return true;
    },

    consumeHype() {
        let multiplier = 1.0 + (this.state.currentHype / 50);
        // Mantener 10% residual
        this.state.currentHype = Math.max(0, Math.floor(this.state.currentHype * 0.1)); 
        this.state.activeCampaigns = [];
        return parseFloat(multiplier.toFixed(2));
    },

    onDayPass() {
        // Decaimiento natural del hype: -0.5% por día
        if (this.state.currentHype > 0) {
            this.state.currentHype = Math.max(0, this.state.currentHype - 0.5);
        }
    },

    onMonthEnd() {
        // Limpiar campañas antiguas
        this.state.activeCampaigns = [];
    }
};
