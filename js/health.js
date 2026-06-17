// ═══════════════════════════════════════════════════════
//  حصاد — HEALTH MODULE
// ═══════════════════════════════════════════════════════
const HEALTH_TYPE_LABELS={vaccination:'تحصين',treatment:'علاج',checkup:'فحص دوري',deworming:'مكافحة طفيليات',hoof:'تقليم أظلاف',other:'أخرى'};

function renderHealthPage(wrap){
  document.getElementById('topbar-actions').innerHTML='<button class="btn btn-primary" onclick="openHealthModal()"><i class="fas fa-plus"></i> تسجيل إجراء صحي</button>';
  const logs=[...(S.healthLogs||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const totalCost=logs.filter(h=>h.hasCost).reduce((s,h)=>s+Number(h.cost||0),0);
  const upcoming=logs.filter(h=>h.nextDate&&h.nextDate>=TODAY).sort((a,b)=>a.nextDate.localeCompare(b.nextDate));

  wrap.innerHTML=
    '<div class="kpi-grid">'+
      kpiCard('إجمالي السجلات',logs.length,'fa-stethoscope','')+
      kpiCard('تكاليف الصحة والبيطرة',fMoney(totalCost),'fa-coins','red')+
      kpiCard('مواعيد قادمة',upcoming.length,'fa-calendar-check','blue')+
    '</div>'+
    (upcoming.length?'<div class="card" style="margin-bottom:16px"><div class="card-header"><div class="card-title">مواعيد قادمة</div></div><div class="card-body p0">'+
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الموعد</th><th>الحيوان</th><th>الإجراء</th><th>متبقي</th></tr></thead><tbody>'+
      upcoming.map(h=>{
        const c=(S.cattle||[]).find(x=>x.id===h.cowId);
        const left=dBetween(TODAY,h.nextDate);
        return '<tr><td>'+h.nextDate+'</td><td style="font-weight:700">'+(c?esc(c.name):'—')+'</td><td>'+(HEALTH_TYPE_LABELS[h.type]||h.type)+'</td><td><span class="tag '+(left<=3?'tag-red':left<=7?'tag-gold':'tag-green')+'">'+left+' يوم</span></td></tr>';
      }).join('')+'</tbody></table></div></div></div>':'')+
    '<div class="card"><div class="card-header"><div class="card-title">السجل الصحي الكامل</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>الحيوان</th><th>الإجراء</th><th>الوصف</th><th>التكلفة</th><th>البيطري</th><th>الموعد القادم</th><th></th></tr></thead><tbody>'+
    (logs.length?logs.map(h=>{
      const c=(S.cattle||[]).find(x=>x.id===h.cowId);
      return '<tr><td>'+h.date+'</td><td style="font-weight:700">'+(c?esc(c.name):'—')+'</td>'+
        '<td><span class="tag tag-blue">'+(HEALTH_TYPE_LABELS[h.type]||h.type)+'</span></td>'+
        '<td>'+esc(h.desc||'—')+'</td><td class="amt-red">'+(h.hasCost?fMoney(h.cost):'—')+'</td>'+
        '<td>'+esc(h.vet||'—')+'</td><td>'+(h.nextDate||'—')+'</td>'+
        '<td><button class="btn-icon danger" onclick="deleteHealthLog('+h.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></td></tr>';
    }).join(''):'<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--txt4)">لا توجد سجلات صحية</td></tr>')+
    '</tbody></table></div></div></div>';
}
function openHealthModal(){
  populateAnimalSels();
  document.getElementById('hl-date').value=TODAY;
  ['hl-desc','hl-cost','hl-vet','hl-nextdate','hl-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('hl-type').value='vaccination';
  document.getElementById('hl-hascost').checked=false;
  toggleHealthCost();
  openModal('m-health');
}
function toggleHealthCost(){document.getElementById('hl-cost-fg').style.display=document.getElementById('hl-hascost').checked?'block':'none';}
function saveHealthLog(){
  const cowId=Number(document.getElementById('hl-animal').value),date=document.getElementById('hl-date').value;
  if(!cowId||!date){toast('⚠ اختر الحيوان والتاريخ');return;}
  S.healthLogs=S.healthLogs||[];
  S.healthLogs.push({id:uid(),cowId,date,type:document.getElementById('hl-type').value,desc:document.getElementById('hl-desc').value.trim(),hasCost:document.getElementById('hl-hascost').checked,cost:parseFloat(document.getElementById('hl-cost').value)||0,vet:document.getElementById('hl-vet').value.trim(),nextDate:document.getElementById('hl-nextdate').value||null,notes:document.getElementById('hl-notes').value.trim()});
  schedSave();closeModal('m-health');renderPage(currentPage);toast('تم التسجيل');
}
function deleteHealthLog(id){
  confirmAction('حذف هذا السجل الصحي؟',()=>{S.healthLogs=(S.healthLogs||[]).filter(h=>h.id!==id);schedSave();renderPage(currentPage);toast('تم الحذف');});
}
