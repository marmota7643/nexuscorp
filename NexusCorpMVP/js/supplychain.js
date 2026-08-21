// supplychain.js - Etapa 2: mercado B2B, proveedores y decisiones Make-or-Buy
const SupplyChain = {
    version: 1,
    state: {
        market: {
            chips: { basePrice: 12, volatility: 0.08, leadDays: 18, quality: 0.88 },
            screens: { basePrice: 34, volatility: 0.10, leadDays: 24, quality: 0.90 },
            batteries: { basePrice: 9, volatility: 0.07, leadDays: 14, quality: 0.86 },
            alloys: { basePrice: 5, volatility: 0.12, leadDays: 10, quality: 0.84 }
        },
        suppliers: [
            { id:'sc_global', name:'Global Components', quality:.84, reliability:.93, priceFactor:.94, capacity:5000000, leadDays:20, financialRisk:.04 },
            { id:'sc_precision', name:'Precision Technologies', quality:.96, reliability:.985, priceFactor:1.13, capacity:1200000, leadDays:14, financialRisk:.01 },
            { id:'sc_volume', name:'VolumeWorks', quality:.78, reliability:.89, priceFactor:.81, capacity:12000000, leadDays:30, financialRisk:.09 }
        ],
        contracts: [],
        factories: [],
        internalOrders: [],
        priceHistory: []
    },

    init(){
        this.load();
        this.normalize();
        this.simulateMarket();
        this.save();
    },

    normalize(){
        const s=this.state;
        ['chips','screens','batteries','alloys'].forEach(k=>{if(!s.market[k])s.market[k]={basePrice:10,volatility:.1,leadDays:20,quality:.85};});
        if(!Array.isArray(s.suppliers))s.suppliers=[];
        if(!Array.isArray(s.contracts))s.contracts=[];
        if(!Array.isArray(s.factories))s.factories=[];
        if(!Array.isArray(s.internalOrders))s.internalOrders=[];
    },

    simulateMarket(){
        Object.values(this.state.market).forEach(m=>{
            const shock=(Math.random()-.5)*2*m.volatility;
            m.currentPrice=Math.max(m.basePrice*.55,m.currentPrice ? m.currentPrice*(1+shock) : m.basePrice*(1+shock));
            m.currentPrice=Math.round(m.currentPrice*100)/100;
        });
        this.state.priceHistory.push({date:new Date().toISOString(), prices:Object.fromEntries(Object.entries(this.state.market).map(([k,v])=>[k,v.currentPrice]))});
        if(this.state.priceHistory.length>24)this.state.priceHistory.shift();
    },

    supplierQuote(supplierId, component, quantity=10000){
        const s=this.state.suppliers.find(x=>x.id===supplierId), m=this.state.market[component];
        if(!s||!m)return null;
        const scale=quantity>1000000?.94:quantity>250000?.97:1;
        return { supplierId, component, quantity, unitPrice:Math.round(m.currentPrice*s.priceFactor*scale*100)/100, total:Math.round(m.currentPrice*s.priceFactor*scale*quantity), quality:s.quality, reliability:s.reliability, leadDays:s.leadDays };
    },

    bestSupplier(component,quantity=10000){
        return this.state.suppliers.map(s=>this.supplierQuote(s.id,component,quantity)).filter(Boolean).sort((a,b)=>(a.unitPrice/a.quality)-(b.unitPrice/b.quality))[0]||null;
    },

    internalCost(component, company){
        const m=this.state.market[component];
        const factories=this.state.factories.filter(f=>f.companyId===company.id&&f.component===component);
        const capacity=factories.reduce((n,f)=>n+f.capacity,0);
        const efficiency=Math.min(1.25,1+(capacity/10000000)*.15);
        const capex=Math.max(0,factories.reduce((n,f)=>n+f.monthlyCapex,0));
        const labor=Math.max(.25,m.basePrice*.16/efficiency);
        const materials=Math.max(.2,m.currentPrice*.58/efficiency);
        return { unitCost:Math.round((labor+materials+capex/Math.max(1,capacity))*100)/100, capacity, quality:Math.min(.99,.70+.22*Math.min(1,capacity/2000000)), capex };
    },

    makeBuyAnalysis(companyId,component,quantity=100000){
        const corp=typeof Corporate!=='undefined' ? Corporate : null;
        const company=corp?.state.subsidiaries.find(c=>c.id===companyId);
        if(!company)return null;
        const buy=this.bestSupplier(component,quantity);
        const make=this.internalCost(component,company);
        return {component,quantity,buy,make,cheaper:buy&&make.unitCost<buy.unitPrice?'make':'buy', savings:buy?Math.abs(make.unitCost-buy.unitPrice)*quantity:0};
    },

    createFactory(companyId,component,capacity=250000){
        const company=Corporate?.state.subsidiaries.find(c=>c.id===companyId); if(!company)return false;
        const safeCap=Math.max(10000,Number(capacity)||250000);
        const capex=Math.round(500000+(safeCap/100000)*90000);
        if(!this.chargeCompany(company,capex))return false;
        this.state.factories.push({id:'fac_'+Date.now(),companyId,component,capacity:safeCap,monthlyCapex:Math.round(capex*.006)});
        company.assets+=capex;
        this.save(); Corporate.save?.(); Corporate.render?.();
        return true;
    },

    chargeCompany(company,amount){
        amount=Math.max(0,Number(amount)||0);
        if(company.cash>=amount){company.cash-=amount;return true;}
        if(typeof Engine!=='undefined' && Engine.state.money>=amount){Engine.state.money-=amount;return true;}
        return false;
    },

    purchase(companyId,component,quantity,supplierId){
        const company=Corporate?.state.subsidiaries.find(c=>c.id===companyId); if(!company)return false;
        const q=this.supplierQuote(supplierId,component,quantity); if(!q)return false;
        if(!this.chargeCompany(company,q.total))return false;
        company.inventory=company.inventory||{}; company.inventory[component]=(company.inventory[component]||0)+quantity;
        this.state.contracts.push({id:'po_'+Date.now(),companyId,supplierId,component,quantity,total:q.total,quality:q.quality,arrivalDays:q.leadDays,status:'ordered'});
        company.expenses+=q.total;
        this.save(); Corporate.save?.(); Corporate.render?.();
        return q;
    },

    transactInternal(sellerId,buyerId,component,quantity,unitPrice){
        const seller=Corporate?.state.subsidiaries.find(c=>c.id===sellerId), buyer=Corporate?.state.subsidiaries.find(c=>c.id===buyerId);
        if(!seller||!buyer||sellerId===buyerId)return false;
        const total=Math.round(quantity*unitPrice);
        if(buyer.cash<total)return false;
        buyer.cash-=total; seller.cash+=total;
        seller.revenue+=total; buyer.expenses+=total;
        buyer.inventory=buyer.inventory||{}; buyer.inventory[component]=(buyer.inventory[component]||0)+quantity;
        this.state.internalOrders.push({date:new Date().toISOString(),sellerId,buyerId,component,quantity,unitPrice,total});
        this.save(); Corporate.save?.(); Corporate.render?.();
        return true;
    },

    endMonth(){
        this.simulateMarket();
        this.state.contracts=this.state.contracts.map(o=>{if(o.status==='ordered'){o.arrivalDays-=30;if(o.arrivalDays<=0)o.status='delivered';}return o;});
        this.save();
    },

    save(){try{localStorage.setItem('nexuscorp_supplychain_v1',JSON.stringify(this.state));}catch(e){}},
    load(){try{const x=JSON.parse(localStorage.getItem('nexuscorp_supplychain_v1')||'null');if(x)this.state=Object.assign(this.state,x);}catch(e){}}
};
