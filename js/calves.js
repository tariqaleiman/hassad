// ═══════════════════════════════════════════════════════
//  حصاد — CALVES MODULE
// ═══════════════════════════════════════════════════════
function renderCalvesPage(wrap){
  document.getElementById('topbar-actions').innerHTML='';
  const calves=(S.cattle||[]).filter(c=>isCalf(c));
  const females=calves.filter(c=>c.gender==='calf_f');
  const males=calves.filter(c=>c.gender==='calf_m');
  const totalCost=(S.calfLogs||[]).reduce((s,l)=>s+Number(l.cost||0),0);

  wrap.innerHTML=
    '<div class="kpi-grid">'+
      kpiCard('إجمالي العجول',calves.length,'fa-piggy-bank','')+
      kpiCard('عجلات (إناث)',females.length,'fa-venus','green')+
      kpiCard('عجول/تسمين (ذكور)',males.length,'fa-mars','blue')+
      kpiCard('تكاليف الرعاية والتربية',fMoney(totalCost),'fa-coins','red')+
    '</div>'+
    (calves.length?
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:14px;margin-bottom:20px">'+calves.map(c=>calfCard(c)).join('')+'</div>'
      :emptyState('fa-piggy-bank','لا توجد عجول حالياً','يتم إضافة العجول تلقائياً عند تسجيل ولادة جديدة من صفحة "التلقيح والتناسل"',null))+
    '<div class="card"><div class="card-header"><div class="card-title">سجل مصروفات تربية العجول</div></div><div class="card-body p0">'+
    calfLogsTable()+
    '</div></div>';
}
function calfCard(c){
  try{
    return calfCardInner(c);
  }catch(err){
    console.error('calfCard render error for cattle id='+(c&&c.id)+':',err);
    return '<div class="animal-card"><div class="ac-body"><div class="alert alert-danger"><i class="fas fa-triangle-exclamation"></i><span>خطأ في عرض سجل العجل #'+(c&&c.id)+' ('+esc(c&&c.name||'بدون اسم')+'). <button class="link-btn" onclick="openAnimalDetail('+(c&&c.id)+')">فتح الملف</button></span></div></div></div>';
  }
}
function calfCardInner(c){
  const cost=(S.calfLogs||[]).filter(l=>l.calfId===c.id).reduce((s,l)=>s+Number(l.cost||0),0);
  const mother=c.motherId?(S.cattle||[]).find(x=>x.id===c.motherId):null;
  return '<div class="animal-card">'+
    '<div class="ac-stripe '+cowStripe(c)+'"></div>'+
    '<div class="ac-head"><div class="ac-info">'+
      '<div class="ac-avatar"><i class="fas fa-piggy-bank"></i></div>'+
      '<div><div class="ac-name">'+esc(c.name)+'</div>'+
      '<div class="ac-sub">'+(c.dob?ageStr(c.dob):'—')+(mother?' | الأم: '+esc(mother.name):'')+'</div>'+
      '<div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap">'+cowBadges(c)+'</div>'+
      ownerPillsHTML(c.owners)+
      '</div></div></div>'+
    '<div class="ac-body">'+
      '<div class="ac-stats">'+
        '<div class="ac-stat"><div class="ac-stat-val">'+fMoney(cost)+'</div><div class="ac-stat-lbl">تكلفة التربية</div></div>'+
        '<div class="ac-stat"><div class="ac-stat-val">'+(c.gender==='calf_f'?'عجلة':'عجل')+'</div><div class="ac-stat-lbl">النوع</div></div>'+
        '<div class="ac-stat"><div class="ac-stat-val">'+(c.lifecycle==='fattening'?'تسمين':'رضاعة')+'</div><div class="ac-stat-lbl">المرحلة</div></div>'+
      '</div>'+
      '<div class="ac-actions">'+
        '<button class="btn btn-sm btn-outline" onclick="openAnimalDetail('+c.id+')"><i class="fas fa-file-alt"></i> الملف</button>'+
        '<button class="btn btn-sm btn-outline" onclick="openCalfLogModal('+c.id+')"><i class="fas fa-receipt"></i> مصروف</button>'+
        (c.gender==='calf_f'?'<button class="btn btn-sm btn-outline" onclick="promoteCalf('+c.id+')"><i class="fas fa-arrow-up"></i> ترقية</button>':'')+
        '<button class="btn btn-sm btn-outline" onclick="openStatusModal('+c.id+')"><i class="fas fa-rotate"></i> الحالة</button>'+
        '<button class="btn btn-sm btn-outline" onclick="openSellForCow('+c.id+')"><i class="fas fa-hand-holding-usd"></i> بيع</button>'+
      '</div>'+
    '</div></div>';
}
function calfLogsTable(){
  const logs=[...(S.calfLogs||[])].sort((a,b)=>b.date.localeCompare(a.date));
  if(!logs.length) return '<div style="padding:24px;text-align:center;color:var(--txt4)">لا توجد سجلات</div>';
  const typeLabels={feed:'تغذية',vet:'بيطري',other:'أخرى'};
  return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>العجل</th><th>النوع</th><th>الكمية</th><th>التكلفة</th><th>ملاحظات</th><th></th></tr></thead><tbody>'+
    logs.map(l=>{
      const c=(S.cattle||[]).find(x=>x.id===l.calfId);
      return '<tr><td>'+l.date+'</td><td style="font-weight:700">'+(c?esc(c.name):'—')+'</td><td><span class="tag tag-gray">'+(typeLabels[l.type]||l.type)+'</span></td>'+
        '<td>'+(l.qty?fN(l.qty)+' '+esc(l.unit||''):'—')+'</td><td class="amt-red">'+fMoney(l.cost)+'</td><td>'+esc(l.notes||'—')+'</td>'+
        '<td><button class="btn-icon danger" onclick="deleteCalfLog('+l.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></td></tr>';
    }).join('')+
  '</tbody></table></div>';
}

function promoteCalf(id){
  const c=(S.cattle||[]).find(x=>x.id===id);if(!c)return;
  confirmAction('ترقية "'+c.name+'" إلى بقرة بالغة؟ ستظهر في صفحة القطيع بحالة "جافة" ويمكنك تحديث حالتها بعد ذلك.',()=>{
    c.gender='female';c.lifecycle='active';c.milkStatus='dry';c.pregnant=false;c.pregMonths=null;c.dueDate=null;
    c.statusLog=(c.statusLog||[]).concat([{date:TODAY,field:'lifecycle',from:'calf',to:'active',note:'ترقية إلى بقرة بالغة'}]);
    schedSave();renderPage(currentPage);toast('تمت الترقية إلى بقرة بالغة 🐄');
  });
}
function openCalfLogModal(calfId){
  populateAnimalSels();
  document.getElementById('cl-date').value=TODAY;
  ['cl-qty','cl-unit','cl-cost','cl-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('cl-type').value='feed';
  const sel=document.getElementById('cl-calf');
  sel.innerHTML=(S.cattle||[]).filter(c=>isCalf(c)).map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join('');
  sel.value=calfId;
  openModal('m-calflog');
}
function saveCalfLog(){
  const calfId=Number(document.getElementById('cl-calf').value),date=document.getElementById('cl-date').value;
  if(!calfId||!date){toast('⚠ اختر العجل والتاريخ');return;}
  S.calfLogs=S.calfLogs||[];
  S.calfLogs.push({id:uid(),calfId,date,type:document.getElementById('cl-type').value,qty:parseFloat(document.getElementById('cl-qty').value)||0,unit:document.getElementById('cl-unit').value.trim(),cost:parseFloat(document.getElementById('cl-cost').value)||0,notes:document.getElementById('cl-notes').value.trim()});
  schedSave();closeModal('m-calflog');renderPage(currentPage);toast('تم تسجيل المصروف');
}
function deleteCalfLog(id){
  confirmAction('حذف هذا السجل؟',()=>{S.calfLogs=(S.calfLogs||[]).filter(l=>l.id!==id);schedSave();renderPage(currentPage);toast('تم الحذف');});
}
