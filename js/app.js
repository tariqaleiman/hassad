// ═══════════════════════════════════════════════════════
//  حصاد — APP SHELL: ROUTING, NAV, INIT, DASHBOARD
// ═══════════════════════════════════════════════════════

const PAGE_TITLES={
  dashboard:'لوحة التحكم',
  lands:'الأراضي',
  seasons:'المواسم الزراعية',
  crops:'المحاصيل والمراعي',
  cropops:'العمليات الزراعية',
  harvest:'الحصاد والمخلفات',
  cattle:'القطيع',
  milk:'الحليب',
  repro:'التلقيح والتناسل',
  calves:'العجول',
  health:'الصحة والرعاية',
  inventory:'المخزون والصيانة',
  partners:'الشركاء والملكية',
  debts:'الحسابات والديون',
  reports:'التقارير المالية'
};
let currentPage='dashboard';

function goPage(name,btn){
  currentPage=name;
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  else { const b=document.querySelector('.nav-item[data-page="'+name+'"]'); if(b) b.classList.add('active'); }
  document.getElementById('topbar-title').textContent=PAGE_TITLES[name]||name;
  document.getElementById('topbar-actions').innerHTML='';
  renderPage(name);
  if(window.innerWidth<=768){const s=document.getElementById('sidebar');s.classList.remove('open');document.getElementById('sb-overlay').classList.remove('open');}
}
function toggleSidebar(){
  const s=document.getElementById('sidebar'),o=document.getElementById('sb-overlay');
  s.classList.toggle('open');o.classList.toggle('open');
}

function renderPage(name){
  const wrap=document.getElementById('content-wrap');
  const pages={
    dashboard: renderDashboard,
    lands:     renderLandsPage,
    seasons:   renderSeasonsPage,
    crops:     renderCropsPage,
    cropops:   renderCropOpsPage,
    harvest:   renderHarvestPage,
    cattle:    renderCattlePage,
    milk:      renderMilkPage,
    repro:     renderReproPage,
    calves:    renderCalvesPage,
    health:    renderHealthPage,
    inventory: renderInventoryPage,
    partners:  renderPartnersPage,
    debts:     renderDebtsPage,
    reports:   renderReportsPage,
  };
  if(!pages[name]){ wrap.innerHTML='<p>قريباً...</p>'; return; }
  try{
    pages[name](wrap);
  }catch(err){
    console.error('renderPage error on "'+name+'":',err);
    wrap.innerHTML='<div class="alert alert-danger" style="margin:20px"><i class="fas fa-triangle-exclamation"></i><span>حدث خطأ غير متوقع أثناء عرض هذه الصفحة. تم تسجيل التفصيل في console المتصفح (F12). لن تتأثر بياناتك المحفوظة. حاول إعادة تحميل الصفحة، وإذا تكررت المشكلة أبلغ بتفاصيل آخر إجراء قمت به.<br><small style="opacity:.7">'+esc(err.message||String(err))+'</small></span></div>';
  }
}

// ═══════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════
function renderDashboard(wrap){
  const activeCrops=(S.crops||[]).filter(c=>c.status==='growing').length;
  const activeCattle=(S.cattle||[]).filter(c=>!isOut(c)).length;
  const fin=computeFinanceTotals();
  const totalDebt=(S.debts||[]).filter(d=>d.linkType!=='personal'&&d.status!=='paid').reduce((s,d)=>s+Number(d.remaining!=null?d.remaining:d.amount||0),0);
  const cur=activeSeason();
  const curFin=cur?seasonFinancials(cur.id):null;

  // Active season banner
  const seasonBanner = cur?
    '<div class="card" style="margin-bottom:16px;background:var(--bg3);border-color:var(--pr2)">'+
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">'+
        '<div style="display:flex;align-items:center;gap:10px">'+
          '<i class="fas '+seasonTypeIcon(cur.type)+'" style="font-size:20px;color:var(--pr2)"></i>'+
          '<div>'+
            '<div style="font-size:13px;font-weight:800">الموسم النشط: '+esc(cur.name)+'</div>'+
            '<div style="font-size:11px;color:var(--txt3)">'+seasonTypeLabel(cur.type)+' '+cur.year+(cur.startDate?' · منذ '+cur.startDate:'')+'</div>'+
          '</div>'+
        '</div>'+
        '<button class="btn btn-sm btn-outline" onclick="goPage(\'seasons\',null)"><i class="fas fa-exchange-alt"></i> تغيير</button>'+
      '</div>'+
      (curFin?'<div class="kpi-grid" style="margin-top:12px">'+
        kpiCard('محاصيل الموسم',activeCrops+' نشط','fa-leaf','green')+
        kpiCard('تكاليف الموسم',fMoney(curFin.cost),'fa-coins','red')+
        kpiCard('إيرادات الموسم',fMoney(curFin.revenue),'fa-arrow-trend-up','green')+
        kpiCard('صافي الموسم',fMoney(curFin.net),'fa-chart-line',curFin.net>=0?'green':'red')+
      '</div>':'')+
    '</div>'
    :'<div class="alert alert-info"><i class="fas fa-calendar-alt"></i><span>لا يوجد موسم نشط — <button class="link-btn" onclick="goPage(\'seasons\',null)">أضف موسماً الآن</button> لتنظيم محاصيلك وتتبع مالية كل موسم بشكل منفصل.</span></div>';

  // Alerts
  let alerts='';
  (S.cattle||[]).filter(c=>c.pregnant&&c.dueDate).forEach(c=>{
    const left=dBetween(TODAY,c.dueDate);
    if(left<=30&&left>=0) alerts+='<div class="alert alert-warn"><i class="fas fa-exclamation-triangle"></i><span>'+esc(c.name)+': موعد الولادة بعد '+left+' يوم ('+c.dueDate+')</span></div>';
    if(left<0) alerts+='<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i><span>'+esc(c.name)+': تأخرت الولادة! كان موعدها '+c.dueDate+'</span></div>';
    if(left<=60&&left>30&&c.status!=='dry') alerts+='<div class="alert alert-info"><i class="fas fa-pause-circle"></i><span>'+esc(c.name)+': يُفضّل بدء فترة الجفاف قريباً (متبقي '+left+' يوم على الولادة المتوقعة)</span></div>';
  });
  // Insemination Alerts
  (S.cattle||[]).filter(c=>!c.pregnant).forEach(c=>{
    const cowInsems = (S.insems||[]).filter(i => i.cowId === c.id).sort((a,b) => b.date.localeCompare(a.date));
    if(cowInsems.length > 0) {
      const lastInsem = cowInsems[0];
      const hasCheck = (S.pregChecks||[]).find(p => p.insemId === lastInsem.id);
      if(!hasCheck) {
        const days = dBetween(lastInsem.date, TODAY);
        if (days >= 19 && days <= 22) {
          alerts+='<div class="alert alert-warn"><i class="fas fa-fire"></i><span>'+esc(c.name)+': انتبه، فترة صرفان (شياع) محتملة! (مر '+days+' يوم على التلقيح)</span></div>';
        } else if (days >= 39 && days <= 42) {
          alerts+='<div class="alert alert-success" style="background:#ECFDF5;border-color:var(--pr2);color:var(--pr)"><i class="fas fa-stethoscope"></i><span>'+esc(c.name)+': حان موعد كشف الحمل! (مر '+days+' يوم على التلقيح)</span></div>';
        } else if (days > 42) {
          alerts+='<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i><span>'+esc(c.name)+': تأخر كشف الحمل! (مر '+days+' يوم على التلقيح)</span></div>';
        }
      }
    }
  });
  (S.healthLogs||[]).filter(h=>h.nextDate&&dBetween(TODAY,h.nextDate)>=0&&dBetween(TODAY,h.nextDate)<=3).forEach(h=>{
    const a=(S.cattle||[]).find(c=>c.id===h.cowId);
    alerts+='<div class="alert alert-info"><i class="fas fa-syringe"></i><span>موعد '+h.type+(a?' لـ '+esc(a.name):'')+' بعد '+dBetween(TODAY,h.nextDate)+' يوم</span></div>';
  });
  (S.inventoryItems||[]).forEach(it=>{
    if(it.minQty!=null && Number(it.qty||0) <= Number(it.minQty)){
      alerts+='<div class="alert alert-warn"><i class="fas fa-box"></i><span>المخزون منخفض: '+esc(it.name)+' — المتوفر '+fN(it.qty)+' '+esc(it.unit)+'</span></div>';
    }
  });
  if(totalDebt>0) alerts+='<div class="alert alert-warn"><i class="fas fa-file-invoice-dollar"></i><span>إجمالي الديون المستحقة: '+fMoney(totalDebt)+'</span></div>';

  wrap.innerHTML=
    seasonBanner+
    (alerts?'<div style="margin-bottom:20px">'+alerts+'</div>':'')+
    '<div class="kpi-grid">'+
      kpiCard('إجمالي الإيرادات',fMoney(fin.totalRev),'fa-arrow-trend-up','green')+
      kpiCard('إجمالي التكاليف',fMoney(fin.totalCost),'fa-arrow-trend-down','red')+
      kpiCard('صافي الربح',fMoney(fin.netProfit),'fa-chart-line',fin.netProfit>=0?'green':'red')+
      kpiCard('محاصيل نشطة',activeCrops+' محصول','fa-leaf','')+
      kpiCard('رؤوس الماشية',activeCattle+' رأس','fa-cow','blue')+
      kpiCard('ديون مستحقة',fMoney(totalDebt),'fa-file-invoice-dollar','orange')+
    '</div>'+
    '<div class="card" style="margin-bottom:16px"><div class="card-header"><div class="card-title"><i class="fas fa-handshake"></i> نصيب كل شريك في صافي ربح القطيع</div><button class="btn btn-sm btn-outline" onclick="goPage(\'reports\',null)">التقرير الكامل</button></div>'+
    '<div class="card-body"><div class="split-grid">'+
      (S.partners||[]).map(p=>{
        const cs=partnerCattleSummary(p.id);
        return '<div class="split-card" style="border-color:'+p.color+'"><div class="sc-name"><span class="share-dot" style="background:'+p.color+'"></span>'+esc(p.name)+'</div>'+
          '<div class="sc-val" style="color:'+(cs.net>=0?'var(--pr2)':'var(--red)')+'">'+fMoney(cs.net)+'</div>'+
          '<div class="sc-sub">من إيرادات '+fMoney(cs.revenue)+' وتكاليف '+fMoney(cs.cost)+'</div></div>';
      }).join('')+
    '</div></div></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'+
      '<div class="card"><div class="card-header"><div class="card-title">آخر سجلات الحليب</div><button class="btn btn-sm btn-outline" onclick="goPage(\'milk\',null)">عرض الكل</button></div>'+
      '<div class="card-body p0">'+recentMilkTable()+'</div></div>'+
      '<div class="card"><div class="card-header"><div class="card-title">أقرب مواعيد الولادة</div><button class="btn btn-sm btn-outline" onclick="goPage(\'repro\',null)">عرض الكل</button></div>'+
      '<div class="card-body">'+upcomingBirths()+'</div></div>'+
    '</div>';
}
function recentMilkTable(){
  const logs=[...(S.milkLogs||[])].sort((a,b)=>(b.date+(b.session||'')).localeCompare(a.date+(a.session||''))).slice(0,5);
  if(!logs.length) return '<div style="padding:20px;text-align:center;color:var(--txt4);font-size:13px">لا توجد سجلات بعد</div>';
  const sessLbl={full:'يوم كامل',am:'صباحي',pm:'مسائي'};
  return '<table class="tbl"><thead><tr><th>التاريخ</th><th>الفترة</th><th>الإجمالي</th></tr></thead><tbody>'+
    logs.map(l=>{const t=Object.values(l.qtys||{}).reduce((s,v)=>s+Number(v||0),0);return '<tr><td>'+l.date+'</td><td><span class="tag tag-gray">'+(sessLbl[l.session]||'يوم كامل')+'</span></td><td class="amt">'+fN(t)+' ك</td></tr>';}).join('')+
  '</tbody></table>';
}
function upcomingBirths(){
  const preg=(S.cattle||[]).filter(c=>c.pregnant&&c.dueDate).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
  if(!preg.length) return '<div style="text-align:center;color:var(--txt4);font-size:13px">لا توجد أبقار حوامل</div>';
  return preg.map(c=>{
    const left=dBetween(TODAY,c.dueDate);
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--brd2)">'+
      '<div><div style="font-size:13px;font-weight:700">'+esc(c.name)+'</div><div style="font-size:11px;color:var(--txt3)">'+c.dueDate+'</div></div>'+
      '<span class="tag '+(left<=7?'tag-red':left<=14?'tag-gold':'tag-green')+'">'+(left>=0?left+' يوم':'تأخر')+'</span>'+
    '</div>';
  }).join('');
}

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', async ()=>{
  document.getElementById('sidebar-date').textContent=new Date().toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  await loadDB();
  renderPage('dashboard');
  const ls=document.getElementById('loading');ls.classList.add('hide');setTimeout(()=>ls.style.display='none',400);
  document.querySelectorAll('input[type="date"]').forEach(el=>{if(!el.value)el.value=TODAY;});
  wireGlobalEvents();
});

function wireGlobalEvents(){
  // Nothing to wire globally — all events are inline onclick.
  // This hook is kept for future extensibility.
}
