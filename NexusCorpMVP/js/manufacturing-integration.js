// manufacturing-integration.js - Etapa 3
// Puente entre ManuCore, SupplyChain y Corporate.
// Objetivo: que el coste de un producto dependa de make/buy y de la cadena real de suministro.
const ManufacturingIntegration = {
    version: 1,
    componentMap: { chips:'chips', screens:'screens', batteries:'batteries', alloys:'alloys' },

    init(){
        this.normalize();
        this.patchManuCoreCostPreview();
        this.patchMonthEndAccounting();
    },

    normalize(){
        if(typeof ManuCore==='undefined') return;
        ManuCore.state.componentSourcing = ManuCore.state.componentSourcing || {};
    },

    getRecipe(device){
        if(!device || typeof ManuCore==='undefined') return {};
        const model=ManuCore.config.deviceTypes[device.type];
        if(!model) return {};
        const recipe=Object.assign({},model.recipe||{});
        // Las especificaciones pueden añadir componentes. El diseñador de ManuCore ya guarda specs.
        const specs=device.specs||device.specifications||{};
        Object.values(specs).forEach(option=>{
            if(!option) return;
            const extra=option.extraComponents||{};
            Object.entries(extra).forEach(([k,v])=>recipe[k]=(recipe[k]||0)+Number(v||0));
        });
        return recipe;
    },

    sourceFor(companyId,component,quantity){
        const company=typeof Corporate!=='undefined' ? Corporate.state.subsidiaries.find(c=>c.id===companyId) : null;
        const policy=company?.makeBuy?.[component];
        if(policy?.mode==='make'){
            const make=SupplyChain.internalCost(component,company);
            return {mode:'make',component,unitCost:make.unitCost,quality:make.quality,capacity:make.capacity,supplier:null};
        }
        const supplierId=policy?.supplierId || SupplyChain.bestSupplier(component,quantity)?.supplierId;
        const buy=supplierId ? SupplyChain.supplierQuote(supplierId,component,quantity) : SupplyChain.bestSupplier(component,quantity);
        if(buy) return {mode:'buy',component,unitCost:buy.unitPrice,quality:buy.quality,capacity:null,supplier:buy.supplierId,leadDays:buy.leadDays};
        return {mode:'unavailable',component,unitCost:0,quality:0,capacity:0,supplier:null};
    },

    calculateUnitCost(device,quantity=1000,companyId=null){
        const recipe=this.getRecipe(device);
        const company=companyId && typeof Corporate!=='undefined' ? Corporate.state.subsidiaries.find(c=>c.id===companyId) : null;
        const rows=[]; let materialCost=0; let qualityWeighted=0; let totalComponents=0; let unavailable=false;
        Object.entries(recipe).forEach(([component,units])=>{
            const q=Math.max(1,Math.round(quantity*units));
            const source=company ? this.sourceFor(company.id,component,q) : {mode:'buy',unitCost:SupplyChain.state.market[component]?.currentPrice||0,quality:SupplyChain.state.market[component]?.quality||.85};
            const line=Number(units||0)*Number(source.unitCost||0);
            materialCost+=line; qualityWeighted+=Number(units||0)*Number(source.quality||0); totalComponents+=Number(units||0);
            if(source.mode==='unavailable') unavailable=true;
            rows.push({component,units,source:source.mode,unitCost:source.unitCost,lineCost:line,quality:source.quality,supplier:source.supplier||null});
        });
        const assemblyBase=Math.max(2,materialCost*0.08);
        const factoryEfficiency=typeof ManuCore!=='undefined' ? Math.min(1.25,0.85+ManuCore.state.factoryLevel*0.06) : 1;
        const assemblyCost=assemblyBase/factoryEfficiency;
        const quality=totalComponents ? qualityWeighted/totalComponents : 0;
        return {quantity,materialCost,assemblyCost,unitCost:materialCost+assemblyCost,quality,rows,unavailable};
    },

    patchManuCoreCostPreview(){
        if(typeof ManuCore==='undefined' || this._previewPatched) return;
        this._previewPatched=true;
        // Exponemos una API segura para que UI y futuros diseñadores puedan pedir el coste real.
        ManuCore.calculateRealCost=(device,quantity=1000,companyId=null)=>this.calculateUnitCost(device,quantity,companyId);
    },

    patchMonthEndAccounting(){
        if(typeof ManuCore==='undefined' || this._monthPatched || !ManuCore.processMonthEnd) return;
        this._monthPatched=true;
        const original=ManuCore.processMonthEnd.bind(ManuCore);
        ManuCore.processMonthEnd=()=>{
            const before=ManuCore.state.devices.map(d=>({id:d.id,name:d.name,type:d.type,price:Number(d.price||0)}));
            const result=original();
            // Registrar el coste económico estimado de cada dispositivo vendido.
            const company=typeof Corporate!=='undefined' ? Corporate.state.subsidiaries[0] : null;
            if(company && typeof SupplyChain!=='undefined'){
                company.manufacturingCosts=company.manufacturingCosts||0;
                before.forEach(d=>{
                    const live=ManuCore.state.devices.find(x=>x.id===d.id)||d;
                    const estimate=this.calculateUnitCost(live,1,company.id);
                    const units=Math.max(0,Number(live.monthlySales||0));
                    company.manufacturingCosts += estimate.unitCost*units;
                });
            }
            return result;
        };
    }
};
