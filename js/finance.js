// ═══════════════════════════════════════════════════════
//  حصاد — FINANCE MODULE: CALCULATIONS, DEBTS, REPORTS
// ═══════════════════════════════════════════════════════

// ---------- Core financial calculations ----------
function revenueBreakdown(){
  return {
    milk:        (S.fridays||[]).reduce((s,f)=>s+Number(f.received||0),0),
    cattleSales: (S.cattle||[]).filter(c=>c.lifecycle==='sold').reduce((s,c)=>s+Number(c.sellPrice||0),0),
    cropSales:   (S.harvests||[]).reduce((s,h)=>s+Number(h.soldRevenue||0),0),
    cuttingSales:(S.cuttings||[]).filter(c=>c.destination==='sold').reduce((s,c)=>s+Number(c.soldTotal||0),0),
    byproductSales:(S.byproducts||[]).filter(b=>b.destination==='sold').reduce((s,b)=>s+Number(b.soldTotal||0),0),
  };
}
function costBreakdown(){
  return {
    cattlePurchase: (S.cattle||[]).reduce((s,c)=>s+Number(c.buyPrice||0),0),
    feed:           (S.feeds||[]).reduce((s,f)=>s+Number(f.cost||0),0) + (S.internalFeedUse||[]).reduce((s,u)=>s+Number(u.value||0),0),
    health:         (S.healthLogs||[]).filter(h=>h.hasCost).reduce((s,h)=>s+Number(h.cost||0),0),
    repro:          (S.insems||[]).reduce((s,i)=>s+Number(i.cost||0),0) + (S.heatPrograms||[]).reduce((s,p)=>s+Number(p.cost||0),0),
    births:         (S.births||[]).reduce((s,b)=>s+Number(b.cost||0),0),
    calfRearing:    (S.calfLogs||[]).reduce((s,l)=>s+Number(l.cost||0),0),
    cropOps:        (S.ops||[]).filter(o=>o.hasCost).reduce((s,o)=>s+Number(o.cost||0),0),
    maintenance:    (S.maintenanceLogs||[]).reduce((s,m)=>s+Number(m.cost||0),0),
    byproductPrep:  (S.byproducts||[]).reduce((s,b)=>s+Number(b.transportCost||0)+Number(b.prepCost||0),0),
    inputsPurchase: (S.inventoryMoves||[]).filter(m=>m.type==='in'&&(m.category==='fertilizer'||m.category==='pesticide'||m.category==='nutrient'||m.category==='fuel'||m.category==='spare')).reduce((s,m)=>s+Number(m.total||0),0),
  };
}
function computeFinanceTotals(){
  const r=revenueBreakdown(), c=costBreakdown();
  const totalRev=Object.values(r).reduce((s,v)=>s+v,0);
  const totalCost=Object.values(c).reduce((s,v)=>s+v,0);
  return {totalRev,totalCost,netProfit:totalRev-totalCost,r,c};
}

// ---------- Milk revenue allocation per cow ----------
function milkRevenuePerCow(){
  const totalRev=(S.fridays||[]).reduce((s,f)=>s+Number(f.received||0),0);
  const perCow={};
  (S.cattle||[]).forEach(c=>{perCow[c.id]={qty:0,revenue:0};});
  let totalQty=0;
  (S.milkLogs||[]).forEach(l=>{
    Object.entries(l.qtys||{}).forEach(([cowIdStr,q])=>{
      const cowId=Number(cowIdStr);
      if(!perCow[cowId]) perCow[cowId]={qty:0,revenue:0};
      perCow[cowId].qty+=Number(q||0);
      totalQty+=Number(q||0);
    });
  });
  if(totalQty>0){
    Object.keys(perCow).forEach(id=>{perCow[id].revenue=totalRev*perCow[id].qty/totalQty;});
  }
  return perCow;
}

// ---------- Feed cost allocation per active cow (equal split, approximation) ----------
function allocatedFeedCostPerCow(){
  const totalFeedCost=(S.feeds||[]).reduce((s,f)=>s+Number(f.cost||0),0)+(S.internalFeedUse||[]).reduce((s,u)=>s+Number(u.value||0),0);
  const active=(S.cattle||[]).filter(c=>!isOut(c));
  const per={};
  const share=active.length?totalFeedCost/active.length:0;
  (S.cattle||[]).forEach(c=>{per[c.id]=isOut(c)?0:share;});
  return {per,totalFeedCost,count:active.length};
}

// ---------- Per-cow financial profile ----------
function cowFinancials(c){
  const assetValue=Number(c.buyPrice||0);
  let cost=Number(c.buyPrice||0);
  cost+=(S.healthLogs||[]).filter(h=>h.cowId===c.id&&h.hasCost).reduce((s,h)=>s+Number(h.cost||0),0);
  cost+=(S.insems||[]).filter(i=>i.cowId===c.id).reduce((s,i)=>s+Number(i.cost||0),0);
  cost+=(S.heatPrograms||[]).filter(p=>p.cowId===c.id).reduce((s,p)=>s+Number(p.cost||0),0);
  cost+=(S.births||[]).filter(b=>b.cowId===c.id).reduce((s,b)=>s+Number(b.cost||0),0);
  cost+=(S.calfLogs||[]).filter(l=>l.calfId===c.id).reduce((s,l)=>s+Number(l.cost||0),0);
  cost+=(allocatedFeedCostPerCow().per[c.id])||0;
  const milkRow=milkRevenuePerCow()[c.id]||{qty:0,revenue:0};
  const saleRevTotal=c.lifecycle==='sold'?Number(c.sellPrice||0):0;
  return {assetValue,cost,milkRevTotal:milkRow.revenue,milkQty:milkRow.qty,saleRevTotal};
}
// Split a cow's financial profile by one partner's ownership shares
function cowPartnerSplit(c,fin,partnerId){
  const ownPct=shareFor(c.owners,partnerId);
  const salePct=shareFor(c.saleShares,partnerId);
  const assetValue=isOut(c)?0:fin.assetValue*ownPct/100;
  const cost=fin.cost*ownPct/100;
  const milkRev=fin.milkRevTotal*ownPct/100;
  let saleRev=0;
  if(c.sellSplits&&c.sellSplits.length){
    const f=c.sellSplits.find(s=>s.partnerId===partnerId);
    saleRev=f?Number(f.amount||0):0;
  } else {
    saleRev=fin.saleRevTotal*salePct/100;
  }
  return {assetValue,cost,milkRev,saleRev,net:milkRev+saleRev-cost};
}
function partnerCattleSummary(partnerId){
  let assetValue=0,revenue=0,cost=0,net=0;
  (S.cattle||[]).forEach(c=>{
    const fin=cowFinancials(c);
    const sp=cowPartnerSplit(c,fin,partnerId);
    assetValue+=sp.assetValue;revenue+=sp.milkRev+sp.saleRev;cost+=sp.cost;net+=sp.net;
  });
  return {assetValue,revenue,cost,net};
}

// ═══════════════════════════════════════════════════════
//  DEBTS & PAYMENTS PAGE
// ═══════════════════════════════════════════════════════
// ---------- Debt link/category system ----------
// A debt can optionally be linked to a specific crop or animal — in which case its
// repayment can be automatically settled from that item's future revenue (milk,
// crop sale, animal sale). Debts can also be marked as "personal" — unrelated to
// the farm at all (e.g. the owner's personal clothing or food expenses) — so they
// stay completely separate from farm profitability calculations.
const DEBT_LINK_LABELS={none:'دين عام (غير مرتبط)',crop:'محصول',cattle:'حيوان',personal:'دين شخصي (خارج المزرعة)'};

function debtLinkText(d){
  if(!d.linkType||d.linkType==='none') return 'غير مرتبط';
  if(d.linkType==='personal') return '<span class="tag tag-gray">شخصي — خارج المزرعة</span>';
  if(d.linkType==='crop'){const c=(S.crops||[]).find(x=>x.id===d.linkId);return c?'محصول: '+esc(c.name):'محصول محذوف';}
  if(d.linkType==='cattle'){const c=(S.cattle||[]).find(x=>x.id===d.linkId);return c?'حيوان: '+esc(c.name):'حيوان محذوف';}
  if(d.refType==='cropop'){const o=(S.ops||[]).find(x=>x.id===d.refId);const c=o?(S.crops||[]).find(x=>x.id===o.cropId):null;return o?('عملية على محصول: '+(c?esc(c.name):'—')):'—';}
  return '—';
}
// Group debts by the linked item (crop/cattle/personal/none) for the "حسب العنصر" report
function debtsByLinkSummary(){
  const map={};
  (S.debts||[]).filter(d=>!d.isPersonal && d.linkType!=='personal').forEach(d=>{
    let key, label;
    if(d.linkType==='crop'){const c=(S.crops||[]).find(x=>x.id===d.linkId);key='crop:'+d.linkId;label=c?'محصول: '+c.name:'محصول محذوف';}
    else if(d.linkType==='cattle'){const c=(S.cattle||[]).find(x=>x.id===d.linkId);key='cattle:'+d.linkId;label=c?'حيوان: '+c.name:'حيوان محذوف';}
    else {key='none';label='ديون عامة غير مرتبطة';}
    if(!map[key]) map[key]={key,label,count:0,total:0,remaining:0};
    map[key].count++;
    map[key].total+=Number(d.amount||0);
    map[key].remaining+=Number(d.remaining!=null?d.remaining:d.amount||0);
  });
  return Object.values(map).map(v=>Object.assign(v,{paid:v.total-v.remaining})).sort((a,b)=>b.remaining-a.remaining);
}
function personalDebtsSummary(){
  const debts=(S.debts||[]).filter(d=>d.linkType==='personal');
  const total=debts.reduce((s,d)=>s+Number(d.amount||0),0);
  const remaining=debts.reduce((s,d)=>s+Number(d.remaining!=null?d.remaining:d.amount||0),0);
  return {debts,total,remaining,paid:total-remaining};
}

function renderDebtsPage(wrap){
  document.getElementById('topbar-actions').innerHTML=
    '<button class="btn btn-outline" onclick="openGeneralPayModal()"><i class="fas fa-hand-holding-usd"></i> سداد</button>'+
    '<button class="btn btn-primary" onclick="openDebtModal()"><i class="fas fa-plus"></i> تسجيل دين / مستحق</button>';
  const allDebts=[...(S.debts||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const debts=allDebts.filter(d=>d.linkType!=='personal');
  const personal=personalDebtsSummary();
  const open=debts.filter(d=>d.status!=='paid');
  const totalOpen=open.reduce((s,d)=>s+Number(d.remaining!=null?d.remaining:d.amount||0),0);
  const totalAll=debts.reduce((s,d)=>s+Number(d.amount||0),0);
  const totalPaid=totalAll-totalOpen;
  const payments=[...(S.payments||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const vendorSummary=vendorDebtSummary();
  const linkSummary=debtsByLinkSummary();

  wrap.innerHTML=
    '<div class="alert alert-info"><i class="fas fa-link"></i><span>كل الديون مرتبطة محاسبياً بحساب <strong>2100 — ديون الموردين</strong> في شجرة الحسابات (باستثناء الديون الشخصية)، ويمكن مراجعتها بالتفصيل من دفتر الأستاذ في صفحة التقارير المالية.</span></div>'+
    '<div class="kpi-grid">'+
      kpiCard('إجمالي ديون المزرعة',fMoney(totalAll),'fa-file-invoice-dollar','')+
      kpiCard('المدفوع',fMoney(totalPaid),'fa-check-circle','green')+
      kpiCard('المتبقي المستحق',fMoney(totalOpen),'fa-exclamation-circle','red')+
      kpiCard('ديون شخصية (خارج المزرعة)',fMoney(personal.remaining),'fa-user','orange')+
    '</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">'+
      '<div class="card"><div class="card-header"><div class="card-title"><i class="fas fa-store"></i> حسب المورد / الدائن</div></div><div class="card-body p0">'+
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>المورد</th><th>البنود</th><th>المتبقي</th><th></th></tr></thead><tbody>'+
      (vendorSummary.length?vendorSummary.map(v=>'<tr><td style="font-weight:700">'+esc(v.vendor)+'</td><td>'+v.count+'</td>'+
        '<td class="'+(v.remaining>0?'amt-red':'amt-green')+'">'+fMoney(v.remaining)+'</td>'+
        '<td><button class="btn btn-sm btn-outline" onclick="openVendorDetailModal(\''+esc(v.vendor).replace(/'/g,"\\'")+'\')"><i class="fas fa-file-invoice"></i></button></td></tr>').join(''):
        '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--txt4)">لا توجد ديون</td></tr>')+
      '</tbody></table></div></div>'+
      '<div class="card"><div class="card-header"><div class="card-title"><i class="fas fa-sitemap"></i> حسب العنصر المرتبط</div></div><div class="card-body p0">'+
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>العنصر</th><th>البنود</th><th>المتبقي</th></tr></thead><tbody>'+
      (linkSummary.length?linkSummary.map(v=>'<tr><td style="font-weight:700">'+esc(v.label)+'</td><td>'+v.count+'</td>'+
        '<td class="'+(v.remaining>0?'amt-red':'amt-green')+'">'+fMoney(v.remaining)+'</td></tr>').join(''):
        '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--txt4)">لا توجد ديون مرتبطة بعناصر</td></tr>')+
      '</tbody></table></div></div>'+
    '</div>'+
    '<div class="card" style="margin-bottom:16px"><div class="card-header"><div class="card-title">ديون ومستحقات المزرعة (سجل كامل)</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>الجهة</th><th>السبب</th><th>مرتبط بـ</th><th>القيمة</th><th>المتبقي</th><th>الحالة</th><th></th></tr></thead><tbody>'+
    (debts.length?debts.map(d=>{
      const remaining=d.remaining!=null?Number(d.remaining):Number(d.amount||0);
      const status=remaining<=0?'paid':(remaining<Number(d.amount)?'partial':'open');
      const labels={paid:'<span class="tag tag-green">مدفوع</span>',partial:'<span class="tag tag-gold">مدفوع جزئياً</span>',open:'<span class="tag tag-red">مستحق</span>'};
      return '<tr><td>'+d.date+'</td><td style="font-weight:700"><button class="link-btn" onclick="openVendorDetailModal(\''+esc(d.vendor).replace(/'/g,"\\'")+'\')">'+esc(d.vendor)+'</button></td><td>'+esc(d.reason||'—')+'</td>'+
        '<td>'+debtLinkText(d)+'</td>'+
        '<td>'+fMoney(d.amount)+'</td><td class="'+(remaining>0?'amt-red':'amt-green')+'">'+fMoney(remaining)+'</td>'+
        '<td>'+labels[status]+'</td>'+
        '<td><div style="display:flex;gap:4px">'+(remaining>0?'<button class="btn btn-sm btn-outline" onclick="openPayDebtModal('+d.id+')"><i class="fas fa-coins"></i> سداد</button>':'')+
        '<button class="btn-icon danger" onclick="deleteDebt('+d.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></div></td></tr>';
    }).join(''):'<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--txt4)">لا توجد ديون مسجلة</td></tr>')+
    '</tbody></table></div></div></div>'+
    '<div class="card" style="margin-bottom:16px"><div class="card-header"><div class="card-title"><i class="fas fa-user"></i> ديون شخصية (خارج المزرعة)</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>الجهة</th><th>السبب</th><th>القيمة</th><th>المتبقي</th><th>الحالة</th><th></th></tr></thead><tbody>'+
    (personal.debts.length?personal.debts.map(d=>{
      const remaining=d.remaining!=null?Number(d.remaining):Number(d.amount||0);
      const status=remaining<=0?'paid':(remaining<Number(d.amount)?'partial':'open');
      const labels={paid:'<span class="tag tag-green">مدفوع</span>',partial:'<span class="tag tag-gold">جزئي</span>',open:'<span class="tag tag-red">مستحق</span>'};
      return '<tr><td>'+d.date+'</td><td style="font-weight:700">'+esc(d.vendor)+'</td><td>'+esc(d.reason||'—')+'</td>'+
        '<td>'+fMoney(d.amount)+'</td><td class="'+(remaining>0?'amt-red':'amt-green')+'">'+fMoney(remaining)+'</td><td>'+labels[status]+'</td>'+
        '<td><div style="display:flex;gap:4px">'+(remaining>0?'<button class="btn btn-sm btn-outline" onclick="openPayDebtModal('+d.id+')"><i class="fas fa-coins"></i> سداد</button>':'')+
        '<button class="btn-icon danger" onclick="deleteDebt('+d.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></div></td></tr>';
    }).join(''):'<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--txt4)">لا توجد ديون شخصية</td></tr>')+
    '</tbody></table></div></div></div>'+
    '<div class="card"><div class="card-header"><div class="card-title">سجل المدفوعات</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>الجهة</th><th>المبلغ المدفوع</th><th>طريقة السداد</th><th>ملاحظات</th></tr></thead><tbody>'+
    (payments.length?payments.map(p=>{
      const d=(S.debts||[]).find(x=>x.id===p.debtId);
      const methodLabel=p.method==='revenue_offset'?'<span class="tag tag-blue">خصم من إيراد مرتبط</span>':'<span class="tag tag-green">دفعة نقدية</span>';
      return '<tr><td>'+p.date+'</td><td>'+(d?esc(d.vendor):'—')+'</td><td class="amt-green">'+fMoney(p.amount)+'</td><td>'+methodLabel+'</td><td>'+esc(p.notes||'—')+'</td></tr>';
    }).join(''):'<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--txt4)">لا توجد مدفوعات</td></tr>')+
    '</tbody></table></div></div></div>';
}
function vendorDebtSummary(){
  const map={};
  (S.debts||[]).filter(d=>d.linkType!=='personal').forEach(d=>{
    const key=d.vendor||'بدون اسم';
    if(!map[key]) map[key]={vendor:key,count:0,total:0,remaining:0};
    map[key].count++;
    map[key].total+=Number(d.amount||0);
    map[key].remaining+=Number(d.remaining!=null?d.remaining:d.amount||0);
  });
  return Object.values(map).map(v=>Object.assign(v,{paid:v.total-v.remaining})).sort((a,b)=>b.remaining-a.remaining);
}
function openVendorDetailModal(vendorName){
  const debts=(S.debts||[]).filter(d=>(d.vendor||'بدون اسم')===vendorName).sort((a,b)=>b.date.localeCompare(a.date));
  const debtIds=debts.map(d=>d.id);
  const payments=(S.payments||[]).filter(p=>debtIds.includes(p.debtId)).sort((a,b)=>b.date.localeCompare(a.date));
  const total=debts.reduce((s,d)=>s+Number(d.amount||0),0);
  const remaining=debts.reduce((s,d)=>s+Number(d.remaining!=null?d.remaining:d.amount||0),0);
  const paid=total-remaining;

  document.getElementById('vd-title').textContent='ملف المورد: '+vendorName;
  document.getElementById('vd-body').innerHTML=
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">'+
      miniStat(fMoney(total),'إجمالي الدين')+miniStat(fMoney(paid),'المدفوع')+miniStat(fMoney(remaining),'المتبقي')+
    '</div>'+
    '<div class="form-divider">كل الديون المسجلة لهذا المورد</div>'+
    '<div class="tbl-wrap" style="margin-top:8px"><table class="tbl"><thead><tr><th>التاريخ</th><th>السبب</th><th>القيمة</th><th>المتبقي</th><th>الحالة</th></tr></thead><tbody>'+
    debts.map(d=>{
      const rem=d.remaining!=null?Number(d.remaining):Number(d.amount||0);
      const status=rem<=0?'paid':(rem<Number(d.amount)?'partial':'open');
      const labels={paid:'<span class="tag tag-green">مدفوع</span>',partial:'<span class="tag tag-gold">جزئي</span>',open:'<span class="tag tag-red">مستحق</span>'};
      return '<tr><td>'+d.date+'</td><td>'+esc(d.reason||'—')+'</td><td>'+fMoney(d.amount)+'</td><td class="'+(rem>0?'amt-red':'amt-green')+'">'+fMoney(rem)+'</td><td>'+labels[status]+'</td></tr>';
    }).join('')+
    '</tbody></table></div>'+
    '<div class="form-divider">كل الدفعات المسجلة لهذا المورد</div>'+
    '<div class="tbl-wrap" style="margin-top:8px"><table class="tbl"><thead><tr><th>التاريخ</th><th>المبلغ</th><th>مقابل دين</th><th>ملاحظات</th></tr></thead><tbody>'+
    (payments.length?payments.map(p=>{
      const d=(S.debts||[]).find(x=>x.id===p.debtId);
      return '<tr><td>'+p.date+'</td><td class="amt-green">'+fMoney(p.amount)+'</td><td>'+(d?esc(d.reason||'—'):'—')+'</td><td>'+esc(p.notes||'—')+'</td></tr>';
    }).join(''):'<tr><td colspan="4" style="text-align:center;padding:16px;color:var(--txt4)">لا توجد دفعات مسجلة</td></tr>')+
    '</tbody></table></div>';
  openModal('m-vendordetail');
}
function openDebtModal(){
  document.getElementById('dt-date').value=TODAY;
  ['dt-vendor','dt-reason','dt-amount','dt-paid'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('dt-linktype').value='none';
  toggleDebtLinkSel();
  openModal('m-debt');
}
function toggleDebtLinkSel(){
  const lt=document.getElementById('dt-linktype').value;
  const fg=document.getElementById('dt-linkid-fg');
  fg.style.display=(lt==='crop'||lt==='cattle')?'block':'none';
  const sel=document.getElementById('dt-linkid');
  if(lt==='crop') sel.innerHTML=(S.crops||[]).map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join('');
  else if(lt==='cattle') sel.innerHTML=(S.cattle||[]).filter(c=>!isOut(c)).map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join('');
}
function saveDebt(){
  const vendor=document.getElementById('dt-vendor').value.trim(),amount=parseFloat(document.getElementById('dt-amount').value)||0;
  if(!vendor||amount<=0){toast('⚠ أدخل الجهة والقيمة');return;}
  const paid=parseFloat(document.getElementById('dt-paid').value)||0;
  const linkType=document.getElementById('dt-linktype').value;
  const linkId=(linkType==='crop'||linkType==='cattle')?Number(document.getElementById('dt-linkid').value)||null:null;
  S.debts=S.debts||[];
  S.debts.push({id:uid(),date:document.getElementById('dt-date').value,vendor,reason:document.getElementById('dt-reason').value.trim(),amount,remaining:Math.max(0,amount-paid),status:paid>=amount?'paid':(paid>0?'partial':'open'),linkType,linkId});
  schedSave();closeModal('m-debt');renderPage(currentPage);toast('تم التسجيل');
}
function deleteDebt(id){
  confirmAction('حذف هذا الدين وكل المدفوعات المرتبطة به؟',()=>{
    S.debts=(S.debts||[]).filter(d=>d.id!==id);
    S.payments=(S.payments||[]).filter(p=>p.debtId!==id);
    schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}
function openPayDebtModal(debtId){
  const d=(S.debts||[]).find(x=>x.id===debtId);if(!d)return;
  document.getElementById('pd-debt-id').value=debtId;
  document.getElementById('pd-info').textContent=d.vendor+' — المتبقي: '+fMoney(d.remaining!=null?d.remaining:d.amount);
  document.getElementById('pd-date').value=TODAY;
  document.getElementById('pd-amount').value='';
  document.getElementById('pd-notes').value='';
  openModal('m-paydebt');
}
function savePayment(){
  const debtId=Number(document.getElementById('pd-debt-id').value);
  const d=(S.debts||[]).find(x=>x.id===debtId);if(!d)return;
  const amount=parseFloat(document.getElementById('pd-amount').value)||0;
  if(amount<=0){toast('⚠ أدخل قيمة الدفعة');return;}
  S.payments=S.payments||[];
  S.payments.push({id:uid(),debtId,date:document.getElementById('pd-date').value,amount,method:'cash',notes:document.getElementById('pd-notes').value.trim()});
  d.remaining=Math.max(0,(d.remaining!=null?Number(d.remaining):Number(d.amount))-amount);
  d.status=d.remaining<=0?'paid':'partial';
  schedSave();closeModal('m-paydebt');renderPage(currentPage);toast('تم تسجيل الدفعة');
}

// ═══════════════════════════════════════════════════════
//  GENERAL PAY-OFF (سداد) — pick a vendor and/or linked item first,
//  see all matching open debts, then settle them with one payment
//  that's distributed automatically (oldest debt first) or per-line.
// ═══════════════════════════════════════════════════════
function openGeneralPayModal(){
  populateGeneralPayFilterSels();
  document.getElementById('gp-vendor').value='';
  document.getElementById('gp-linktype').value='';
  document.getElementById('gp-linkid').value='';
  document.getElementById('gp-date').value=TODAY;
  document.getElementById('gp-amount').value='';
  document.getElementById('gp-notes').value='';
  toggleGeneralPayLinkSel();
  refreshGeneralPayList();
  openModal('m-generalpay');
}
function populateGeneralPayFilterSels(){
  const vendors=new Set((S.debts||[]).filter(d=>d.status!=='paid').map(d=>d.vendor).filter(Boolean));
  document.getElementById('gp-vendor-list').innerHTML=[...vendors].map(v=>'<option value="'+esc(v)+'">').join('');
}
function toggleGeneralPayLinkSel(){
  const lt=document.getElementById('gp-linktype').value;
  const sel=document.getElementById('gp-linkid');
  document.getElementById('gp-linkid-fg').style.display=lt?'block':'none';
  if(lt==='crop') sel.innerHTML=(S.crops||[]).map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join('');
  else if(lt==='cattle') sel.innerHTML=(S.cattle||[]).filter(c=>!isOut(c)).map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join('');
  refreshGeneralPayList();
}
function matchingOpenDebts(){
  const vendor=document.getElementById('gp-vendor').value.trim();
  const linkType=document.getElementById('gp-linktype').value;
  const linkId=linkType?Number(document.getElementById('gp-linkid').value)||null:null;
  return (S.debts||[]).filter(d=>{
    if(d.status==='paid') return false;
    if(vendor && d.vendor!==vendor) return false;
    if(linkType && d.linkType!==linkType) return false;
    if(linkType && linkId && d.linkId!==linkId) return false;
    return true;
  }).sort((a,b)=>a.date.localeCompare(b.date)); // oldest first
}
function refreshGeneralPayList(){
  const debts=matchingOpenDebts();
  const totalRemaining=debts.reduce((s,d)=>s+Number(d.remaining!=null?d.remaining:d.amount||0),0);
  const box=document.getElementById('gp-list-box');
  if(!debts.length){
    box.innerHTML='<div class="alert alert-info"><i class="fas fa-circle-info"></i><span>لا توجد ديون مفتوحة مطابقة لهذا الفلتر.</span></div>';
    document.getElementById('gp-total-remaining').textContent='';
    return;
  }
  document.getElementById('gp-total-remaining').innerHTML='إجمالي المتبقي على هذه الديون: <strong>'+fMoney(totalRemaining)+'</strong> ('+debts.length+' بند)';
  box.innerHTML='<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>الجهة</th><th>السبب</th><th>مرتبط بـ</th><th>المتبقي</th></tr></thead><tbody>'+
    debts.map(d=>'<tr><td>'+d.date+'</td><td>'+esc(d.vendor)+'</td><td>'+esc(d.reason||'—')+'</td><td>'+debtLinkText(d)+'</td>'+
      '<td class="amt-red">'+fMoney(d.remaining!=null?d.remaining:d.amount)+'</td></tr>').join('')+
    '</tbody></table></div>';
}
function fillGeneralPayFullAmount(){
  const debts=matchingOpenDebts();
  const total=debts.reduce((s,d)=>s+Number(d.remaining!=null?d.remaining:d.amount||0),0);
  document.getElementById('gp-amount').value=total?total.toFixed(2):'';
}
function saveGeneralPayment(){
  const debts=matchingOpenDebts();
  if(!debts.length){toast('⚠ لا توجد ديون مفتوحة مطابقة لهذا الفلتر');return;}
  let amount=parseFloat(document.getElementById('gp-amount').value)||0;
  if(amount<=0){toast('⚠ أدخل قيمة السداد');return;}
  const date=document.getElementById('gp-date').value||TODAY;
  const notes=document.getElementById('gp-notes').value.trim();
  S.payments=S.payments||[];
  // distribute the payment across matching debts, oldest first, until exhausted
  for(const d of debts){
    if(amount<=0) break;
    const remaining=Number(d.remaining!=null?d.remaining:d.amount||0);
    if(remaining<=0) continue;
    const pay=Math.min(remaining,amount);
    S.payments.push({id:uid(),debtId:d.id,date,amount:pay,method:'cash',notes:notes||'سداد مجمّع'});
    d.remaining=Math.max(0,remaining-pay);
    d.status=d.remaining<=0?'paid':'partial';
    amount-=pay;
  }
  schedSave();closeModal('m-generalpay');renderPage(currentPage);
  toast(amount>0?('تم السداد، وتبقى '+fMoney(amount)+' لم يُستخدم (كل الديون المطابقة سُددت بالكامل)'):'تم السداد بنجاح');
}

// ═══════════════════════════════════════════════════════
//  REPORTS PAGE
// ═══════════════════════════════════════════════════════
let reportsTab='summary';
function setReportsTab(t,btn){
  reportsTab=t;
  document.querySelectorAll('#reports-tabs button').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  renderPage('reports');
}
function renderReportsPage(wrap){
  document.getElementById('topbar-actions').innerHTML='';
  wrap.innerHTML=
    '<div class="seg" id="reports-tabs" style="max-width:680px;margin-bottom:16px;flex-wrap:wrap">'+
      '<button class="'+(reportsTab==='summary'?'on':'')+'" onclick="setReportsTab(\'summary\',this)">ملخص مالي</button>'+
      '<button class="'+(reportsTab==='feedmilk'?'on':'')+'" onclick="setReportsTab(\'feedmilk\',this)">الأعلاف مقابل اللبن</button>'+
      '<button class="'+(reportsTab==='journal'?'on':'')+'" onclick="setReportsTab(\'journal\',this)">دفتر اليومية</button>'+
      '<button class="'+(reportsTab==='ledger'?'on':'')+'" onclick="setReportsTab(\'ledger\',this)">دفتر الأستاذ</button>'+
      '<button class="'+(reportsTab==='trial'?'on':'')+'" onclick="setReportsTab(\'trial\',this)">ميزان المراجعة</button>'+
      '<button class="'+(reportsTab==='income'?'on':'')+'" onclick="setReportsTab(\'income\',this)">قائمة الدخل</button>'+
      '<button class="'+(reportsTab==='balance'?'on':'')+'" onclick="setReportsTab(\'balance\',this)">الميزانية</button>'+
    '</div>'+
    (reportsTab==='summary'?renderReportsSummaryTab():
     reportsTab==='feedmilk'?renderFeedVsMilkTab():
     reportsTab==='journal'?renderJournalTab():
     reportsTab==='ledger'?renderLedgerTab():
     reportsTab==='trial'?renderTrialBalanceTab():
     reportsTab==='income'?renderIncomeStatementTab():
     renderBalanceSheetTab());
}
function renderReportsSummaryTab(){
  const fin=computeFinanceTotals();
  const revLabels={milk:'إيراد الحليب',cattleSales:'بيع حيوانات',cropSales:'بيع محاصيل',cuttingSales:'بيع حشات/علف',byproductSales:'بيع مخلفات زراعية'};
  const costLabels={cattlePurchase:'شراء حيوانات',feed:'الأعلاف (مشتراة وداخلية)',health:'الصحة والبيطرة',repro:'التلقيح والصراف',births:'تكاليف الولادات',calfRearing:'تربية العجول',cropOps:'العمليات الزراعية',maintenance:'الصيانة والوقود',byproductPrep:'نقل وتجهيز المخلفات',inputsPurchase:'مدخلات زراعية (أسمدة/مبيدات/وقود)'};

  return (
    '<div class="kpi-grid">'+
      kpiCard('إجمالي الإيرادات',fMoney(fin.totalRev),'fa-arrow-trend-up','green')+
      kpiCard('إجمالي التكاليف',fMoney(fin.totalCost),'fa-arrow-trend-down','red')+
      kpiCard('صافي الربح',fMoney(fin.netProfit),'fa-chart-line',fin.netProfit>=0?'green':'red')+
      kpiCard('نسبة الربح',fin.totalRev?fN(fin.netProfit/fin.totalRev*100)+'%':'—','fa-percent','blue')+
    '</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">'+
      '<div class="card"><div class="card-header"><div class="card-title"><i class="fas fa-arrow-trend-up"></i> الإيرادات بالتفصيل</div></div><div class="card-body p0">'+
        '<table class="tbl">'+Object.entries(fin.r).filter(([,v])=>v>0||true).map(([k,v])=>reportRow(revLabels[k]||k,v,'green')).join('')+reportRowTotal('الإجمالي',fin.totalRev,'green')+'</table>'+
      '</div></div>'+
      '<div class="card"><div class="card-header"><div class="card-title"><i class="fas fa-arrow-trend-down"></i> التكاليف بالتفصيل</div></div><div class="card-body p0">'+
        '<table class="tbl">'+Object.entries(fin.c).map(([k,v])=>reportRow(costLabels[k]||k,v,'red')).join('')+reportRowTotal('الإجمالي',fin.totalCost,'red')+'</table>'+
      '</div></div>'+
    '</div>'+
    '<div class="card" style="margin-bottom:16px"><div class="card-header"><div class="card-title"><i class="fas fa-handshake"></i> تقرير الشراكة — توزيع الملكية والأرباح في القطيع</div></div>'+
    '<div class="card-body"><div class="split-grid" style="margin-bottom:14px">'+
      (S.partners||[]).map(p=>{
        const cs=partnerCattleSummary(p.id);
        return '<div class="split-card" style="border-color:'+p.color+'"><div class="sc-name"><span class="share-dot" style="background:'+p.color+'"></span>'+esc(p.name)+'</div>'+
          '<div class="sc-val">'+fMoney(cs.assetValue)+'</div><div class="sc-sub">قيمة الأصول (نصيبه)</div></div>';
      }).join('')+
    '</div>'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الشريك</th><th>قيمة الأصول الحالية</th><th>إيرادات الحليب والبيع</th><th>التكاليف</th><th>صافي الربح</th></tr></thead><tbody>'+
    (S.partners||[]).map(p=>{
      const cs=partnerCattleSummary(p.id);
      return '<tr><td style="font-weight:700"><span class="share-dot" style="background:'+p.color+'"></span> '+esc(p.name)+'</td>'+
        '<td>'+fMoney(cs.assetValue)+'</td><td class="amt-green">'+fMoney(cs.revenue)+'</td><td class="amt-red">'+fMoney(cs.cost)+'</td>'+
        '<td class="'+(cs.net>=0?'amt-green':'amt-red')+'">'+(cs.net>=0?'+':'')+fMoney(cs.net)+'</td></tr>';
    }).join('')+
    '</tbody></table></div></div></div>'+
    '<div class="card" style="margin-bottom:16px"><div class="card-header"><div class="card-title"><i class="fas fa-store"></i> الديون مجمّعة حسب المورد / الدائن</div><button class="btn btn-sm btn-outline" onclick="goPage(\'debts\',null)">صفحة الديون الكاملة</button></div><div class="card-body p0">'+
    (function(){
      const vs=vendorDebtSummary();
      if(!vs.length) return '<div style="padding:24px;text-align:center;color:var(--txt4)">لا توجد ديون مسجلة</div>';
      return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>المورد / الدائن</th><th>عدد البنود</th><th>إجمالي الدين</th><th>المدفوع</th><th>المتبقي</th><th></th></tr></thead><tbody>'+
        vs.map(v=>'<tr><td style="font-weight:700">'+esc(v.vendor)+'</td><td>'+v.count+'</td><td>'+fMoney(v.total)+'</td><td class="amt-green">'+fMoney(v.paid)+'</td><td class="'+(v.remaining>0?'amt-red':'amt-green')+'">'+fMoney(v.remaining)+'</td>'+
          '<td><button class="btn btn-sm btn-outline" onclick="openVendorDetailModal(\''+esc(v.vendor).replace(/'/g,"\\'")+'\')"><i class="fas fa-file-invoice"></i> التفاصيل</button></td></tr>').join('')+
        '</tbody></table></div>';
    })()+
    '</div></div>'+
    '<div class="card" style="margin-bottom:16px"><div class="card-header"><div class="card-title"><i class="fas fa-cow"></i> ربحية كل رأس على حدة</div></div><div class="card-body p0">'+
    cowProfitabilityTable()+
    '</div></div>'+
    '<div class="card"><div class="card-header"><div class="card-title"><i class="fas fa-warehouse"></i> تقييم المخزون الحالي</div></div><div class="card-body p0">'+
    inventoryValuationTable()+
    '</div></div>'
  );
}
function cowProfitabilityTable(){
  const cattle=(S.cattle||[]).filter(c=>!isOut(c));
  if(!cattle.length) return '<div style="padding:24px;text-align:center;color:var(--txt4)">لا توجد رؤوس</div>';
  return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الحيوان</th><th>قيمة الأصل</th><th>التكلفة الإجمالية</th><th>إيراد الحليب</th><th>صافي الربح</th><th>ملكية رأس المال</th></tr></thead><tbody>'+
    cattle.map(c=>{
      const fin=cowFinancials(c);
      const net=fin.milkRevTotal+fin.saleRevTotal-fin.cost;
      return '<tr><td style="font-weight:700"><button class="link-btn" onclick="openAnimalDetail('+c.id+')">'+esc(c.name)+'</button></td>'+
        '<td>'+fMoney(fin.assetValue)+'</td><td class="amt-red">'+fMoney(fin.cost)+'</td><td class="amt-green">'+fMoney(fin.milkRevTotal)+'</td>'+
        '<td class="'+(net>=0?'amt-green':'amt-red')+'">'+(net>=0?'+':'')+fMoney(net)+'</td>'+
        '<td>'+ownerPillsHTML(c.owners)+'</td></tr>';
    }).join('')+
  '</tbody></table></div>';
}
function inventoryValuationTable(){
  const items=S.inventoryItems||[];
  if(!items.length) return '<div style="padding:24px;text-align:center;color:var(--txt4)">لا توجد عناصر مخزون مسجلة بعد. أضفها من صفحة المخزون والصيانة.</div>';
  const total=items.reduce((s,it)=>s+Number(it.qty||0)*Number(it.avgCost||0),0);
  return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>العنصر</th><th>التصنيف</th><th>الكمية المتوفرة</th><th>متوسط التكلفة</th><th>القيمة الإجمالية</th></tr></thead><tbody>'+
    items.map(it=>'<tr><td style="font-weight:700">'+esc(it.name)+'</td><td><span class="tag tag-gray">'+invCategoryLabel(it.category)+'</span></td>'+
      '<td>'+fN(it.qty)+' '+esc(it.unit)+'</td><td>'+fMoney(it.avgCost)+'</td><td class="amt">'+fMoney(Number(it.qty||0)*Number(it.avgCost||0))+'</td></tr>').join('')+
    reportRowTotal('إجمالي قيمة المخزون',total,'')+
  '</tbody></table></div>';
}

// ═══════════════════════════════════════════════════════
//  WEEKLY FEED-VS-MILK TAB
// ═══════════════════════════════════════════════════════
function renderFeedVsMilkTab(){
  const rows=buildWeeklyFeedVsMilk();
  const totalSurplus=rows.reduce((s,r)=>s+r.surplus,0);
  const avgCoverage=rows.filter(r=>r.coverage!=null);
  const avgCov=avgCoverage.length?avgCoverage.reduce((s,r)=>s+r.coverage,0)/avgCoverage.length:null;
  return '<div class="alert alert-info"><i class="fas fa-circle-info"></i><span>هذا التقرير يحمّل تكلفة الأعلاف والصحة الأسبوعية لكامل القطيع على إيراد الحليب الأسبوعي (من محاسبة تاجر الحليب)، لمعرفة هل اللبن يغطي نفقات البهايم أسبوعياً والفائض أو العجز. الأسبوع يبدأ من السبت وينتهي بالجمعة.</span></div>'+
    '<div class="kpi-grid">'+
      kpiCard('صافي الفائض/العجز الكلي',fMoney(totalSurplus),'fa-scale-balanced',totalSurplus>=0?'green':'red')+
      kpiCard('متوسط نسبة التغطية',avgCov!=null?fN(avgCov)+'%':'—','fa-percent','blue')+
      kpiCard('عدد الأسابيع المسجلة',rows.length,'fa-calendar-week','')+
    '</div>'+
    '<div class="card"><div class="card-header"><div class="card-title">التفصيل الأسبوعي</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الأسبوع</th><th>إيراد الحليب</th><th>تكلفة الأعلاف</th><th>تكلفة الصحة</th><th>إجمالي التكلفة</th><th>الفائض/العجز</th><th>نسبة التغطية</th></tr></thead><tbody>'+
    (rows.length?rows.map(r=>'<tr><td style="font-weight:700">'+r.week+' → '+r.weekEnd+'</td>'+
      '<td class="amt-green">'+fMoney(r.milkRevenue)+'</td><td class="amt-red">'+fMoney(r.feedCost)+'</td><td class="amt-red">'+fMoney(r.healthCost)+'</td>'+
      '<td class="amt-red">'+fMoney(r.totalCost)+'</td>'+
      '<td class="'+(r.surplus>=0?'amt-green':'amt-red')+'">'+(r.surplus>=0?'+':'')+fMoney(r.surplus)+'</td>'+
      '<td>'+(r.coverage!=null?'<span class="tag '+(r.coverage>=100?'tag-green':r.coverage>=70?'tag-gold':'tag-red')+'">'+fN(r.coverage)+'%</span>':'—')+'</td></tr>'
    ).join(''):'<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--txt4)">لا توجد بيانات كافية بعد — سجّل محاسبة تاجر الحليب والمصروفات</td></tr>')+
    '</tbody></table></div></div>';
}

// ═══════════════════════════════════════════════════════
//  JOURNAL TAB (دفتر اليومية)
// ═══════════════════════════════════════════════════════
function renderJournalTab(){
  const journal=[...buildJournal()].reverse();
  return '<div class="alert alert-info"><i class="fas fa-circle-info"></i><span>دفتر اليومية يُولَّد تلقائياً من كل العمليات المسجلة في النظام (مبيعات، مصروفات، ديون...) — لا حاجة لإدخال قيود يدوية.</span></div>'+
    '<div class="card"><div class="card-header"><div class="card-title">دفتر اليومية (أحدث أولاً)</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>البيان</th><th>من حساب (مدين)</th><th>إلى حساب (دائن)</th><th>المبلغ</th></tr></thead><tbody>'+
    (journal.length?journal.map(j=>'<tr><td>'+j.date+'</td><td>'+esc(j.desc)+'</td>'+
      '<td><span class="tag tag-blue">'+j.debitCode+' — '+accountName(j.debitCode)+'</span></td>'+
      '<td><span class="tag tag-gray">'+j.creditCode+' — '+accountName(j.creditCode)+'</span></td>'+
      '<td class="amt">'+fMoney(j.amount)+'</td></tr>').join(''):'<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--txt4)">لا توجد قيود بعد</td></tr>')+
    '</tbody></table></div></div>';
}

// ═══════════════════════════════════════════════════════
//  LEDGER TAB (دفتر الأستاذ)
// ═══════════════════════════════════════════════════════
function renderLedgerTab(){
  const ledger=buildLedger();
  const codesWithActivity=(S.accounts||[]).filter(a=>ledger[a.code]&&ledger[a.code].length);
  return '<div class="alert alert-info"><i class="fas fa-circle-info"></i><span>دفتر الأستاذ يعرض الحركة التفصيلية والرصيد الجاري لكل حساب على حدة.</span></div>'+
    codesWithActivity.map(a=>{
      const rows=ledger[a.code];
      const finalBal=rows[rows.length-1].balance;
      return '<div class="card" style="margin-bottom:14px"><div class="card-header"><div class="card-title">'+a.code+' — '+esc(a.name)+'</div>'+
        '<span class="tag '+(finalBal>=0?'tag-green':'tag-red')+'">الرصيد: '+fMoney(Math.abs(finalBal))+(finalBal<0?' (دائن)':'')+'</span></div>'+
        '<div class="card-body p0"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>البيان</th><th>مدين</th><th>دائن</th><th>الرصيد</th></tr></thead><tbody>'+
        rows.map(r=>'<tr><td>'+r.date+'</td><td>'+esc(r.desc)+'</td>'+
          '<td class="amt-green">'+(r.debit?fMoney(r.debit):'—')+'</td><td class="amt-red">'+(r.credit?fMoney(r.credit):'—')+'</td>'+
          '<td class="amt">'+fMoney(r.balance)+'</td></tr>').join('')+
        '</tbody></table></div></div></div>';
    }).join('') || '<div class="alert alert-info">لا توجد حسابات نشطة بعد</div>';
}

// ═══════════════════════════════════════════════════════
//  TRIAL BALANCE TAB (ميزان المراجعة)
// ═══════════════════════════════════════════════════════
function renderTrialBalanceTab(){
  const tb=buildTrialBalance();
  return '<div class="alert '+(tb.balanced?'alert-success':'alert-danger')+'"><i class="fas '+(tb.balanced?'fa-check-circle':'fa-triangle-exclamation')+'"></i><span>'+
    (tb.balanced?'الميزان متوازن ✓ — إجمالي المدين يساوي إجمالي الدائن':'تنبيه: الميزان غير متوازن، يُرجى مراجعة البيانات')+'</span></div>'+
    '<div class="card"><div class="card-header"><div class="card-title">ميزان المراجعة</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الكود</th><th>الحساب</th><th>مدين</th><th>دائن</th></tr></thead><tbody>'+
    tb.rows.map(r=>'<tr><td>'+r.code+'</td><td style="font-weight:700">'+esc(r.name)+'</td><td class="amt-green">'+(r.debit?fMoney(r.debit):'—')+'</td><td class="amt-red">'+(r.credit?fMoney(r.credit):'—')+'</td></tr>').join('')+
    '<tr style="border-top:2px solid var(--brd)"><td colspan="2" style="font-weight:900;padding:10px 12px">الإجمالي</td><td class="amt-green" style="font-weight:900">'+fMoney(tb.totalDebit)+'</td><td class="amt-red" style="font-weight:900">'+fMoney(tb.totalCredit)+'</td></tr>'+
    '</tbody></table></div></div>';
}

// ═══════════════════════════════════════════════════════
//  INCOME STATEMENT TAB (قائمة الدخل)
// ═══════════════════════════════════════════════════════
function renderIncomeStatementTab(){
  const inc=buildIncomeStatement();
  return '<div class="kpi-grid">'+
      kpiCard('إجمالي الإيرادات',fMoney(inc.totalRev),'fa-arrow-trend-up','green')+
      kpiCard('إجمالي المصروفات',fMoney(inc.totalExp),'fa-arrow-trend-down','red')+
      kpiCard('صافي الدخل',fMoney(inc.net),'fa-chart-line',inc.net>=0?'green':'red')+
    '</div>'+
    '<div class="card"><div class="card-header"><div class="card-title">قائمة الدخل</div></div><div class="card-body p0">'+
    '<table class="tbl">'+
    '<tr style="background:var(--bg3)"><td colspan="2" style="padding:10px 12px;font-weight:900">الإيرادات</td></tr>'+
    inc.revRows.map(r=>reportRow(r.name,r.amount,'green')).join('')+
    reportRowTotal('إجمالي الإيرادات',inc.totalRev,'green')+
    '<tr style="background:var(--bg3)"><td colspan="2" style="padding:10px 12px;font-weight:900">المصروفات</td></tr>'+
    inc.expRows.map(r=>reportRow(r.name,r.amount,'red')).join('')+
    reportRowTotal('إجمالي المصروفات',inc.totalExp,'red')+
    reportRowTotal('صافي الدخل',inc.net,inc.net>=0?'green':'red')+
    '</table></div></div>';
}

// ═══════════════════════════════════════════════════════
//  BALANCE SHEET TAB (الميزانية)
// ═══════════════════════════════════════════════════════
function renderBalanceSheetTab(){
  const bs=buildBalanceSheet();
  return (bs.balanced?'':'<div class="alert alert-info"><i class="fas fa-circle-info"></i><span>قيم الأصول والحقوق هنا تقديرية مبنية على القيم الدفترية الحالية للأصول الحيوانية والمخزون، وقد تختلف بنسبة صغيرة بسبب التقريب.</span></div>')+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'+
      '<div class="card"><div class="card-header"><div class="card-title">الأصول</div></div><div class="card-body p0">'+
        '<table class="tbl">'+bs.assetRows.map(r=>reportRow(r.name,r.amount,'')).join('')+reportRowTotal('إجمالي الأصول',bs.totalAssets,'green')+'</table>'+
      '</div></div>'+
      '<div class="card"><div class="card-header"><div class="card-title">الالتزامات وحقوق الشركاء</div></div><div class="card-body p0">'+
        '<table class="tbl">'+
        '<tr style="background:var(--bg3)"><td colspan="2" style="padding:8px 12px;font-weight:800;font-size:12px">الالتزامات</td></tr>'+
        (bs.liabRows.length?bs.liabRows.map(r=>reportRow(r.name,r.amount,'red')).join(''):'<tr><td colspan="2" style="padding:8px 12px;color:var(--txt4);font-size:12px">لا توجد ديون مفتوحة</td></tr>')+
        reportRowTotal('إجمالي الالتزامات',bs.totalLiab,'red')+
        '<tr style="background:var(--bg3)"><td colspan="2" style="padding:8px 12px;font-weight:800;font-size:12px">حقوق الشركاء</td></tr>'+
        bs.equityRows.map(r=>reportRow(r.name,r.amount,'')).join('')+
        reportRowTotal('إجمالي حقوق الشركاء',bs.totalEquity,'')+
        reportRowTotal('الإجمالي (التزامات + حقوق)',bs.totalLiab+bs.totalEquity,bs.balanced?'green':'red')+
        '</table>'+
      '</div></div>'+
    '</div>';
}
