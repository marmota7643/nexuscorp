// corporate.js - NexusCorp Group: subsidiarias, autonomía, make-or-buy y gobierno corporativo
const Corporate = {
    key: 'nexuscorp_corporate_v1',
    state: {
        version: 1,
        autonomyDefaults: 'supervised',
        subsidiaries: [],
        suppliers: [
            { id:'sup_generic', name:'Proveedor Global Independiente', reliability:0.94, quality:0.86, priceFactor:1.00, capacity:1000000 },
            { id:'sup_premium', name:'Proveedor Premium', reliability:0.985, quality:0.96, priceFactor:1.14, capacity:500000 },
            { id:'sup_scale', name:'Mega Components', reliability:0.91, quality:0.82, priceFactor:0.86, capacity:5000000 }
        ],
        policies: {},
        proposals: [],
        makeBuy: {},
        transactions: []
    },

    init() {
        this.load();
        if (!this.state.subsidiaries.length) {
            this.state.subsidiaries.push(this.createCompanyObject('Nexus Mobile', 'hardware', 'supervised'));
            this.state.subsidiaries.push(this.createCompanyObject('Nexus Semiconductor', 'semiconductors', 'autonomous'));
            this.state.subsidiaries[0].parentId = 'nexuscorp';
            this.state.subsidiaries[1].parentId = 'nexuscorp';
        }
        this.patchMonthEnd();
        this.mountUI();
        this.render();
        this.save();
    },

    createCompanyObject(name, sector, autonomy) {
        return {
            id: 'co_' + Math.random().toString(36).slice(2,10), name, sector,
            ownership: 100, autonomy,
            cash: 0, revenue: 0, expenses: 0, profit: 0, debt: 0,
            budget: 0, strategy: 'balanced', riskTolerance: 0.5,
            ceo: { name: this.randomCEO(), aggressiveness: Math.round(30+Math.random()*60), innovation: Math.round(30+Math.random()*65), costControl: Math.round(35+Math.random()*60), risk: Math.round(20+Math.random()*70) },
            employees: 0, assets: 0, reputation: 50, proposals: [],
            makeBuy: {}, suppliers: [], parentId: 'nexuscorp'
        };
    },

    randomCEO() {
        const first=['Alex','Marta','Daniel','Sofía','Javier','Elena','Carlos','Laura','Adrián','Valeria'];
        const last=['Ortega','Navarro','Vega','Santos','Méndez','Ríos','Torres','Fuentes','Castro','Luna'];
        return first[Math.floor(Math.random()*first.length)]+' '+last[Math.floor(Math.random()*last.length)];
    },

    addSubsidiary(name, sector='technology', ownership=100, autonomy='supervised') {
        const company=this.createCompanyObject(name, sector, autonomy);
        company.ownership=Math.max(1,Math.min(100,Number(ownership)||100));
        const setupCost=Math.max(25000, 150000*(1+Math.max(0,company.ownership-50)/100));
        if (!Engine.deductMoney(setupCost)) return false;
        company.assets=setupCost;
        this.state.subsidiaries.push(company);
        this.propose(company, 'capital', `Nueva filial ${name}`, setupCost, 'fundación');
        this.save(); this.render();
        return true;
    },

    propose(company, type, title, amount, reason) {
        const p={id:'p_'+Date.now()+Math.random().toString(36).slice(2,6), companyId:company.id, type, title, amount:Math.round(amount||0), reason, status:'pending', date:Engine.state.currentDate.toISOString()};
        company.proposals.push(p); this.state.proposals.push(p); return p;
    },

    autonomyLabel(a){ return ({direct:'Control directo',supervised:'Dirección supervisada',autonomous:'Autonomía estratégica',independent:'Autonomía total'})[a]||a; },

    setAutonomy(id, autonomy) {
        const c=this.state.subsidiaries.find(x=>x.id===id); if(!c) return;
        c.autonomy=autonomy; this.save(); this.render();
    },

    setMakeBuy(id, item, mode, supplierId=null) {
        const c=this.state.subsidiaries.find(x=>x.id===id); if(!c) return;
        c.makeBuy[item]={mode, supplierId}; this.save(); this.render();
    },

    patchMonthEnd() {
        if (this._patched || !Engine || !Engine.processMonthEnd) return;
        this._patched=true;
        const original=Engine.processMonthEnd.bind(Engine);
        Engine.processMonthEnd=()=>{
            original();
            this.onMonthEnd();
        };
    },

    onMonthEnd() {
        this.state.subsidiaries.forEach(c=>this.runCompany(c));
        this.resolveAutonomousProposals();
        this.save(); this.render();
    },

    runCompany(c) {
        const strategy={growth:{sales:1.12,cost:1.06},profit:{sales:0.96,cost:0.88},innovation:{sales:1.04,cost:1.18},balanced:{sales:1.02,cost:1.00}}[c.strategy]||{sales:1,cost:1};
        const internalSales=c.revenue||0;
        const base=Math.max(0, internalSales*strategy.sales + c.assets*0.0025);
        const operating=Math.max(500, (c.employees*3500 + c.assets*0.001 + c.budget*0.08)*strategy.cost);
        c.revenue=Math.round(base); c.expenses=Math.round(operating); c.profit=c.revenue-c.expenses;
        c.cash+=c.profit;
        if(c.cash<0) { c.debt+=Math.abs(c.cash); c.cash=0; }
        c.reputation=Math.max(0,Math.min(100,c.reputation+(c.profit>0?0.3:-0.8)));
        // Empresas autónomas generan propuestas en función de sus directivos.
        if(c.autonomy!=='direct' && c.ceo.innovation>70 && Math.random()<0.18){
            const amount=Math.max(50000,Math.round(c.assets*0.08+100000));
            if(!c.proposals.some(p=>p.status==='pending'&&p.type==='investment')) this.propose(c,'investment','Propuesta de expansión tecnológica',amount,'El equipo directivo detecta una oportunidad de crecimiento.');
        }
    },

    resolveAutonomousProposals() {
        this.state.subsidiaries.forEach(c=>c.proposals.filter(p=>p.status==='pending').forEach(p=>{
            if(c.autonomy==='independent' || (c.autonomy==='autonomous' && p.amount<=Math.max(50000,c.budget*0.25))) {
                const cost=p.amount;
                if(c.cash>=cost){ c.cash-=cost; c.assets+=cost; p.status='approved-auto'; }
            }
        }));
    },

    approveProposal(id) {
        const p=this.state.proposals.find(x=>x.id===id); if(!p||p.status!=='pending') return;
        const c=this.state.subsidiaries.find(x=>x.id===p.companyId); if(!c) return;
        if(!Engine.deductMoney(p.amount)) { UI.notify('Sin fondos','NexusCorp no tiene liquidez suficiente para aprobar esta operación.','alert'); return; }
        c.cash+=p.amount; c.assets+=p.amount; p.status='approved';
        this.save(); this.render(); UI.notify('Decisión aprobada',`${c.name}: ${p.title}`,'success');
    },

    rejectProposal(id) {
        const p=this.state.proposals.find(x=>x.id===id); if(!p) return; p.status='rejected'; this.save(); this.render();
    },

    makeBuyDecision(companyId,item) {
        const c=this.state.subsidiaries.find(x=>x.id===companyId); if(!c) return;
        const current=c.makeBuy[item]?.mode||'buy';
        const next=current==='buy'?'make':'buy';
        const supplier=current==='buy'?(this.state.suppliers[0]?.id||null):null;
        this.setMakeBuy(companyId,item,next,supplier);
        UI.notify('Estrategia de suministro',`${c.name}: ${item} → ${next==='make'?'fabricación interna':'compra a proveedor'}`,'info');
    },

    mountUI() {
        if(document.getElementById('corporate-dock')) return;
        const dock=document.createElement('div'); dock.id='corporate-dock';
        dock.innerHTML=`<button id="corporate-open" class="btn-primary">🏢 Grupo Corporativo</button><div id="corporate-panel" class="corporate-panel hidden"></div>`;
        document.body.appendChild(dock);
        document.getElementById('corporate-open').onclick=()=>document.getElementById('corporate-panel').classList.toggle('hidden');
        const s=document.createElement('style'); s.textContent=`#corporate-dock{position:fixed;right:18px;bottom:18px;z-index:9999}#corporate-panel{width:min(720px,calc(100vw - 36px));max-height:78vh;overflow:auto;margin-bottom:8px;padding:18px;background:rgba(12,16,24,.97);border:1px solid rgba(255,255,255,.12);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.45);color:#fff}.corp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.corp-card{padding:12px;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:rgba(255,255,255,.04)}.corp-card select,.corp-card button{margin-top:7px;width:100%}.corp-proposal{padding:10px;border-left:3px solid #55d6ff;margin:8px 0;background:rgba(255,255,255,.04)}.corp-muted{opacity:.68;font-size:.85em}`; document.head.appendChild(s);
    },

    render() {
        const panel=document.getElementById('corporate-panel'); if(!panel) return;
        panel.innerHTML=`<h2>🏢 NexusCorp Group</h2><p class="corp-muted">Controla el grupo o deja que cada empresa tome decisiones. La autonomía determina qué puede decidir su dirección.</p><div class="corp-grid">${this.state.subsidiaries.map(c=>`<div class="corp-card"><strong>${this.esc(c.name)}</strong><div class="corp-muted">${this.esc(c.sector)} · ${c.ownership}% propiedad</div><div>CEO: ${this.esc(c.ceo.name)}</div><div>Beneficio: $${Math.round(c.profit).toLocaleString()}</div><div>Reputación: ${Math.round(c.reputation)}</div><select data-auto="${c.id}"><option value="direct" ${c.autonomy==='direct'?'selected':''}>Control directo</option><option value="supervised" ${c.autonomy==='supervised'?'selected':''}>Dirección supervisada</option><option value="autonomous" ${c.autonomy==='autonomous'?'selected':''}>Autonomía estratégica</option><option value="independent" ${c.autonomy==='independent'?'selected':''}>Autonomía total</option></select><button data-mb="${c.id}">⚙️ Make / Buy</button></div>`).join('')}</div><h3>📨 Decisiones pendientes</h3>${this.state.proposals.filter(p=>p.status==='pending').map(p=>{const c=this.state.subsidiaries.find(x=>x.id===p.companyId);return `<div class="corp-proposal"><strong>${this.esc(p.title)}</strong><br>${c?this.esc(c.name):'Empresa'} · $${p.amount.toLocaleString()}<br><span class="corp-muted">${this.esc(p.reason)}</span><br><button data-approve="${p.id}">Aprobar</button> <button data-reject="${p.id}">Rechazar</button></div>`}).join('')||'<p class="corp-muted">No hay decisiones pendientes.</p>'}<h3>🏭 Comprar o fabricar</h3><p class="corp-muted">La decisión se guarda por empresa. La siguiente etapa conectará estas políticas con costes reales de ManuCore y proveedores.</p><button id="corp-new">＋ Crear subsidiaria</button>`;
        panel.querySelectorAll('[data-auto]').forEach(e=>e.onchange=()=>this.setAutonomy(e.dataset.auto,e.value));
        panel.querySelectorAll('[data-approve]').forEach(e=>e.onclick=()=>this.approveProposal(e.dataset.approve));
        panel.querySelectorAll('[data-reject]').forEach(e=>e.onclick=()=>this.rejectProposal(e.dataset.reject));
        panel.querySelectorAll('[data-mb]').forEach(e=>e.onclick=()=>{const item=prompt('Componente/servicio a decidir (ej. SoC, pantalla, batería):');if(item)this.makeBuyDecision(e.dataset.mb,item);});
        const b=document.getElementById('corp-new'); if(b)b.onclick=()=>{const n=prompt('Nombre de la subsidiaria:');if(n)this.addSubsidiary(n,'technology',100,'supervised');};
    },

    save(){try{localStorage.setItem(this.key,JSON.stringify(this.state));}catch(e){}},
    load(){try{const raw=localStorage.getItem(this.key);if(raw){const d=JSON.parse(raw);this.state=Object.assign(this.state,d);}}catch(e){}},
    esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
};
