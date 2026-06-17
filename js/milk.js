// ═══════════════════════════════════════════════════════
//  حصاد — MILK MODULE
// ═══════════════════════════════════════════════════════
const SESSION_LABELS={full:'يوم كامل',am:'صباحي',pm:'مسائي'};

function traderAdvancesCard(){
  const advances=[...(S.traderAdvances||[])].sort((a,b)=>b.date.localeCompare(a.date));
  if(!advances.length) return '';
  const traders=new Set(advances.map(a=>a.trader));
  const outstandingRows=[...traders].map(t=>({trader:t,balance:traderAdvanceBalance(t)})).filter(r=>r.balance>0.01);
  return '<div class="card" style="margin-bottom:16px"><div class="card-header"><div class="card-title"><i class="fas fa-hand-holding-usd"></i> سلف تجار الحليب</div></div><div class="card-body p0">'+
    (outstandingRows.length?'<div style="padding:12px"><div class="split-grid">'+outstandingRows.map(r=>
      '<div class="split-card" style="border-color:var(--orange)"><div class="sc-name">'+esc(r.trader)+'</div><div class="sc-val" style="color:var(--orange)">'+fMoney(r.balance)+'</div><div class="sc-sub">سلفة مستحقة لم تُخصم بعد</div></div>'
    ).join('')+'</div></div>':'')+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>التاجر</th><th>القيمة</th><th>ملاحظات</th><th></th></tr></thead><tbody>'+
    advances.map(a=>'<tr><td>'+a.date+'</td><td style="font-weight:700">'+esc(a.trader)+'</td><td class="amt-red">'+fMoney(a.amount)+'</td><td>'+esc(a.notes||'—')+'</td>'+
      '<td><button class="btn-icon danger" onclick="deleteTraderAdvance('+a.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></td></tr>').join('')+
    '</tbody></table></div></div></div>';
}
function activeLactatingCows(){return (S.cattle||[]).filter(c=>isActiveFemale(c)&&c.milkStatus==='lactating');}

function dailyTotals(){
  // returns map date -> {full,am,pm,total}
  const map={};
  (S.milkLogs||[]).forEach(l=>{
    const t=Object.values(l.qtys||{}).reduce((s,v)=>s+Number(v||0),0);
    map[l.date]=map[l.date]||{full:0,am:0,pm:0,total:0};
    map[l.date][l.session||'full']+=t;
    map[l.date].total+=t;
  });
  return map;
}

function renderMilkPage(wrap){
  document.getElementById('topbar-actions').innerHTML=
    '<button class="btn btn-outline" onclick="openTraderAdvanceModal()"><i class="fas fa-hand-holding-usd"></i> تسجيل سلفة لتاجر</button>'+
    '<button class="btn btn-outline" onclick="openFridayModal()"><i class="fas fa-file-invoice-dollar"></i> محاسبة تاجر</button>'+
    '<button class="btn btn-primary" onclick="openMilkModal(null)"><i class="fas fa-plus"></i> تسجيل إنتاج</button>';
  const logs=[...(S.milkLogs||[])].sort((a,b)=>(b.date+(b.session||'')).localeCompare(a.date+(a.session||'')));
  const frs=[...(S.fridays||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const lastFri=frs[0];
  const since=lastFri?lastFri.date:'2000-01-01';
  const pendQty=(S.milkLogs||[]).filter(l=>l.date>since).reduce((s,l)=>s+Object.values(l.qtys||{}).reduce((a,v)=>a+Number(v||0),0),0);
  const dt=dailyTotals();
  const last14dates=Object.keys(dt).sort((a,b)=>b.localeCompare(a)).slice(0,14);
  const weekTotal=last14dates.slice(0,7).reduce((s,d)=>s+dt[d].total,0);
  const nd=new Date(); while(nd.getDay()!==5)nd.setDate(nd.getDate()+1);
  const dtf=dBetween(TODAY,nd.toISOString().split('T')[0]);
  const totalRevAll=(S.fridays||[]).reduce((s,f)=>s+Number(f.received||0),0);
  const lactCows=activeLactatingCows();

  wrap.innerHTML=
    '<div class="kpi-grid">'+
      kpiCard('حليب هذا الأسبوع',fN(weekTotal)+' كيلو','fa-wine-bottle','green')+
      kpiCard('منذ آخر محاسبة',fN(pendQty)+' كيلو','fa-clock','gold')+
      kpiCard('للجمعة القادمة',dtf+' يوم','fa-calendar','blue')+
      kpiCard('إجمالي إيرادات الحليب',fMoney(totalRevAll),'fa-coins','green')+
    '</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">'+
      '<div class="card"><div class="card-header"><div class="card-title">الكمية اليومية — آخر 14 يوم</div></div><div class="card-body">'+milkChart(last14dates,dt)+'</div></div>'+
      '<div class="card"><div class="card-header"><div class="card-title">محاسبات تاجر الحليب</div></div><div class="card-body p0">'+fridayTable(frs)+'</div></div>'+
    '</div>'+
    traderAdvancesCard()+
    // Per-cow revenue split (ownership)
    '<div class="card" style="margin-bottom:16px"><div class="card-header"><div class="card-title"><i class="fas fa-sitemap"></i> توزيع إيراد الحليب على الشركاء (حسب نسبة ملكية كل بقرة)</div></div><div class="card-body p0">'+
    milkOwnershipTable()+
    '</div></div>'+
    '<div class="card"><div class="card-header"><div class="card-title">سجل الحليب اليومي</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>الفترة</th><th>طريقة الإدخال</th>'+lactCows.map(c=>'<th>'+esc(c.name)+'</th>').join('')+'<th>الإجمالي</th><th></th></tr></thead>'+
    '<tbody>'+(logs.length?logs.slice(0,40).map(l=>{
      const total=Object.values(l.qtys||{}).reduce((s,v)=>s+Number(v||0),0);
      const modeLabel=l.entryMode==='total'?'<span class="tag tag-gold">إجمالي موزّع</span>':l.entryMode==='single'?'<span class="tag tag-blue">بقرة واحدة</span>':'<span class="tag tag-green">تفصيلي</span>';
      return '<tr><td>'+l.date+'</td><td><span class="tag tag-gray">'+(SESSION_LABELS[l.session]||'يوم كامل')+'</span></td><td>'+modeLabel+'</td>'+lactCows.map(c=>'<td class="amt">'+(l.qtys&&l.qtys[c.id]!=null?fN(l.qtys[c.id]):'-')+'</td>').join('')+
        '<td class="amt-green">'+fN(total)+'</td>'+
        '<td><div style="display:flex;gap:4px"><button class="btn-icon" onclick="openMilkModal('+l.id+')"><i class="fas fa-pen" style="font-size:11px"></i></button><button class="btn-icon danger" onclick="deleteMilkLog('+l.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></div></td></tr>';
    }).join(''):'<tr><td colspan="'+(4+lactCows.length)+'" style="text-align:center;padding:30px;color:var(--txt4)">لا توجد سجلات بعد</td></tr>')+
    '</tbody></table></div></div></div>';
}

function milkChart(dates,dt){
  if(!dates.length) return '<div style="text-align:center;color:var(--txt4);font-size:13px">لا بيانات</div>';
  const totals=dates.map(d=>dt[d].total);
  const max=Math.max(...totals,1);
  return '<div style="display:flex;gap:3px;align-items:flex-end;height:80px">'+
    [...dates].reverse().map((d,i)=>{
      const t=totals[dates.length-1-i],h=Math.max(Math.round(t/max*76),2);
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">'+
        '<div style="font-size:8px;color:var(--txt4)">'+fN(t)+'</div>'+
        '<div style="width:100%;height:'+h+'px;background:var(--pr3);border-radius:2px 2px 0 0"></div>'+
        '<div style="font-size:8px;color:var(--txt4)">'+d.slice(8)+'</div></div>';
    }).join('')+
  '</div>';
}
function fridayTable(frs){
  if(!frs.length) return '<div style="padding:20px;text-align:center;color:var(--txt4);font-size:13px">لا توجد محاسبات بعد</div>';
  return '<table class="tbl"><thead><tr><th>التاريخ</th><th>الكمية</th><th>السعر</th><th>المقبوض</th><th></th></tr></thead><tbody>'+
    frs.slice(0,8).map(f=>'<tr><td>'+f.date+'</td><td>'+fN(f.qty)+' ك</td><td>'+fN(f.price)+' ج</td><td class="amt-green">'+fMoney(f.received)+'</td>'+
      '<td><button class="btn-icon danger" onclick="deleteFriday('+f.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></td></tr>').join('')+
  '</tbody></table>';
}
function milkOwnershipTable(){
  const perCow=milkRevenuePerCow();
  const cows=Object.keys(perCow).map(Number).filter(id=>perCow[id].qty>0);
  if(!cows.length) return '<div style="padding:20px;text-align:center;color:var(--txt4);font-size:13px">لا توجد بيانات كافية (سجل الإنتاج ومحاسبة التاجر)</div>';
  return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>البقرة</th><th>إجمالي الإنتاج</th><th>إيراد البقرة التقديري</th>'+
    (S.partners||[]).map(p=>'<th>نصيب '+esc(p.name)+'</th>').join('')+'</tr></thead><tbody>'+
    cows.map(id=>{
      const c=(S.cattle||[]).find(x=>x.id===id);
      const row=perCow[id];
      return '<tr><td style="font-weight:700">'+(c?esc(c.name):'#'+id)+'</td><td>'+fN(row.qty)+' ك</td><td class="amt">'+fMoney(row.revenue)+'</td>'+
        (S.partners||[]).map(p=>'<td class="amt-green">'+fMoney(row.revenue*shareFor(c?c.owners:[],p.id)/100)+'</td>').join('')+
      '</tr>';
    }).join('')+
  '</tbody></table></div>';
}

// ---------- Modal ----------
let milkEntryMode='batch'; // 'batch' = each cow separately, 'single' = one cow only, 'total' = one overall number split across all lactating cows
function openMilkModal(editId){
  const l=editId?(S.milkLogs||[]).find(x=>x.id===editId):null;
  document.getElementById('ml-edit-id').value=editId||'';
  document.getElementById('ml-date').value=l?l.date:TODAY;
  document.getElementById('ml-notes').value=l?(l.notes||''):'';
  document.getElementById('m-milk-title').textContent=l?'تعديل سجل حليب':'تسجيل إنتاج الحليب';
  // restore the mode this log was originally entered with, when known; otherwise infer a sensible default
  if(l && l.entryMode){
    milkEntryMode=l.entryMode;
  } else if(l && Object.keys(l.qtys||{}).length===1){
    milkEntryMode='single';
  } else if(!l){
    milkEntryMode='total'; // most common real-world case: one combined number for the whole herd
  } else {
    milkEntryMode='batch';
  }
  setMilkEntryMode(milkEntryMode);
  setMilkSession(l?l.session:'full', l);
  openModal('m-milk');
}
function setMilkEntryMode(mode){
  milkEntryMode=mode;
  document.querySelectorAll('#ml-mode-seg button').forEach(b=>b.classList.toggle('on',b.dataset.m===mode));
  document.getElementById('ml-single-cow-fg').style.display=mode==='single'?'block':'none';
  buildMilkCowsList(null);
}
function setMilkSession(session,existing){
  document.querySelectorAll('#ml-session-seg button').forEach(b=>b.classList.toggle('on',b.dataset.s===session));
  document.getElementById('ml-session').value=session;
  buildMilkCowsList(existing);
}
function buildMilkCowsList(existing){
  const wrap=document.getElementById('ml-cows-list');
  const ac=activeLactatingCows();
  if(!ac.length){wrap.innerHTML='<p style="color:var(--txt4);text-align:center;padding:16px">لا توجد أبقار حلوب حالياً — يمكنك تغيير حالة الأبقار من صفحة القطيع</p>';return;}
  const session=document.getElementById('ml-session').value;
  const date=document.getElementById('ml-date').value;
  let qtys={};
  if(existing) qtys=existing.qtys||{};
  else { const found=(S.milkLogs||[]).find(x=>x.date===date&&(x.session||'full')===session); if(found) qtys=found.qtys||{}; }
  window._milkQtysCache=qtys; // used by single-cow mode to read/preserve other cows' values

  if(milkEntryMode==='single'){
    document.getElementById('ml-single-cow').innerHTML=ac.map(c=>'<option value="'+c.id+'">'+esc(c.name)+(c.breed?' ('+esc(c.breed)+')':'')+'</option>').join('');
    document.getElementById('ml-single-cow').onchange=renderSingleCowQtyInput;
    renderSingleCowQtyInput();
  } else if(milkEntryMode==='total'){
    const existingTotal=Object.values(qtys).reduce((s,v)=>s+Number(v||0),0);
    wrap.innerHTML=
      '<div class="fg"><label>إجمالي الكمية لكل القطيع الحلوب (كيلو)</label>'+
      '<input type="number" id="mlq-total" placeholder="مثال: 11" min="0" step="0.25" style="direction:ltr" value="'+(existingTotal>0?existingTotal:'')+'"></div>'+
      '<div class="hint"><i class="fas fa-circle-info"></i> سيتم توزيع هذه الكمية بالتساوي تلقائياً على عدد الأبقار الحلوب ('+ac.length+' بقرة) — لا حاجة لمعرفة نصيب كل بقرة بدقة.</div>'+
      '<div style="margin-top:10px;font-size:12px;color:var(--txt3)">الأبقار الحلوب المشمولة: '+ac.map(c=>esc(c.name)).join('، ')+'</div>';
  } else {
    wrap.innerHTML=ac.map(c=>'<div class="fg"><label>'+esc(c.name)+(c.breed?' ('+esc(c.breed)+')':'')+'</label><input type="number" id="mlq-'+c.id+'" placeholder="0 كيلو" min="0" step="0.25" style="direction:ltr" value="'+(qtys[c.id]!=null?qtys[c.id]:'')+'"></div>').join('');
  }
}
function renderSingleCowQtyInput(){
  const wrap=document.getElementById('ml-cows-list');
  const cowId=Number(document.getElementById('ml-single-cow').value);
  const qtys=window._milkQtysCache||{};
  const val=qtys[cowId]!=null?qtys[cowId]:'';
  wrap.innerHTML='<div class="fg"><label>الكمية (كيلو)</label><input type="number" id="mlq-single-current" placeholder="0 كيلو" min="0" step="0.25" style="direction:ltr" value="'+val+'" oninput="persistSingleCowQty()"></div>'+
    '<div class="hint">القيم المسجلة مسبقاً لباقي الأبقار (إن وُجدت) في هذا التاريخ والفترة لن تُحذف عند الحفظ.</div>';
}
function persistSingleCowQty(){
  const cowId=Number(document.getElementById('ml-single-cow').value);
  const v=parseFloat(document.getElementById('mlq-single-current').value);
  window._milkQtysCache=window._milkQtysCache||{};
  if(v>0) window._milkQtysCache[cowId]=v;
  else delete window._milkQtysCache[cowId];
}
function saveMilkLog(){
  const date=document.getElementById('ml-date').value;if(!date){toast('⚠ أدخل التاريخ');return;}
  const session=document.getElementById('ml-session').value||'full';
  const editId=document.getElementById('ml-edit-id').value;
  let qtys={};
  if(milkEntryMode==='single'){
    persistSingleCowQty();
    qtys=Object.assign({},window._milkQtysCache||{});
  } else if(milkEntryMode==='total'){
    const total=parseFloat(document.getElementById('mlq-total')?.value)||0;
    if(total<=0){toast('⚠ أدخل الكمية الإجمالية');return;}
    const ac=activeLactatingCows();
    if(!ac.length){toast('⚠ لا توجد أبقار حلوب حالياً');return;}
    const share=total/ac.length;
    ac.forEach(c=>{ qtys[c.id]=Math.round(share*1000)/1000; });
    // fix rounding drift: adjust the first cow so the sum exactly equals the entered total
    const sum=Object.values(qtys).reduce((s,v)=>s+v,0);
    const drift=total-sum;
    if(Math.abs(drift)>0.001) qtys[ac[0].id]=Math.round((qtys[ac[0].id]+drift)*1000)/1000;
  } else {
    activeLactatingCows().forEach(c=>{
      const v=parseFloat(document.getElementById('mlq-'+c.id)?.value);
      if(v>0)qtys[c.id]=v;
    });
  }
  if(!Object.keys(qtys).length){toast('⚠ أدخل كمية واحدة على الأقل');return;}
  S.milkLogs=S.milkLogs||[];
  if(editId){
    const l=S.milkLogs.find(x=>x.id===Number(editId));
    if(l){l.date=date;l.session=session;l.qtys=qtys;l.notes=document.getElementById('ml-notes').value.trim();l.entryMode=milkEntryMode;}
  } else {
    // replace any existing entry for same date+session (avoid duplicates)
    S.milkLogs=S.milkLogs.filter(x=>!(x.date===date&&(x.session||'full')===session));
    S.milkLogs.push({id:uid(),date,session,qtys,notes:document.getElementById('ml-notes').value.trim(),entryMode:milkEntryMode});
  }
  schedSave();closeModal('m-milk');renderPage(currentPage);toast('تم حفظ سجل الحليب');
}
function deleteMilkLog(id){
  confirmAction('حذف سجل الحليب هذا؟',()=>{
    S.milkLogs=(S.milkLogs||[]).filter(l=>l.id!==id);schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}

// ---------- Friday settlement ----------
// IMPORTANT: milk produced ON the settlement date itself is NOT included in this
// settlement — it rolls forward into the next settlement period. This matches
// the real workflow: when you settle accounts with the trader on a given day,
// that day's milk hasn't been picked up/counted yet by him.
function openFridayModal(){
  const frs=[...(S.fridays||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const since=frs[0]?frs[0].date:'2000-01-01';
  const settleDate=TODAY;
  const pLogs=(S.milkLogs||[]).filter(l=>l.date>since && l.date<settleDate);
  const qty=pLogs.reduce((s,l)=>s+Object.values(l.qtys||{}).reduce((a,v)=>a+Number(v||0),0),0);
  document.getElementById('fri-qty').value=fN(qty);
  document.getElementById('fri-qty-raw').value=qty;
  document.getElementById('fri-date').value=settleDate;
  ['fri-price','fri-total','fri-received','fri-notes'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  populateTraderSel();
  // remember last-used trader as default
  const lastTrader = frs[0]?frs[0].trader : (S.lastMilkTrader||'');
  document.getElementById('fri-trader').value=lastTrader||'';
  document.getElementById('fri-summary-box').innerHTML='<strong>الكمية المتراكمة من '+addDays(since,1)+' إلى '+addDays(settleDate,-1)+': '+fN(qty)+' كيلو</strong><div class="hint" style="margin-top:4px">حليب يوم المحاسبة نفسه ('+settleDate+') لا يُحسب الآن — سيُضاف للأسبوع القادم تلقائياً.</div>';
  // show outstanding advance (سلفة) from this trader, if any
  refreshTraderAdvanceBox();
  openModal('m-friday');
}
function populateTraderSel(){
  const dl=document.getElementById('fri-trader-list');
  if(!dl) return;
  const traders=new Set((S.fridays||[]).map(f=>f.trader).filter(Boolean));
  dl.innerHTML=[...traders].map(t=>'<option value="'+esc(t)+'">').join('');
}
function refreshTraderAdvanceBox(){
  const trader=document.getElementById('fri-trader').value.trim();
  const box=document.getElementById('fri-advance-box');
  if(!box) return;
  if(!trader){ box.innerHTML=''; document.getElementById('fri-advance-deduct').value='0'; return; }
  const outstanding=traderAdvanceBalance(trader);
  if(outstanding>0){
    box.innerHTML='<div class="alert alert-warn"><i class="fas fa-hand-holding-usd"></i><span>يوجد سلفة سابقة مستحقة على هذا التاجر: <strong>'+fMoney(outstanding)+'</strong> — يمكنك خصم جزء أو كل قيمتها من هذه المحاسبة.</span></div>'+
      '<div class="fg"><label>قيمة السلفة المخصومة من هذه المحاسبة (ج)</label><input type="number" id="fri-advance-deduct" placeholder="0" min="0" max="'+outstanding+'" value="0" oninput="calcFriday()"></div>';
  } else {
    box.innerHTML='';
    document.getElementById('fri-advance-deduct')?.remove?.();
  }
}
function traderAdvanceBalance(trader){
  const given=(S.traderAdvances||[]).filter(a=>a.trader===trader).reduce((s,a)=>s+Number(a.amount||0),0);
  const settled=(S.fridays||[]).filter(f=>f.trader===trader).reduce((s,f)=>s+Number(f.advanceDeducted||0),0);
  return Math.max(0,given-settled);
}
function calcFriday(){
  const p=parseFloat(document.getElementById('fri-price').value)||0;
  const q=parseFloat(document.getElementById('fri-qty-raw').value)||0;
  const total=(p*q);
  document.getElementById('fri-total').value=total?total.toFixed(0):'';
  const advanceDeduct=parseFloat(document.getElementById('fri-advance-deduct')?.value)||0;
  const net=Math.max(0,total-advanceDeduct);
  // default "received" to match "total due" (minus any advance deduction) — auto-fill, still editable
  document.getElementById('fri-received').value=net?net.toFixed(0):'';
}
function saveFriday(){
  const date=document.getElementById('fri-date').value,price=parseFloat(document.getElementById('fri-price').value)||0;
  if(!date||!price){toast('⚠ أدخل التاريخ والسعر');return;}
  const trader=document.getElementById('fri-trader').value.trim();
  const qty=parseFloat(document.getElementById('fri-qty-raw').value)||0;
  const received=parseFloat(document.getElementById('fri-received').value)||0;
  const advanceDeducted=Math.min(parseFloat(document.getElementById('fri-advance-deduct')?.value)||0, traderAdvanceBalance(trader));
  S.fridays=S.fridays||[];
  S.fridays.push({id:uid(),date,trader,price,qty,total:price*qty,received,advanceDeducted,notes:document.getElementById('fri-notes').value.trim()});
  S.lastMilkTrader=trader;
  schedSave();closeModal('m-friday');renderPage(currentPage);toast('تم حفظ المحاسبة');
}
function deleteFriday(id){
  confirmAction('حذف محاسبة تاجر الحليب هذه؟',()=>{
    S.fridays=(S.fridays||[]).filter(f=>f.id!==id);schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}

// ---------- Trader advances (سلفة) ----------
function openTraderAdvanceModal(){
  populateTraderSel();
  document.getElementById('adv-date').value=TODAY;
  document.getElementById('adv-trader').value=S.lastMilkTrader||'';
  document.getElementById('adv-amount').value='';
  document.getElementById('adv-notes').value='';
  openModal('m-traderadvance');
}
function saveTraderAdvance(){
  const trader=document.getElementById('adv-trader').value.trim(),date=document.getElementById('adv-date').value;
  const amount=parseFloat(document.getElementById('adv-amount').value)||0;
  if(!trader||!date||amount<=0){toast('⚠ أدخل اسم التاجر والتاريخ والقيمة');return;}
  S.traderAdvances=S.traderAdvances||[];
  S.traderAdvances.push({id:uid(),trader,date,amount,notes:document.getElementById('adv-notes').value.trim()});
  S.lastMilkTrader=trader;
  schedSave();closeModal('m-traderadvance');renderPage(currentPage);toast('تم تسجيل السلفة');
}
function deleteTraderAdvance(id){
  confirmAction('حذف سجل السلفة هذا؟',()=>{
    S.traderAdvances=(S.traderAdvances||[]).filter(a=>a.id!==id);schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}
