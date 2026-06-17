// ═══════════════════════════════════════════════════════
//  حصاد — ACCOUNTING ENGINE (شجرة حسابات + دفاتر وتقارير محاسبية)
// ═══════════════════════════════════════════════════════
// Approach: rather than forcing the user to manually post journal entries,
// the system derives a full journal automatically from the operational data
// already captured everywhere else (milk sales, cattle sales, expenses,
// debts...). This keeps data entry exactly as simple as before, while still
// producing real double-entry-style books for review.

function accountByCode(code){return (S.accounts||[]).find(a=>a.code===code);}
function accountName(code){const a=accountByCode(code);return a?a.name:code;}
function accountType(code){const a=accountByCode(code);return a?a.type:null;}

// ═══════════════════════════════════════════════════════
//  AUTO-GENERATED JOURNAL (دفتر اليومية المُولَّد تلقائياً)
// ═══════════════════════════════════════════════════════
function buildJournal(){
  const entries=[];
  let i=1;
  const push=(date,debitCode,creditCode,amount,desc,refType,refId)=>{
    if(!amount||amount<=0) return;
    entries.push({id:'j'+(i++),date,debitCode,creditCode,amount,desc,refType,refId});
  };

  (S.fridays||[]).forEach(f=>{
    push(f.date,'1100','4100',Number(f.received||0),'محاسبة تاجر الحليب'+(f.trader?' — '+f.trader:''),'friday',f.id);
  });

  (S.cattle||[]).forEach(c=>{
    if(c.source==='bought'&&Number(c.buyPrice)>0){
      const isCredit = (S.debts||[]).some(d=>d.refType==='cattle'&&d.refId===c.id);
      push(c.buyDate||c.createdAt||TODAY,'1300', isCredit?'2100':'1100', Number(c.buyPrice), 'شراء حيوان: '+c.name,'cattle_buy',c.id);
    }
    if(c.lifecycle==='sold'&&Number(c.sellPrice)>0){
      push(c.sellDate||TODAY,'1100','4200',Number(c.sellPrice),'بيع حيوان: '+c.name,'cattle_sell',c.id);
    }
  });

  (S.harvests||[]).filter(h=>h.destination==='sold').forEach(h=>{
    push(h.date,'1100','4300',Number(h.soldRevenue||0),'بيع محصول','harvest',h.id);
  });
  (S.cuttings||[]).filter(c=>c.destination==='sold').forEach(c=>{
    push(c.date,'1100','4400',Number(c.soldTotal||0),'بيع حشة','cutting',c.id);
  });
  (S.byproducts||[]).filter(b=>b.destination==='sold').forEach(b=>{
    push(b.date,'1100','4500',Number(b.soldTotal||0),'بيع مخلفات: '+b.cropName,'byproduct',b.id);
  });

  (S.expenses||[]).forEach(e=>{
    push(e.date, e.accountCode||'5900', e.paytype==='credit'?'2100':'1100', Number(e.amount||0),
      (EXPENSE_CATEGORIES[e.category]||e.category)+(e.vendor?' — '+e.vendor:''),'expense',e.id);
  });

  (S.healthLogs||[]).filter(h=>h.hasCost&&Number(h.cost)>0).forEach(h=>{
    push(h.date,'5200','1100',Number(h.cost),'صحة وبيطرة'+(h.vet?' — '+h.vet:''),'health',h.id);
  });
  (S.insems||[]).filter(i=>Number(i.cost)>0).forEach(i=>{
    push(i.date,'5300','1100',Number(i.cost),'تلقيح'+(i.bull?' — '+i.bull:''),'insem',i.id);
  });
  (S.heatPrograms||[]).filter(p=>Number(p.cost)>0).forEach(p=>{
    push(p.start,'5300','1100',Number(p.cost),'برنامج صراف','heatprog',p.id);
  });
  (S.births||[]).filter(b=>Number(b.cost)>0).forEach(b=>{
    push(b.date,'5200','1100',Number(b.cost),'تكلفة ولادة','birth',b.id);
  });
  (S.calfLogs||[]).filter(l=>Number(l.cost)>0).forEach(l=>{
    push(l.date,'5100','1100',Number(l.cost),'تربية عجول','calflog',l.id);
  });

  (S.maintenanceLogs||[]).filter(m=>Number(m.cost)>0).forEach(m=>{
    push(m.date,'5500',m.paytype==='credit'?'2100':'1100',Number(m.cost),'صيانة'+(m.equipment?' — '+m.equipment:''),'maint',m.id);
  });

  (S.ops||[]).filter(o=>o.hasCost&&Number(o.cost)>0&&!o._migratedToExpense).forEach(o=>{
    push(o.date,'5400',o.paytype==='credit'?'2100':'1100',Number(o.cost),opTypeLabel(o.type),'cropop',o.id);
  });

  (S.inventoryMoves||[]).filter(m=>m.type==='in'&&m.refType==='purchase'&&Number(m.total)>0).forEach(m=>{
    const it=(S.inventoryItems||[]).find(x=>x.id===m.itemId);
    const code=it&&it.category==='feed'?'1210':'1220';
    push(m.date,code,'1100',Number(m.total),'شراء مخزون: '+(it?it.name:''),'invmove',m.id);
  });

  (S.payments||[]).forEach(p=>{
    push(p.date,'2100','1100',Number(p.amount||0),'دفعة دين','payment',p.id);
  });

  entries.sort((a,b)=>a.date.localeCompare(b.date));
  return entries;
}

// ═══════════════════════════════════════════════════════
//  LEDGER (دفتر الأستاذ) — per-account running balance
// ═══════════════════════════════════════════════════════
function buildLedger(journal){
  journal = journal || buildJournal();
  const ledger={};
  const normalSide={asset:'debit',expense:'debit',liability:'credit',equity:'credit',revenue:'credit'};

  function ensure(code){
    if(!ledger[code]) ledger[code]=[];
    return ledger[code];
  }
  journal.forEach(j=>{
    ensure(j.debitCode).push({date:j.date,desc:j.desc,debit:j.amount,credit:0});
    ensure(j.creditCode).push({date:j.date,desc:j.desc,debit:0,credit:j.amount});
  });
  Object.keys(ledger).forEach(code=>{
    const acc=accountByCode(code);
    const side=acc?normalSide[acc.type]:'debit';
    let bal=0;
    ledger[code]=ledger[code].sort((a,b)=>a.date.localeCompare(b.date)).map(row=>{
      bal += side==='debit' ? (row.debit-row.credit) : (row.credit-row.debit);
      return Object.assign({},row,{balance:bal});
    });
  });
  return ledger;
}
function accountBalance(code,ledger){
  ledger = ledger || buildLedger();
  const rows=ledger[code];
  if(!rows||!rows.length) return 0;
  return rows[rows.length-1].balance;
}

// ═══════════════════════════════════════════════════════
//  TRIAL BALANCE (ميزان المراجعة)
// ═══════════════════════════════════════════════════════
function buildTrialBalance(){
  const journal=buildJournal();
  const ledger=buildLedger(journal);
  const normalSide={asset:'debit',expense:'debit',liability:'credit',equity:'credit',revenue:'credit'};
  const rows=(S.accounts||[]).filter(a=>ledger[a.code]&&ledger[a.code].length).map(a=>{
    const bal=accountBalance(a.code,ledger);
    const side=normalSide[a.type];
    return {code:a.code,name:a.name,type:a.type,debit:side==='debit'?Math.max(bal,0):Math.max(-bal,0),credit:side==='credit'?Math.max(bal,0):Math.max(-bal,0)};
  });
  const totalDebit=rows.reduce((s,r)=>s+r.debit,0);
  const totalCredit=rows.reduce((s,r)=>s+r.credit,0);
  return {rows,totalDebit,totalCredit,balanced:Math.abs(totalDebit-totalCredit)<0.01};
}

// ═══════════════════════════════════════════════════════
//  INCOME STATEMENT (قائمة الدخل)
// ═══════════════════════════════════════════════════════
function buildIncomeStatement(){
  const ledger=buildLedger();
  const revenues=(S.accounts||[]).filter(a=>a.type==='revenue'&&a.parent==='4000');
  const expenses=(S.accounts||[]).filter(a=>a.type==='expense'&&(a.parent==='5000'||a.parent==='5400'));
  const revRows=revenues.map(a=>({code:a.code,name:a.name,amount:accountBalance(a.code,ledger)})).filter(r=>r.amount>0);
  const expRows=expenses.map(a=>({code:a.code,name:a.name,amount:accountBalance(a.code,ledger)})).filter(r=>r.amount>0);
  const totalRev=revRows.reduce((s,r)=>s+r.amount,0);
  const totalExp=expRows.reduce((s,r)=>s+r.amount,0);
  return {revRows,expRows,totalRev,totalExp,net:totalRev-totalExp};
}

// ═══════════════════════════════════════════════════════
//  BALANCE SHEET (الميزانية)
// ═══════════════════════════════════════════════════════
function buildBalanceSheet(){
  const ledger=buildLedger();
  const cattleValue=(S.cattle||[]).filter(c=>!isOut(c)).reduce((s,c)=>s+Number(c.buyPrice||0),0);
  const feedInvValue=(S.inventoryItems||[]).filter(it=>it.category==='feed').reduce((s,it)=>s+Number(it.qty||0)*Number(it.avgCost||0),0);
  const inputsInvValue=(S.inventoryItems||[]).filter(it=>it.category!=='feed').reduce((s,it)=>s+Number(it.qty||0)*Number(it.avgCost||0),0);
  const cashBalance=accountBalance('1100',ledger);

  const assetRows=[
    {code:'1100',name:'النقدية والصندوق',amount:cashBalance},
    {code:'1210',name:'مخزون الأعلاف',amount:feedInvValue},
    {code:'1220',name:'مخزون المدخلات الزراعية',amount:inputsInvValue},
    {code:'1300',name:'الأصول الحيوانية (القطيع)',amount:cattleValue},
  ].filter(r=>Math.abs(r.amount)>0.01);
  const totalAssets=assetRows.reduce((s,r)=>s+r.amount,0);

  const liabAccs=(S.accounts||[]).filter(a=>a.type==='liability'&&a.parent==='2000');
  const liabRows=liabAccs.map(a=>({code:a.code,name:a.name,amount:accountBalance(a.code,ledger)})).filter(r=>r.amount>0.01);
  const totalLiab=liabRows.reduce((s,r)=>s+r.amount,0);

  const equityRows=(S.partners||[]).map(p=>{
    const cs=partnerCattleSummary(p.id);
    return {code:'3'+String(p.id).padStart(3,'0'),name:'حقوق '+p.name,amount:cs.assetValue+cs.net};
  });
  const totalEquity=equityRows.reduce((s,r)=>s+r.amount,0);

  return {assetRows,totalAssets,liabRows,totalLiab,equityRows,totalEquity,
    balanced: Math.abs(totalAssets-(totalLiab+totalEquity))<Math.max(1,totalAssets*0.02)};
}

// ═══════════════════════════════════════════════════════
//  WEEKLY FEED-VS-MILK COVERAGE REPORT
// ═══════════════════════════════════════════════════════
function weekStart(dateStr){
  const d=new Date(dateStr);
  const dow=d.getDay();
  const diff=(dow+1)%7;
  d.setDate(d.getDate()-diff);
  return d.toISOString().split('T')[0];
}
function buildWeeklyFeedVsMilk(){
  const weeks={};
  function ensure(w){ if(!weeks[w]) weeks[w]={milkRevenue:0,feedCost:0,healthCost:0,otherCost:0}; return weeks[w]; }

  (S.fridays||[]).forEach(f=>{ ensure(weekStart(f.date)).milkRevenue+=Number(f.received||0); });

  (S.expenses||[]).forEach(e=>{
    const w=ensure(weekStart(e.date));
    if(e.category==='feed') w.feedCost+=Number(e.amount||0);
    else if(e.category==='health'||e.category==='repro') w.healthCost+=Number(e.amount||0);
  });
  (S.inventoryMoves||[]).filter(m=>m.refType==='feed_use').forEach(m=>{
    ensure(weekStart(m.date)).feedCost+=Number(m.total||0);
  });
  (S.internalFeedUse||[]).forEach(u=>{
    ensure(weekStart(u.date)).feedCost+=Number(u.value||0);
  });
  (S.healthLogs||[]).filter(h=>h.hasCost).forEach(h=>{ ensure(weekStart(h.date)).healthCost+=Number(h.cost||0); });
  (S.insems||[]).forEach(i=>{ if(Number(i.cost)>0) ensure(weekStart(i.date)).healthCost+=Number(i.cost); });

  const rows=Object.entries(weeks).map(([w,v])=>{
    const totalCost=v.feedCost+v.healthCost+v.otherCost;
    return {week:w,weekEnd:addDays(w,6),milkRevenue:v.milkRevenue,feedCost:v.feedCost,healthCost:v.healthCost,
      totalCost,surplus:v.milkRevenue-totalCost,coverage:totalCost>0?(v.milkRevenue/totalCost*100):null};
  }).sort((a,b)=>b.week.localeCompare(a.week));
  return rows;
}
