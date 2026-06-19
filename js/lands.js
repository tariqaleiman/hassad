// ═══════════════════════════════════════════════════════
//  حصاد — LANDS MODULE
// ═══════════════════════════════════════════════════════
function landTypeLabel(id){const t=LAND_TYPES.find(x=>x.id===id);return t?t.label:id;}
function landTypeIcon(id){const t=LAND_TYPES.find(x=>x.id===id);return t?t.icon:'fa-house';}

function renderLandsPage(wrap){
  document.getElementById('topbar-actions').innerHTML='<button class="btn btn-primary" onclick="openLandModal(null)"><i class="fas fa-plus"></i> إضافة أرض</button>';
  const lands=[...(S.lands||[])].sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  const totalFeddan=lands.reduce((s,l)=>s+convertArea(l.area,l.areaUnit,'feddan'),0);

  wrap.innerHTML=
    '<div class="kpi-grid">'+
      kpiCard('عدد الأراضي',lands.length,'fa-map','')+
      kpiCard('إجمالي المساحة',fN(totalFeddan)+' فدان','fa-ruler-combined','green')+
      kpiCard('أراضي مملوكة',lands.filter(l=>l.type==='owned').length,'fa-house','blue')+
      kpiCard('أراضي إيجار/مزارعة',lands.filter(l=>l.type!=='owned').length,'fa-handshake','orange')+
    '</div>'+
    (lands.length?
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">'+lands.map(l=>landCard(l)).join('')+'</div>'
      :emptyState('fa-map','لا توجد أراضٍ مسجلة','أضف أراضيك لتنظيم المحاصيل والمواسم عليها','openLandModal(null)'));
}
function landCard(l){
  const crops=(S.crops||[]).filter(c=>c.landId===l.id);
  const activeCrops=crops.filter(c=>c.status==='growing');
  return '<div class="card"><div class="card-body">'+
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">'+
      '<div style="display:flex;align-items:center;gap:10px">'+
        '<div style="width:42px;height:42px;border-radius:10px;background:var(--pr5);display:flex;align-items:center;justify-content:center;color:var(--pr2);font-size:18px"><i class="fas '+landTypeIcon(l.type)+'"></i></div>'+
        '<div><div style="font-size:15px;font-weight:800">'+esc(l.name)+'</div>'+
        '<div style="font-size:11px;color:var(--txt3);margin-top:2px">'+landTypeLabel(l.type)+' · '+fN(l.area)+' '+areaUnitLabel(l.areaUnit)+'</div>'+
        (l.location?'<div style="font-size:11px;color:var(--txt3);margin-top:2px"><i class="fas fa-location-dot"></i> '+esc(l.location)+'</div>':'')+
        '</div>'+
      '</div>'+
      '<div style="display:flex;gap:6px">'+
        '<button class="btn-icon" onclick="openLandModal('+l.id+')"><i class="fas fa-pen" style="font-size:11px"></i></button>'+
        '<button class="btn-icon danger" onclick="deleteLand('+l.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button>'+
      '</div>'+
    '</div>'+
    (crops.length?'<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--brd2);font-size:11px;color:var(--txt3)">'+activeCrops.length+' محصول نشط من إجمالي '+crops.length+' تسجيل زراعة</div>':'')+
    (l.notes?'<div style="margin-top:8px;font-size:11px;color:var(--txt3)">'+esc(l.notes)+'</div>':'')+
  '</div></div>';
}
function openLandModal(editId){
  const l=editId?(S.lands||[]).find(x=>x.id===editId):null;
  document.getElementById('ld-edit-id').value=editId||'';
  document.getElementById('m-land-title').textContent=l?'تعديل أرض: '+l.name:'إضافة أرض';
  document.getElementById('ld-name').value=l?l.name:'';
  document.getElementById('ld-type').value=l?l.type:'owned';
  document.getElementById('ld-area').value=l?(l.area||''):'';
  document.getElementById('ld-areaunit').innerHTML=AREA_UNITS.map(u=>'<option value="'+u.id+'">'+u.label+'</option>').join('');
  document.getElementById('ld-areaunit').value=l?(l.areaUnit||'feddan'):'feddan';
  document.getElementById('ld-location').value=l?(l.location||''):'';
  document.getElementById('ld-notes').value=l?(l.notes||''):'';
  openModal('m-land');
}
function saveLand(){
  const name=document.getElementById('ld-name').value.trim();
  const area=parseFloat(document.getElementById('ld-area').value)||0;
  if(!name||area<=0){toast('⚠ أدخل اسم الأرض والمساحة');return;}
  const editId=document.getElementById('ld-edit-id').value;
  const data={name,type:document.getElementById('ld-type').value,area,
    areaUnit:document.getElementById('ld-areaunit').value,
    location:document.getElementById('ld-location').value.trim(),
    notes:document.getElementById('ld-notes').value.trim()};
  if(editId){ Object.assign((S.lands||[]).find(x=>x.id===Number(editId)),data); }
  else { S.lands=S.lands||[]; S.lands.push(Object.assign({id:uid(),createdAt:TODAY},data)); }
  schedSave();closeModal('m-land');renderPage(currentPage);toast('تم الحفظ');
}
function deleteLand(id){
  const used=(S.crops||[]).some(c=>c.landId===id);
  confirmAction(used?'هذه الأرض مستخدمة في تسجيلات محاصيل — حذفها سيُبقي على المحاصيل لكن بدون ربط بأرض. هل تريد الاستمرار؟':'حذف هذه الأرض؟',()=>{
    (S.crops||[]).forEach(c=>{ if(c.landId===id) c.landId=null; });
    S.lands=(S.lands||[]).filter(l=>l.id!==id);
    schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}
function populateLandSel(selId){
  const el=document.getElementById(selId);
  if(el) el.innerHTML='<option value="">— بدون تحديد —</option>'+(S.lands||[]).map(l=>'<option value="'+l.id+'">'+esc(l.name)+'</option>').join('');
}
