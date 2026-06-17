// ═══════════════════════════════════════════════════════
//  حصاد — CROPS, OPERATIONS & CUTTINGS MODULE
// ═══════════════════════════════════════════════════════
// CROP_TYPES is now dynamic — see S.cropTypes in core.js (DEFAULT_CROP_TYPES) and populateCropTypeDatalist()
const CROP_STATUS_LABELS={growing:'تحت الزراعة',harvested:'تم الحصاد',done:'منتهي'};

// ---------- Sequential growth stages (بذرة/شتلة → نمو → حصاد) ----------
const CROP_STAGES=[
  {value:'seed',     label:'بذر / زراعة بذور',icon:'fa-seedling'},
  {value:'seedling', label:'شتلات / إنبات',    icon:'fa-leaf'},
  {value:'growth',   label:'نمو وتربية',       icon:'fa-spa'},
  {value:'flowering',label:'تزهير / عقد',      icon:'fa-fan'},
  {value:'maturity', label:'نضج',              icon:'fa-wheat-awn'},
  {value:'harvest',  label:'حصاد',             icon:'fa-tractor'},
];
function stageLabel(v){const s=CROP_STAGES.find(x=>x.value===v);return s?s.label:v;}
function stageIcon(v){const s=CROP_STAGES.find(x=>x.value===v);return s?s.icon:'fa-circle';}
function currentStage(crop){
  const log=crop.stageLog||[];
  return log.length?log[log.length-1].stage:null;
}
function addCropStage(cropId,stage,date,notes){
  const crop=(S.crops||[]).find(c=>c.id===cropId);if(!crop)return;
  crop.stageLog=crop.stageLog||[];
  crop.stageLog.push({stage,date,notes:notes||''});
  // keep status in sync for backward-compat displays
  if(stage==='harvest') crop.status='harvested';
  else if(crop.status!=='harvested'&&crop.status!=='done') crop.status='growing';
}

const OP_TYPES=[
  {value:'plow',  label:'حرث',                 units:['ساعة','يومية']},
  {value:'prep',  label:'تسوية / تجهيز أرض',   units:['ساعة','يومية']},
  {value:'sow',   label:'زراعة / بذر',          units:['ساعة','قيراط','يومية']},
  {value:'transplant',label:'نقل شتلات',        units:['ساعة','قيراط','يومية']},
  {value:'weed',  label:'عزيق / إزالة حشائش',   units:['ساعة','قيراط','يومية']},
  {value:'harvest',label:'حصاد',                units:['ساعة','قيراط','يومية']},
  {value:'fertilize',label:'تسميد',             units:['شيكارة','كيلو','وحدة','يومية']},
  {value:'spray', label:'رش مبيدات / مغذيات',   units:['عبوة','لتر','مرة رش','يومية']},
  {value:'irrigate',label:'ري',                 units:['ساعة','يومية']},
  {value:'labor', label:'عمالة عامة / مياومة',  units:['يومية','ساعة']},
  {value:'other', label:'عملية أخرى',           units:['وحدة','ساعة','يوم','يومية']},
];
function opTypeLabel(v){const t=OP_TYPES.find(x=>x.value===v);return t?t.label:v;}

let cropsTab='crops';
function setCropsTab(t,btn){
  cropsTab=t;
  document.querySelectorAll('#crops-tabs button').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  renderPage('crops');
}

// ═══════════════════════════════════════════════════════
//  CROPS PAGE (tabs: المحاصيل | الحشات والمراعي)
// ═══════════════════════════════════════════════════════
function renderCropsPage(wrap){
  document.getElementById('topbar-actions').innerHTML=
    (cropsTab==='crops'?'<button class="btn btn-primary" onclick="openCropModal(null)"><i class="fas fa-plus"></i> إضافة محصول</button>'
     :cropsTab==='cuttings'?'<button class="btn btn-primary" onclick="openCuttingModal(null)"><i class="fas fa-plus"></i> تسجيل حشة</button>'
     :'<button class="btn btn-primary" onclick="openExpenseModal(null)"><i class="fas fa-plus"></i> تسجيل مصروف</button>');
  const crops=S.crops||[];
  const growing=crops.filter(c=>c.status==='growing');
  const totalArea=crops.reduce((s,c)=>s+Number(c.area||0),0);
  const opsCost=(S.ops||[]).filter(o=>o.hasCost).reduce((s,o)=>s+Number(o.cost||0),0);

  wrap.innerHTML=
    '<div class="seg" id="crops-tabs" style="max-width:480px;margin-bottom:16px">'+
      '<button class="'+(cropsTab==='crops'?'on':'')+'" onclick="setCropsTab(\'crops\',this)">المحاصيل</button>'+
      '<button class="'+(cropsTab==='cuttings'?'on':'')+'" onclick="setCropsTab(\'cuttings\',this)">الحشات والمراعي</button>'+
      '<button class="'+(cropsTab==='expenses'?'on':'')+'" onclick="setCropsTab(\'expenses\',this)">المصروفات</button>'+
    '</div>'+
    (cropsTab==='crops'?renderCropsTab(crops,growing,totalArea,opsCost):cropsTab==='cuttings'?renderCuttingsTab():renderExpensesTab());
}
function renderCropsTab(crops,growing,totalArea,opsCost){
  return '<div class="kpi-grid">'+
      kpiCard('محاصيل تحت الزراعة',growing.length,'fa-seedling','green')+
      kpiCard('إجمالي المساحة',fN(totalArea)+' قيراط','fa-ruler-combined','')+
      kpiCard('تكلفة العمليات الزراعية',fMoney(opsCost),'fa-coins','red')+
      kpiCard('إجمالي المحاصيل المسجلة',crops.length,'fa-leaf','blue')+
    '</div>'+
    '<div class="card"><div class="card-header"><div class="card-title">المحاصيل المسجلة</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>المحصول</th><th>النوع</th><th>المساحة</th><th>المرحلة الحالية</th><th>تاريخ الزراعة</th><th>الحالة</th><th>تكلفة العمليات</th><th>علف/مرعى</th><th></th></tr></thead><tbody>'+
    (crops.length?crops.map(c=>{
      const cost=(S.ops||[]).filter(o=>o.cropId===c.id&&o.hasCost).reduce((s,o)=>s+Number(o.cost||0),0)+totalExpensesForCrop(c.id);
      const stage=currentStage(c);
      return '<tr><td style="font-weight:700">'+esc(c.name)+'</td><td><span class="tag tag-blue">'+esc(c.type)+'</span></td>'+
        '<td>'+fN(c.area)+' '+esc(c.areaUnit||'قيراط')+'</td>'+
        '<td>'+(stage?'<span class="tag tag-gold"><i class="fas '+stageIcon(stage)+'"></i> '+stageLabel(stage)+'</span>':'<span style="color:var(--txt4)">لم تبدأ</span>')+'</td>'+
        '<td>'+(c.pdate||'—')+'</td>'+
        '<td><span class="tag '+(c.status==='growing'?'tag-green':'tag-gray')+'">'+(CROP_STATUS_LABELS[c.status]||c.status)+'</span></td>'+
        '<td class="amt-red">'+fMoney(cost)+'</td><td>'+(c.isForage?'<span class="tag tag-gold">نعم</span>':'—')+'</td>'+
        '<td><div style="display:flex;gap:4px"><button class="btn btn-sm btn-outline" onclick="openCropStagesModal('+c.id+')"><i class="fas fa-route"></i> المراحل</button><button class="btn-icon" onclick="openCropModal('+c.id+')"><i class="fas fa-pen" style="font-size:11px"></i></button><button class="btn-icon danger" onclick="deleteCrop('+c.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></div></td></tr>';
    }).join(''):'<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--txt4)">لا توجد محاصيل مسجلة</td></tr>')+
    '</tbody></table></div></div></div>';
}
function renderCuttingsTab(){
  const cuttings=[...(S.cuttings||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const forageCrops=(S.crops||[]).filter(c=>c.isForage);
  const totalQty=cuttings.reduce((s,c)=>s+Number(c.qty||0),0);
  const totalRent=cuttings.filter(c=>c.destination==='rent').reduce((s,c)=>s+Number(c.rentQirat||0)*Number(c.rentPricePerQirat||0),0);
  const totalSold=cuttings.filter(c=>c.destination==='sold').reduce((s,c)=>s+Number(c.soldTotal||0),0);
  const destLabels={feed:'تحويل لعلف (مخزون)',rent:'إيجار قيراط (تكلفة على الأبقار)',sold:'بيع'};
  return '<div class="kpi-grid">'+
      kpiCard('عدد الحشات المسجلة',cuttings.length,'fa-wheat-awn','green')+
      kpiCard('إجمالي الكمية',fN(totalQty),'fa-weight-hanging','')+
      kpiCard('إيجار قيراط محمّل على الأبقار',fMoney(totalRent),'fa-cow','orange')+
      kpiCard('إيرادات البيع',fMoney(totalSold),'fa-coins','blue')+
    '</div>'+
    (forageCrops.length?'':'<div class="alert alert-info"><i class="fas fa-circle-info"></i><span>لتسجيل حشة، أضف محصولاً من تبويب "المحاصيل" وفعّل خيار "علف/مرعى (يُحش بشكل متكرر)".</span></div>')+
    '<div class="card"><div class="card-header"><div class="card-title">سجل الحشات</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>المحصول</th><th>رقم الحشة</th><th>الكمية</th><th>المصير</th><th>التفاصيل</th><th></th></tr></thead><tbody>'+
    (cuttings.length?cuttings.map(ct=>{
      const crop=(S.crops||[]).find(c=>c.id===ct.cropId);
      let details='—';
      if(ct.destination==='feed') details='أُضيف '+fN(ct.qty)+' '+esc(ct.unit)+' للمخزون'+(ct.feedItemId?(' — '+esc(invItemName(ct.feedItemId))):'');
      else if(ct.destination==='rent') details=fN(ct.rentQirat)+' قيراط × '+fMoney(ct.rentPricePerQirat)+' = '+fMoney(Number(ct.rentQirat||0)*Number(ct.rentPricePerQirat||0));
      else if(ct.destination==='sold') details='إيراد: '+fMoney(ct.soldTotal);
      return '<tr><td>'+ct.date+'</td><td style="font-weight:700">'+(crop?esc(crop.name):'—')+'</td><td>حشة '+(ct.cutNo||'—')+'</td>'+
        '<td>'+fN(ct.qty)+' '+esc(ct.unit)+'</td><td><span class="tag '+(ct.destination==='rent'?'tag-orange':ct.destination==='sold'?'tag-green':'tag-blue')+'">'+(destLabels[ct.destination]||ct.destination)+'</span></td>'+
        '<td>'+details+'</td>'+
        '<td><button class="btn-icon danger" onclick="deleteCutting('+ct.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></td></tr>';
    }).join(''):'<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--txt4)">لا توجد حشات مسجلة</td></tr>')+
    '</tbody></table></div></div></div>';
}
function invItemName(id){const it=(S.inventoryItems||[]).find(x=>x.id===Number(id));return it?it.name:'—';}

// ═══════════════════════════════════════════════════════
//  CROP MODAL
// ═══════════════════════════════════════════════════════
function openCropModal(editId){
  const c=editId?(S.crops||[]).find(x=>x.id===editId):null;
  document.getElementById('cr-edit-id').value=editId||'';
  document.getElementById('m-crop-title').textContent=c?'تعديل محصول: '+c.name:'إضافة محصول';
  document.getElementById('cr-name').value=c?c.name:'';
  populateCropTypeDatalist();
  document.getElementById('cr-type').value=c?c.type:(S.cropTypes&&S.cropTypes[0])||'';
  document.getElementById('cr-area').value=c?(c.area||''):'';
  document.getElementById('cr-areaunit').value=c?(c.areaUnit||'قيراط'):'قيراط';
  document.getElementById('cr-pdate').value=c?(c.pdate||TODAY):TODAY;
  document.getElementById('cr-hdate').value=c?(c.hdate||''):'';
  document.getElementById('cr-loc').value=c?(c.loc||''):'';
  document.getElementById('cr-status').value=c?c.status:'growing';
  document.getElementById('cr-isforage').checked=c?!!c.isForage:false;
  document.getElementById('cr-notes').value=c?(c.notes||''):'';
  openModal('m-crop');
}
function populateCropTypeDatalist(){
  const dl=document.getElementById('cr-type-list');
  if(dl) dl.innerHTML=(S.cropTypes||DEFAULT_CROP_TYPES).map(t=>'<option value="'+esc(t)+'">').join('');
}
function saveCrop(){
  const name=document.getElementById('cr-name').value.trim();
  if(!name){toast('⚠ أدخل اسم المحصول');return;}
  const type=document.getElementById('cr-type').value.trim()||'أخرى';
  // if the user typed a brand-new crop type, remember it for next time
  S.cropTypes=S.cropTypes||JSON.parse(JSON.stringify(DEFAULT_CROP_TYPES));
  if(!S.cropTypes.includes(type)) S.cropTypes.push(type);
  const editId=document.getElementById('cr-edit-id').value;
  const data={name,type,area:parseFloat(document.getElementById('cr-area').value)||0,
    areaUnit:document.getElementById('cr-areaunit').value,pdate:document.getElementById('cr-pdate').value,
    hdate:document.getElementById('cr-hdate').value,loc:document.getElementById('cr-loc').value.trim(),
    status:document.getElementById('cr-status').value,isForage:document.getElementById('cr-isforage').checked,
    notes:document.getElementById('cr-notes').value.trim()};
  if(editId){ Object.assign((S.crops||[]).find(x=>x.id===Number(editId)),data); }
  else { S.crops=S.crops||[]; S.crops.push(Object.assign({id:uid(),stageLog:[]},data)); }
  schedSave();closeModal('m-crop');renderPage(currentPage);toast('تم الحفظ');
}
function deleteCrop(id){
  confirmAction('حذف هذا المحصول وكل العمليات والحشات والحصاد المرتبطة به؟',()=>{
    S.crops=(S.crops||[]).filter(c=>c.id!==id);
    S.ops=(S.ops||[]).filter(o=>o.cropId!==id);
    S.cuttings=(S.cuttings||[]).filter(c=>c.cropId!==id);
    S.harvests=(S.harvests||[]).filter(h=>h.cropId!==id);
    schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}
function populateCropSel(selId,forageOnly){
  const crops=(S.crops||[]).filter(c=>!forageOnly||c.isForage);
  const el=document.getElementById(selId);
  if(el)el.innerHTML=crops.map(c=>'<option value="'+c.id+'">'+esc(c.name)+' ('+c.type+')</option>').join('');
}

// ═══════════════════════════════════════════════════════
//  CROP GROWTH STAGES MODAL (بذرة/شتلة → نمو → حصاد)
// ═══════════════════════════════════════════════════════
function openCropStagesModal(cropId){
  const crop=(S.crops||[]).find(c=>c.id===cropId);if(!crop)return;
  document.getElementById('cs-crop-id').value=cropId;
  document.getElementById('m-cropstages-title').textContent='مراحل زراعة: '+crop.name;
  const log=crop.stageLog||[];
  const cur=currentStage(crop);
  // build "add stage" select: only show stages not yet reached, in order, plus allow re-adding any for correction
  document.getElementById('cs-stage').innerHTML=CROP_STAGES.map(s=>'<option value="'+s.value+'"'+(s.value===cur?'':'')+'><i></i>'+s.label+'</option>').join('');
  document.getElementById('cs-date').value=TODAY;
  document.getElementById('cs-notes').value='';
  renderCropStageTimeline(log);
  openModal('m-cropstages');
}
function renderCropStageTimeline(log){
  const el=document.getElementById('cs-timeline');
  if(!log.length){el.innerHTML='<div style="text-align:center;color:var(--txt4);padding:16px;font-size:13px">لم تُسجل أي مرحلة بعد لهذا المحصول</div>';return;}
  el.innerHTML='<div class="tl">'+[...log].reverse().map((s,i)=>{
    const orig=log.length-1-i;
    return '<div class="tli ev-status"><div class="tl-date">'+s.date+'</div>'+
      '<div class="tl-title"><i class="fas '+stageIcon(s.stage)+'"></i> '+stageLabel(s.stage)+'</div>'+
      (s.notes?'<div class="tl-meta">'+esc(s.notes)+'</div>':'')+
      '<button class="link-btn" style="font-size:11px;margin-top:2px" onclick="deleteCropStage('+orig+')"><i class="fas fa-trash"></i> حذف</button>'+
    '</div>';
  }).join('')+'</div>';
}
function saveCropStage(){
  const cropId=Number(document.getElementById('cs-crop-id').value);
  const crop=(S.crops||[]).find(c=>c.id===cropId);if(!crop)return;
  const date=document.getElementById('cs-date').value;
  if(!date){toast('⚠ أدخل التاريخ');return;}
  addCropStage(cropId,document.getElementById('cs-stage').value,date,document.getElementById('cs-notes').value.trim());
  schedSave();
  document.getElementById('cs-notes').value='';
  renderCropStageTimeline(crop.stageLog);
  renderPage(currentPage);
  toast('تم تسجيل المرحلة');
}
function deleteCropStage(index){
  const cropId=Number(document.getElementById('cs-crop-id').value);
  const crop=(S.crops||[]).find(c=>c.id===cropId);if(!crop)return;
  confirmAction('حذف هذه المرحلة من السجل؟',()=>{
    crop.stageLog.splice(index,1);
    schedSave();renderCropStageTimeline(crop.stageLog);renderPage(currentPage);toast('تم الحذف');
  });
}

// ═══════════════════════════════════════════════════════
//  CROP OPERATIONS PAGE
// ═══════════════════════════════════════════════════════
function renderCropOpsPage(wrap){
  document.getElementById('topbar-actions').innerHTML='<button class="btn btn-primary" onclick="openCropOpModal(null)"><i class="fas fa-plus"></i> تسجيل عملية</button>';
  const ops=[...(S.ops||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const totalCost=ops.reduce((s,o)=>s+opTotalCost(o.id),0);
  if(!(S.crops||[]).length){
    wrap.innerHTML=emptyState('fa-tractor','أضف محصولاً أولاً','يجب إضافة محصول من صفحة "المحاصيل" قبل تسجيل العمليات الزراعية عليه','goPage(\'crops\',null)');
    return;
  }
  wrap.innerHTML=
    '<div class="alert alert-info"><i class="fas fa-circle-info"></i><span>المصروفات (مواد، بنزين، أجور، صيانة...) تُسجَّل بشكل مستقل من تبويب "المصروفات" في صفحة المحاصيل، ثم تُربط بالعملية المناسبة — هكذا يمكن لعملية واحدة أن تحمل أكثر من بند تكلفة، وبتواريخ مختلفة عن تاريخ تنفيذ العملية نفسها.</span></div>'+
    '<div class="kpi-grid">'+
      kpiCard('عدد العمليات',ops.length,'fa-tractor','')+
      kpiCard('إجمالي التكاليف المرتبطة',fMoney(totalCost),'fa-coins','red')+
      kpiCard('عمليات هذا الشهر',ops.filter(o=>o.date.slice(0,7)===TODAY.slice(0,7)).length,'fa-calendar','blue')+
    '</div>'+
    '<div class="card"><div class="card-header"><div class="card-title">سجل العمليات الزراعية</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>المحصول</th><th>العملية</th><th>الكمية/الوحدة</th><th>العامل</th><th>التكلفة المرتبطة</th><th></th></tr></thead><tbody>'+
    (ops.length?ops.map(o=>{
      const crop=(S.crops||[]).find(c=>c.id===o.cropId);
      const cost=opTotalCost(o.id);
      const expCount=opExpenseCount(o.id);
      return '<tr><td>'+o.date+'</td><td style="font-weight:700">'+(crop?esc(crop.name):'—')+'</td>'+
        '<td><span class="tag tag-blue">'+opTypeLabel(o.type)+'</span></td>'+
        '<td>'+(o.qty?fN(o.qty)+' '+esc(o.opUnit||''):'—')+'</td>'+
        '<td>'+(o.worker?esc(o.worker):'—')+'</td>'+
        '<td class="amt-red">'+(cost>0?fMoney(cost)+(expCount>1?' <span class="tag tag-gray">'+expCount+' بنود</span>':''):'—')+'</td>'+
        '<td><div style="display:flex;gap:4px"><button class="btn btn-sm btn-outline" onclick="openExpenseModal(null,{linkType:\'cropop\',linkId:'+o.id+',category:\''+opExpenseCategory(o.type)+'\'})"><i class="fas fa-plus"></i> مصروف</button><button class="btn-icon" onclick="openCropOpModal('+o.id+')"><i class="fas fa-pen" style="font-size:11px"></i></button><button class="btn-icon danger" onclick="deleteCropOp('+o.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></div></td></tr>';
    }).join(''):'<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--txt4)">لا توجد عمليات مسجلة</td></tr>')+
    '</tbody></table></div></div></div>';
}
function opTotalCost(opId){
  return (S.expenses||[]).filter(e=>e.linkType==='cropop'&&e.linkId===opId).reduce((s,e)=>s+Number(e.amount||0),0)
    + (function(){ const o=(S.ops||[]).find(x=>x.id===opId); return (o&&o.hasCost&&!o._migratedToExpense)?Number(o.cost||0):0; })();
}
function opExpenseCount(opId){
  return (S.expenses||[]).filter(e=>e.linkType==='cropop'&&e.linkId===opId).length;
}
function openCropOpModal(editId){
  populateCropSel('co-crop',false);
  document.getElementById('co-edit-id').value=editId||'';
  const o=editId?(S.ops||[]).find(x=>x.id===editId):null;
  document.getElementById('co-date').value=o?o.date:TODAY;
  document.getElementById('co-desc').value=o?(o.desc||''):'';
  document.getElementById('co-qty').value=o?(o.qty||''):'';
  document.getElementById('co-worker').value=o?(o.worker||''):'';
  document.getElementById('co-notes').value=o?(o.notes||''):'';
  document.getElementById('co-type').innerHTML=OP_TYPES.map(t=>'<option value="'+t.value+'">'+t.label+'</option>').join('');
  document.getElementById('co-type').value=o?o.type:'plow';
  updateOpUnits();
  if(o&&o.opUnit) document.getElementById('co-unit').value=o.opUnit;
  toggleWorkerField();
  openModal('m-cropop');
}
function updateOpUnits(){
  const t=OP_TYPES.find(x=>x.value===document.getElementById('co-type').value)||OP_TYPES[0];
  document.getElementById('co-unit').innerHTML=t.units.map(u=>'<option value="'+u+'">'+u+'</option>').join('');
  toggleWorkerField();
}
function toggleWorkerField(){
  const unit=document.getElementById('co-unit').value;
  const wf=document.getElementById('co-worker-fg');
  if(wf) wf.style.display=(unit==='يومية')?'block':'none';
}
function saveCropOp(){
  const cropId=Number(document.getElementById('co-crop').value),date=document.getElementById('co-date').value;
  if(!cropId||!date){toast('⚠ اختر المحصول والتاريخ');return;}
  const editId=document.getElementById('co-edit-id').value;
  const data={cropId,date,type:document.getElementById('co-type').value,desc:document.getElementById('co-desc').value.trim(),
    qty:parseFloat(document.getElementById('co-qty').value)||null,opUnit:document.getElementById('co-unit').value,
    worker:document.getElementById('co-worker').value.trim(),notes:document.getElementById('co-notes').value.trim()};
  if(editId){
    Object.assign((S.ops||[]).find(x=>x.id===Number(editId)),data);
    schedSave();closeModal('m-cropop');renderPage(currentPage);toast('تم حفظ التعديلات');
    return;
  }
  S.ops=S.ops||[];
  const op=Object.assign({id:uid(),hasCost:false,cost:0},data);
  S.ops.push(op);
  schedSave();closeModal('m-cropop');renderPage(currentPage);
  // Prompt immediately to add a cost line for this operation (common case), without forcing it
  confirmAction('تم تسجيل العملية. هل تريد إضافة مصروف مرتبط بها الآن (مواد، أجور، وقود...)؟',()=>{
    openExpenseModal(null,{linkType:'cropop',linkId:op.id,category:opExpenseCategory(op.type)});
  });
}
function deleteCropOp(id){
  const linkedCount=opExpenseCount(id);
  const msg=linkedCount>0
    ? 'حذف هذه العملية؟ يوجد '+linkedCount+' مصروف مرتبط بها — سيتم حذفها أيضاً.'
    : 'حذف هذه العملية؟';
  confirmAction(msg,()=>{
    S.ops=(S.ops||[]).filter(o=>o.id!==id);
    S.expenses=(S.expenses||[]).filter(e=>!(e.linkType==='cropop'&&e.linkId===id));
    schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}

// ═══════════════════════════════════════════════════════
//  CUTTINGS (الحشات) MODAL
// ═══════════════════════════════════════════════════════
function openCuttingModal(editId){
  populateCropSel('ct-crop',true);
  populateFeedItemSel('ct-feeditem');
  document.getElementById('ct-date').value=TODAY;
  ['ct-cutno','ct-qty','ct-rentqirat','ct-rentprice','ct-soldtotal','ct-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('ct-unit').value='حمولة';
  document.getElementById('ct-destination').value='feed';
  updateCutNoSuggestion();
  toggleCuttingDestination();
  openModal('m-cutting');
}
function updateCutNoSuggestion(){
  const cropId=Number(document.getElementById('ct-crop').value);
  const n=(S.cuttings||[]).filter(c=>c.cropId===cropId).length+1;
  document.getElementById('ct-cutno').value=n;
}
function toggleCuttingDestination(){
  const d=document.getElementById('ct-destination').value;
  document.getElementById('ct-feed-box').style.display=d==='feed'?'block':'none';
  document.getElementById('ct-rent-box').style.display=d==='rent'?'block':'none';
  document.getElementById('ct-sold-box').style.display=d==='sold'?'block':'none';
}
function saveCutting(){
  const cropId=Number(document.getElementById('ct-crop').value),date=document.getElementById('ct-date').value;
  if(!cropId||!date){toast('⚠ اختر المحصول والتاريخ');return;}
  const qty=parseFloat(document.getElementById('ct-qty').value)||0;
  if(qty<=0){toast('⚠ أدخل الكمية');return;}
  const destination=document.getElementById('ct-destination').value;
  const unit=document.getElementById('ct-unit').value;
  const ct={id:uid(),cropId,date,cutNo:parseInt(document.getElementById('ct-cutno').value)||1,qty,unit,destination,notes:document.getElementById('ct-notes').value.trim()};
  if(destination==='feed'){
    let itemId=Number(document.getElementById('ct-feeditem').value)||null;
    if(!itemId){
      // create a new feed inventory item automatically named after the crop
      const crop=(S.crops||[]).find(c=>c.id===cropId);
      itemId=createOrGetFeedItem(crop?crop.name:'علف من حشة',unit);
    }
    ct.feedItemId=itemId;
    addInventoryMove(itemId,date,'in',qty,0,'cutting',ct.id,'حشة رقم '+ct.cutNo+' من المحصول');
  } else if(destination==='rent'){
    ct.rentQirat=parseFloat(document.getElementById('ct-rentqirat').value)||0;
    ct.rentPricePerQirat=parseFloat(document.getElementById('ct-rentprice').value)||0;
    const value=ct.rentQirat*ct.rentPricePerQirat;
    S.internalFeedUse=S.internalFeedUse||[];
    const crop=(S.crops||[]).find(c=>c.id===cropId);
    S.internalFeedUse.push({id:uid(),date,source:'cutting',refId:ct.id,feedType:crop?crop.name:'علف',qty,unit,value,notes:'إيجار قيراط حشة رقم '+ct.cutNo});
  } else if(destination==='sold'){
    ct.soldTotal=parseFloat(document.getElementById('ct-soldtotal').value)||0;
  }
  S.cuttings=S.cuttings||[];S.cuttings.push(ct);
  schedSave();closeModal('m-cutting');renderPage(currentPage);toast('تم تسجيل الحشة');
}
function deleteCutting(id){
  confirmAction('حذف هذه الحشة؟ سيتم عكس أي حركة مخزون أو تكلفة علف مرتبطة بها.',()=>{
    S.inventoryMoves=(S.inventoryMoves||[]).filter(m=>!(m.refType==='cutting'&&m.refId===id));
    S.internalFeedUse=(S.internalFeedUse||[]).filter(u=>!(u.source==='cutting'&&u.refId===id));
    recalcInventoryQtys();
    S.cuttings=(S.cuttings||[]).filter(c=>c.id!==id);
    schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}
