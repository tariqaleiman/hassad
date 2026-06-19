// ═══════════════════════════════════════════════════════
//  حصاد — SEASONS MODULE
// ═══════════════════════════════════════════════════════
function seasonTypeLabel(id){const t=SEASON_TYPES.find(x=>x.id===id);return t?t.label:id;}
function seasonTypeIcon(id){const t=SEASON_TYPES.find(x=>x.id===id);return t?t.icon:'fa-calendar';}
function activeSeason(){return (S.seasons||[]).find(s=>s.id===S.activeSeasonId) || (S.seasons||[])[0] || null;}
function setActiveSeason(id){ S.activeSeasonId=Number(id); schedSave(); }

function seasonFinancials(seasonId){
  const cropIds=(S.crops||[]).filter(c=>c.seasonId===seasonId).map(c=>c.id);
  const opIds=(S.ops||[]).filter(o=>cropIds.includes(o.cropId)).map(o=>o.id);
  const expenseTotal=(S.expenses||[]).filter(e=>
    (e.linkType==='crop'&&cropIds.includes(e.linkId)) ||
    (e.linkType==='cropop'&&opIds.includes(e.linkId))
  ).reduce((s,e)=>s+Number(e.amount||0),0);
  const opDirectCost=(S.ops||[]).filter(o=>cropIds.includes(o.cropId)&&o.hasCost&&!o._migratedToExpense).reduce((s,o)=>s+Number(o.cost||0),0);
  const harvestRev=(S.harvests||[]).filter(h=>cropIds.includes(h.cropId)&&h.destination==='sold').reduce((s,h)=>s+Number(h.soldRevenue||0),0);
  const cuttingRev=(S.cuttings||[]).filter(c=>cropIds.includes(c.cropId)&&c.destination==='sold').reduce((s,c)=>s+Number(c.soldTotal||0),0);
  const cost=expenseTotal+opDirectCost;
  const revenue=harvestRev+cuttingRev;
  return {cost,revenue,net:revenue-cost,cropCount:cropIds.length};
}

function renderSeasonsPage(wrap){
  document.getElementById('topbar-actions').innerHTML='<button class="btn btn-primary" onclick="openSeasonModal(null)"><i class="fas fa-plus"></i> موسم جديد</button>';
  const seasons=[...(S.seasons||[])].sort((a,b)=>(b.startDate||'').localeCompare(a.startDate||''));
  const cur=activeSeason();

  wrap.innerHTML=
    '<div class="alert alert-info"><i class="fas fa-circle-info"></i><span>الموسم النشط حالياً هو الإطار الزمني الذي تُحسب على أساسه المصاريف والإيرادات الافتراضية للمحاصيل الجديدة. يمكنك التبديل بين المواسم بضغطة واحدة.</span></div>'+
    '<div style="display:flex;flex-direction:column;gap:14px">'+
      seasons.map(s=>seasonCard(s,cur)).join('')+
    '</div>'+
    (seasons.length>1?'<div class="card" style="margin-top:20px"><div class="card-header"><div class="card-title"><i class="fas fa-chart-column"></i> مقارنة المواسم</div></div><div class="card-body p0">'+
      seasonsComparisonTable(seasons)+
    '</div></div>':'');
}
function seasonCard(s,cur){
  const fin=seasonFinancials(s.id);
  const isActive=cur&&cur.id===s.id;
  return '<div class="card" style="'+(isActive?'border-color:var(--pr2);box-shadow:0 0 0 1px var(--pr2)':'')+'"><div class="card-body">'+
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap">'+
      '<div style="display:flex;align-items:center;gap:10px">'+
        '<div style="width:42px;height:42px;border-radius:10px;background:var(--pr5);display:flex;align-items:center;justify-content:center;color:var(--pr2);font-size:18px"><i class="fas '+seasonTypeIcon(s.type)+'"></i></div>'+
        '<div><div style="font-size:15px;font-weight:800">'+esc(s.name)+(isActive?' <span class="tag tag-green">نشط</span>':'')+'</div>'+
        '<div style="font-size:11px;color:var(--txt3);margin-top:2px">'+seasonTypeLabel(s.type)+' '+s.year+' · '+(s.startDate||'—')+(s.endDate?' → '+s.endDate:'')+'</div></div>'+
      '</div>'+
      '<div style="display:flex;gap:6px">'+
        (!isActive?'<button class="btn btn-sm btn-outline" onclick="setActiveSeason('+s.id+');renderPage(currentPage)"><i class="fas fa-check"></i> تفعيل</button>':'')+
        '<button class="btn-icon" onclick="openSeasonModal('+s.id+')"><i class="fas fa-pen" style="font-size:11px"></i></button>'+
        '<button class="btn-icon danger" onclick="deleteSeason('+s.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button>'+
      '</div>'+
    '</div>'+
    '<div class="split-grid" style="margin-top:14px">'+
      '<div class="split-card"><div class="sc-name">المحاصيل</div><div class="sc-val">'+fin.cropCount+'</div></div>'+
      '<div class="split-card" style="border-color:var(--red)"><div class="sc-name">التكاليف</div><div class="sc-val" style="color:var(--red)">'+fMoney(fin.cost)+'</div></div>'+
      '<div class="split-card" style="border-color:var(--pr2)"><div class="sc-name">الإيرادات</div><div class="sc-val" style="color:var(--pr2)">'+fMoney(fin.revenue)+'</div></div>'+
      '<div class="split-card"><div class="sc-name">صافي الربح</div><div class="sc-val" style="color:'+(fin.net>=0?'var(--pr2)':'var(--red)')+'">'+(fin.net>=0?'+':'')+fMoney(fin.net)+'</div></div>'+
    '</div>'+
  '</div></div>';
}
function seasonsComparisonTable(seasons){
  return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الموسم</th><th>النوع</th><th>المحاصيل</th><th>التكاليف</th><th>الإيرادات</th><th>صافي الربح</th></tr></thead><tbody>'+
    seasons.map(s=>{
      const fin=seasonFinancials(s.id);
      return '<tr><td style="font-weight:700">'+esc(s.name)+'</td><td><span class="tag tag-blue">'+seasonTypeLabel(s.type)+' '+s.year+'</span></td>'+
        '<td>'+fin.cropCount+'</td><td class="amt-red">'+fMoney(fin.cost)+'</td><td class="amt-green">'+fMoney(fin.revenue)+'</td>'+
        '<td class="'+(fin.net>=0?'amt-green':'amt-red')+'">'+(fin.net>=0?'+':'')+fMoney(fin.net)+'</td></tr>';
    }).join('')+
  '</tbody></table></div>';
}
function openSeasonModal(editId){
  const s=editId?(S.seasons||[]).find(x=>x.id===editId):null;
  document.getElementById('sn-edit-id').value=editId||'';
  document.getElementById('m-season-title').textContent=s?'تعديل موسم: '+s.name:'موسم جديد';
  document.getElementById('sn-name').value=s?s.name:'';
  document.getElementById('sn-type').value=s?s.type:'summer';
  document.getElementById('sn-year').value=s?s.year:new Date(TODAY).getFullYear();
  document.getElementById('sn-start').value=s?(s.startDate||TODAY):TODAY;
  document.getElementById('sn-end').value=s?(s.endDate||''):'';
  openModal('m-season');
}
function saveSeason(){
  const name=document.getElementById('sn-name').value.trim();
  if(!name){toast('⚠ أدخل اسم الموسم');return;}
  const editId=document.getElementById('sn-edit-id').value;
  const data={name,type:document.getElementById('sn-type').value,year:parseInt(document.getElementById('sn-year').value)||new Date(TODAY).getFullYear(),
    startDate:document.getElementById('sn-start').value,endDate:document.getElementById('sn-end').value||null};
  if(editId){ Object.assign((S.seasons||[]).find(x=>x.id===Number(editId)),data); }
  else {
    S.seasons=S.seasons||[];
    const sn=Object.assign({id:uid(),createdAt:TODAY},data);
    S.seasons.push(sn);
    S.activeSeasonId=sn.id; // newly created season becomes active automatically
  }
  schedSave();closeModal('m-season');renderPage(currentPage);toast('تم الحفظ');
}
function deleteSeason(id){
  if((S.seasons||[]).length<=1){toast('⚠ لا يمكن حذف الموسم الوحيد');return;}
  const cropCount=(S.crops||[]).filter(c=>c.seasonId===id).length;
  confirmAction(cropCount>0?('هذا الموسم يحتوي على '+cropCount+' محصول مسجل. حذف الموسم سيبقي المحاصيل لكنها ستحتاج لإعادة ربطها بموسم آخر يدوياً. هل تريد الاستمرار؟'):'حذف هذا الموسم؟',()=>{
    (S.crops||[]).forEach(c=>{ if(c.seasonId===id) c.seasonId=null; });
    S.seasons=(S.seasons||[]).filter(s=>s.id!==id);
    if(S.activeSeasonId===id) S.activeSeasonId=S.seasons[0]?S.seasons[0].id:null;
    schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}
function populateSeasonSel(selId){
  const el=document.getElementById(selId);
  if(el) el.innerHTML=(S.seasons||[]).map(s=>'<option value="'+s.id+'">'+esc(s.name)+' ('+seasonTypeLabel(s.type)+' '+s.year+')</option>').join('');
}
