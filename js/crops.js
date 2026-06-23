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
  {value:'sow',   label:'زراعة / بذر',          units:['كيلو','شتلة','شيكارة','ساعة','قيراط','يومية']},
  {value:'transplant',label:'نقل شتلات',        units:['شتلة','كيلو','ساعة','قيراط','يومية']},
  {value:'weed',  label:'عزيق / إزالة حشائش',   units:['ساعة','قيراط','يومية']},
  {value:'harvest',label:'حصاد',                units:['كيلو','طن','قنطار','ساعة','قيراط','يومية']},
  {value:'fertilize',label:'تسميد',             units:['شيكارة','كيلو','وحدة','يومية']},
  {value:'spray', label:'رش مبيدات / مغذيات',   units:['عبوة','لتر','كيلو','مرة رش','يومية']},
  {value:'irrigate',label:'ري',                 units:['ساعة','يومية']},
  {value:'labor', label:'عمالة عامة / مياومة',  units:['يومية','ساعة']},
  {value:'other', label:'عملية أخرى',           units:['وحدة','كيلو','ساعة','يوم','يومية']},
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
let cropsSeasonFilter='active'; // 'active' = current active season only, 'all' = every season, or a specific seasonId
function setCropsSeasonFilter(val){
  cropsSeasonFilter=val;
  renderPage('crops');
}
function renderCropsPage(wrap){
  document.getElementById('topbar-actions').innerHTML=
    (cropsTab==='crops'?'<button class="btn btn-primary" onclick="openCropModal(null)"><i class="fas fa-plus"></i> إضافة محصول</button>'
     :cropsTab==='cuttings'?'<button class="btn btn-primary" onclick="openCuttingModal(null)"><i class="fas fa-plus"></i> تسجيل حشة</button>'
     :'<button class="btn btn-primary" onclick="openExpenseModal(null)"><i class="fas fa-plus"></i> تسجيل مصروف</button>');
  const allCrops=S.crops||[];
  const cur=activeSeason();
  let crops=allCrops;
  if(cropsSeasonFilter==='active' && cur) crops=allCrops.filter(c=>c.seasonId===cur.id);
  else if(cropsSeasonFilter!=='all' && cropsSeasonFilter!=='active') crops=allCrops.filter(c=>c.seasonId===Number(cropsSeasonFilter));
  const growing=crops.filter(c=>c.status==='growing');
  const totalArea=crops.reduce((s,c)=>s+Number(c.area||0),0);
  const opsCost=(S.ops||[]).filter(o=>crops.some(c=>c.id===o.cropId)&&o.hasCost).reduce((s,o)=>s+Number(o.cost||0),0);

  const seasonFilterHTML='<div class="fg" style="max-width:280px;margin-bottom:14px"><label style="font-size:11px;color:var(--txt3);font-weight:700;display:block;margin-bottom:4px">عرض محاصيل:</label><select onchange="setCropsSeasonFilter(this.value)" style="width:100%;padding:8px;border:1.5px solid var(--brd);border-radius:var(--r2);font-family:\'Cairo\',sans-serif">'+
    '<option value="active"'+(cropsSeasonFilter==='active'?' selected':'')+'>الموسم النشط فقط'+(cur?' ('+esc(cur.name)+')':'')+'</option>'+
    '<option value="all"'+(cropsSeasonFilter==='all'?' selected':'')+'>كل المواسم</option>'+
    (S.seasons||[]).map(s=>'<option value="'+s.id+'"'+(String(cropsSeasonFilter)===String(s.id)?' selected':'')+'>'+esc(s.name)+'</option>').join('')+
  '</select></div>';

  wrap.innerHTML=
    '<div class="seg" id="crops-tabs" style="max-width:480px;margin-bottom:16px">'+
      '<button class="'+(cropsTab==='crops'?'on':'')+'" onclick="setCropsTab(\'crops\',this)">المحاصيل</button>'+
      '<button class="'+(cropsTab==='cuttings'?'on':'')+'" onclick="setCropsTab(\'cuttings\',this)">الحشات والمراعي</button>'+
      '<button class="'+(cropsTab==='expenses'?'on':'')+'" onclick="setCropsTab(\'expenses\',this)">المصروفات</button>'+
    '</div>'+
    (cropsTab==='crops'?seasonFilterHTML:'')+
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
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>المحصول</th><th>النوع</th><th>الموسم</th><th>الأرض</th><th>المساحة</th><th>المرحلة الحالية</th><th>الحالة</th><th>التكلفة الإجمالية</th><th></th></tr></thead><tbody>'+
    (crops.length?crops.map(c=>{
      const cost=(S.ops||[]).filter(o=>o.cropId===c.id&&o.hasCost).reduce((s,o)=>s+Number(o.cost||0),0)+totalExpensesForCrop(c.id);
      const stage=currentStage(c);
      const season=(S.seasons||[]).find(s=>s.id===c.seasonId);
      const land=(S.lands||[]).find(l=>l.id===c.landId);
      const fullName = c.subtype ? esc(c.name) + ' <span style="font-weight:400;color:var(--txt3)">(' + esc(c.subtype) + ')</span>' : esc(c.name);
      const tracking = getCropTrackingHTML(c.id);
      return '<tr><td style="font-weight:700">'+fullName+'<div style="margin-top:4px">'+tracking+'</div></td><td><span class="tag tag-blue">'+esc(c.type)+'</span></td>'+
        '<td>'+(season?esc(season.name):'<span style="color:var(--txt4)">—</span>')+'</td>'+
        '<td>'+(land?esc(land.name):'<span style="color:var(--txt4)">—</span>')+'</td>'+
        '<td>'+fN(c.area)+' '+esc(c.areaUnit||'قيراط')+(c.isForage?' <span class="tag tag-gold" style="margin-right:3px">علف</span>':'')+'</td>'+
        '<td>'+(stage?'<span class="tag tag-gold"><i class="fas '+stageIcon(stage)+'"></i> '+stageLabel(stage)+'</span>':'<span style="color:var(--txt4)">لم تبدأ</span>')+'</td>'+
        '<td><span class="tag '+(c.status==='growing'?'tag-green':'tag-gray')+'">'+(CROP_STATUS_LABELS[c.status]||c.status)+'</span></td>'+
        '<td class="amt-red">'+fMoney(cost)+'</td>'+
        '<td><div style="display:flex;gap:4px"><button class="btn btn-sm btn-outline" onclick="openCropStagesModal('+c.id+')"><i class="fas fa-route"></i></button><button class="btn-icon" onclick="openCropModal('+c.id+')"><i class="fas fa-pen" style="font-size:11px"></i></button><button class="btn-icon danger" onclick="deleteCrop('+c.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></div></td></tr>';
    }).join(''):'<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--txt4)">لا توجد محاصيل مسجلة في هذا العرض</td></tr>')+
    '</tbody></table></div></div></div>';
}
function getCropTrackingHTML(cropId){
  const ops = (S.ops||[]).filter(o=>o.cropId===cropId).sort((a,b)=>a.date.localeCompare(b.date));
  const irrigations = ops.filter(o=>o.type==='irrigate');
  const fertilizations = ops.filter(o=>o.type==='fertilize');
  
  let html = '';
  if(irrigations.length){
    const last = irrigations[irrigations.length-1];
    const days = Math.floor((new Date(TODAY) - new Date(last.date))/(1000*60*60*24));
    html += '<span class="tag tag-blue" style="font-size:10px;padding:2px 6px" title="تاريخ آخر رية: '+last.date+'"><i class="fas fa-droplet"></i> رية '+irrigations.length+' (منذ '+days+' يوم)</span> ';
  }
  if(fertilizations.length){
    const last = fertilizations[fertilizations.length-1];
    const days = Math.floor((new Date(TODAY) - new Date(last.date))/(1000*60*60*24));
    html += '<span class="tag tag-orange" style="font-size:10px;padding:2px 6px" title="تاريخ آخر تسميد: '+last.date+'"><i class="fas fa-seedling"></i> تسميد '+fertilizations.length+' (منذ '+days+' يوم)</span>';
  }
  return html;
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
  document.getElementById('cr-subtype').value=c?(c.subtype||''):'';
  populateCropTypeDatalist();
  document.getElementById('cr-type').value=c?c.type:(S.cropTypes&&S.cropTypes[0])||'';
  populateSeasonSel('cr-season');
  document.getElementById('cr-season').value=c?(c.seasonId||''):(S.activeSeasonId||'');
  populateLandSel('cr-land');
  document.getElementById('cr-land').value=c?(c.landId||''):'';
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
  const subtype=document.getElementById('cr-subtype').value.trim();
  const type=document.getElementById('cr-type').value.trim()||'أخرى';
  // if the user typed a brand-new crop type, remember it for next time
  S.cropTypes=S.cropTypes||JSON.parse(JSON.stringify(DEFAULT_CROP_TYPES));
  if(!S.cropTypes.includes(type)) S.cropTypes.push(type);
  const editId=document.getElementById('cr-edit-id').value;
  const data={name,subtype,type,area:parseFloat(document.getElementById('cr-area').value)||0,
    areaUnit:document.getElementById('cr-areaunit').value,pdate:document.getElementById('cr-pdate').value,
    hdate:document.getElementById('cr-hdate').value,loc:document.getElementById('cr-loc').value.trim(),
    status:document.getElementById('cr-status').value,isForage:document.getElementById('cr-isforage').checked,
    seasonId:Number(document.getElementById('cr-season').value)||null,
    landId:document.getElementById('cr-land').value?Number(document.getElementById('cr-land').value):null,
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
// ──── Per-operation inline expense rows (multi-cost) ────
const OP_EXPENSE_CATEGORIES=[
  {id:'seeds',label:'تقاوي/بذور',icon:'fa-seedling'},
  {id:'fertilizer',label:'أسمدة',icon:'fa-box'},
  {id:'pesticide',label:'مبيدات/مغذيات',icon:'fa-flask'},
  {id:'fuel',label:'بنزين/وقود',icon:'fa-gas-pump'},
  {id:'labor',label:'أجور عمالة',icon:'fa-person'},
  {id:'machine',label:'إيجار آلة',icon:'fa-tractor'},
  {id:'water',label:'مياه/ري',icon:'fa-droplet'},
  {id:'maintenance',label:'صيانة',icon:'fa-wrench'},
  {id:'transport',label:'نقل',icon:'fa-truck'},
  {id:'other',label:'أخرى',icon:'fa-ellipsis'},
];
let opExpenseRows=[];
function addOpExpenseRow(){
  const rowId='oer_'+uid();
  opExpenseRows.push({rowId,source:'direct',catId:'labor',amount:'',date:'',vendor:'',notes:'',paytype:'cash',invItemId:'',invQty:''});
  renderOpExpenseRows();
}
function removeOpExpenseRow(rowId){
  opExpenseRows=opExpenseRows.filter(r=>r.rowId!==rowId);
  renderOpExpenseRows();
}
function renderOpExpenseRows(){
  const wrap=document.getElementById('co-expense-rows');
  if(!wrap) return;
  wrap.innerHTML=opExpenseRows.map(r=>{
    const isInv = r.source==='inventory';
    return '<div class="op-exp-row" id="row_'+r.rowId+'" style="margin-bottom:10px;padding:8px;background:var(--bg3);border-radius:var(--r2);border:1px solid var(--brd2)">'+
    '<div class="frow" style="margin-bottom:6px">'+
      '<div class="fg"><select onchange="updateOpExpRow(\''+r.rowId+'\',\'source\',this.value)">'+
        '<option value="direct"'+(!isInv?' selected':'')+'>مصروف مالي مباشر</option>'+
        '<option value="inventory"'+(isInv?' selected':'')+'>استهلاك من المخزون (بنزين، سماد...)</option>'+
      '</select></div>'+
      '<div class="fg"><input type="date" value="'+r.date+'" oninput="updateOpExpRow(\''+r.rowId+'\',\'date\',this.value)"></div>'+
      '<button class="btn-icon danger" onclick="removeOpExpenseRow(\''+r.rowId+'\')"><i class="fas fa-trash" style="font-size:11px"></i></button>'+
    '</div>'+
    (isInv ? 
      '<div class="frow" style="margin-bottom:0">'+
        '<div class="fg"><select onchange="updateOpExpRow(\''+r.rowId+'\',\'invItemId\',this.value);calcOpInvExpAmount(\''+r.rowId+'\')"><option value="">اختر عنصر المخزون...</option>'+
          (S.inventoryItems||[]).map(i=>'<option value="'+i.id+'"'+(String(r.invItemId)===String(i.id)?' selected':'')+'>'+esc(i.name)+' (المتاح: '+fN(i.qty)+')</option>').join('')+
        '</select></div>'+
        '<div class="fg"><input type="number" placeholder="الكمية المستهلكة" min="0" step="0.1" value="'+r.invQty+'" oninput="updateOpExpRow(\''+r.rowId+'\',\'invQty\',this.value);calcOpInvExpAmount(\''+r.rowId+'\')"></div>'+
        '<div class="fg"><input type="number" placeholder="التكلفة المحسوبة" disabled value="'+r.amount+'"></div>'+
      '</div>'
    : 
      '<div class="frow" style="margin-bottom:6px">'+
        '<div class="fg"><select class="op-exp-cat" data-row="'+r.rowId+'" onchange="updateOpExpRow(\''+r.rowId+'\',\'catId\',this.value)">'+
          OP_EXPENSE_CATEGORIES.map(c=>'<option value="'+c.id+'"'+(c.id===r.catId?' selected':'')+'>'+c.label+'</option>').join('')+
        '</select></div>'+
        '<div class="fg"><input type="number" class="op-exp-amt" placeholder="المبلغ (ج)" min="0" value="'+r.amount+'" oninput="updateOpExpRow(\''+r.rowId+'\',\'amount\',this.value);calcOpExpTotal()"></div>'+
        '<div class="fg"><select onchange="updateOpExpRow(\''+r.rowId+'\',\'paytype\',this.value)">'+
          '<option value="cash"'+(r.paytype==='cash'?' selected':'')+'>نقدي</option>'+
          '<option value="credit"'+(r.paytype==='credit'?' selected':'')+'>آجل</option>'+
        '</select></div>'+
      '</div>'+
      '<div class="frow" style="margin-bottom:0">'+
        '<div class="fg" style="flex:2"><input type="text" placeholder="المورد / الجهة (اختياري)" value="'+esc(r.vendor)+'" oninput="updateOpExpRow(\''+r.rowId+'\',\'vendor\',this.value)"></div>'+
      '</div>'
    )+
  '</div>'
  }).join('');
  if(!opExpenseRows.length){
    wrap.innerHTML='<div style="text-align:center;font-size:11px;color:var(--txt4);padding:10px;background:var(--bg3);border-radius:var(--r2);border:1px dashed var(--brd2)">اضغط "+ إضافة بند" لتسجيل تكاليف هذه العملية أو استهلاك مواد من المخزون</div>';
  }
  calcOpExpTotal();
}
function updateOpExpRow(rowId,field,val){
  const r=opExpenseRows.find(x=>x.rowId===rowId);
  if(r) { r[field]=val; if(field==='source') renderOpExpenseRows(); }
}
function calcOpInvExpAmount(rowId){
  const r=opExpenseRows.find(x=>x.rowId===rowId);
  if(!r) return;
  const it=(S.inventoryItems||[]).find(x=>x.id===Number(r.invItemId));
  const qty=parseFloat(r.invQty)||0;
  if(it && qty>0){
    r.amount = (qty * Number(it.avgCost||0)).toFixed(2);
  } else {
    r.amount = '';
  }
  renderOpExpenseRows();
}
function calcOpExpTotal(){
  const total=opExpenseRows.reduce((s,r)=>s+parseFloat(r.amount||0),0);
  const el=document.getElementById('co-expense-total');
  if(el) el.textContent=total>0?'إجمالي التكاليف المضافة: '+fMoney(total):'';
}

function updateOpUnits(){
  const type=document.getElementById('co-type').value;
  let units='<option value="">-- اختر الوحدة --</option>';
  if(type==='plow'||type==='plant') units+='<option value="ساعة">ساعة</option><option value="يومية">يومية</option><option value="مقطوعية">مقطوعية</option>';
  else if(type==='irrigate') units+='<option value="ساعة">ساعة</option><option value="مرة">مرة</option>';
  else if(type==='spray'||type==='fertilize') units+='<option value="رشة">رشة</option><option value="يومية">يومية</option><option value="مقطوعية">مقطوعية</option>';
  else units+='<option value="ساعة">ساعة</option><option value="يومية">يومية</option><option value="مرة">مرة</option><option value="مقطوعية">مقطوعية</option>';
  const sel=document.getElementById('co-unit');
  if(sel) sel.innerHTML=units;
}

function toggleWorkerField(){
  const t = document.getElementById('co-type').value;
  const f = document.getElementById('co-worker-fg');
  if(f) f.style.display = (t==='plow'||t==='plant'||t==='harvest'||t==='labor') ? 'block' : 'none';
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
  // load existing linked expense rows for edit mode
  opExpenseRows=[];
  if(o){
    const linked=(S.expenses||[]).filter(e=>e.linkType==='cropop'&&e.linkId===o.id);
    linked.forEach(e=>{
      opExpenseRows.push({rowId:'oer_'+uid(),catId:e.category||'other',amount:e.amount||'',
        date:e.date||TODAY,vendor:e.vendor||'',notes:e.notes||'',paytype:e.paytype||'cash'});
    });
  }
  renderOpExpenseRows();
  openModal('m-cropop');
}
function saveCropOp(){
  const cropId=Number(document.getElementById('co-crop').value),date=document.getElementById('co-date').value;
  if(!cropId||!date){toast('⚠ اختر المحصول والتاريخ');return;}
  const editId=document.getElementById('co-edit-id').value;
  const data={cropId,date,type:document.getElementById('co-type').value,desc:document.getElementById('co-desc').value.trim(),
    qty:parseFloat(document.getElementById('co-qty').value)||null,opUnit:document.getElementById('co-unit').value,
    worker:document.getElementById('co-worker').value.trim(),notes:document.getElementById('co-notes').value.trim()};
  let opId;
  if(editId){
    opId=Number(editId);
    Object.assign((S.ops||[]).find(x=>x.id===opId),data);
    // remove old linked expenses and re-create from current rows
    S.expenses=(S.expenses||[]).filter(e=>!(e.linkType==='cropop'&&e.linkId===opId));
    S.inventoryMoves=(S.inventoryMoves||[]).filter(m=>!(m.refType==='expense_consume'&&opExpenseRows.some(r=>r.rowId===m.refId)));
  } else {
    S.ops=S.ops||[];
    const op=Object.assign({id:uid(),hasCost:false,cost:0},data);
    S.ops.push(op);
    opId=op.id;
  }
  // save inline expense rows as separate Expense records linked to this operation
  opExpenseRows.forEach(r=>{
    const amount=parseFloat(r.amount)||0;
    if(amount<=0) return;
    const expDate=r.date||date;
    const isInv = r.source==='inventory';
    const finalCat = isInv ? 'inputs' : expCatFromOpCat(r.catId);
    const finalNotes = isInv ? 'استهلاك من المخزون: '+(invItemName(r.invItemId)||'') : (r.notes||r.catId);

    const ex={id:uid(),date:expDate,amount,category:finalCat,accountCode:guessExpenseAccount(finalCat),
      linkType:'cropop',linkId:opId,vendor:isInv?'':(r.vendor||''),paytype:isInv?'cash':(r.paytype||'cash'),
      worker:'',notes:finalNotes,source:r.source||'direct',
      invItemId:isInv?Number(r.invItemId):null,invQty:isInv?parseFloat(r.invQty):null};

    S.expenses=S.expenses||[];
    S.expenses.push(ex);

    if(isInv && ex.invItemId && ex.invQty>0){
      addInventoryMove(ex.invItemId,expDate,'out',ex.invQty,0,'expense_consume',ex.id,'استهلاك في عملية زراعية ('+opTypeLabel(data.type)+')');
    }

    if(!isInv && r.paytype==='credit'){
      S.debts=S.debts||[];
      const crop=(S.crops||[]).find(c=>c.id===cropId);
      S.debts.push({id:uid(),vendor:r.vendor||'مورد',reason:opTypeLabel(data.type)+(crop?' — '+crop.name:''),amount,remaining:amount,status:'open',date:expDate,refId:ex.id,refType:'expense',linkType:'crop',linkId:cropId});
    }
  });
  schedSave();closeModal('m-cropop');renderPage(currentPage);
  const totalExp=opExpenseRows.reduce((s,r)=>s+parseFloat(r.amount||0),0);
  toast('تم تسجيل العملية'+(totalExp>0?' مع '+opExpenseRows.filter(r=>parseFloat(r.amount)>0).length+' بنود تكلفة بإجمالي '+fMoney(totalExp):''));
}
function expCatFromOpCat(catId){
  const map={seeds:'other',fertilizer:'inputs',pesticide:'inputs',fuel:'maintenance',labor:'labor',machine:'cropops',water:'cropops',maintenance:'maintenance',transport:'transport',other:'other'};
  return map[catId]||'other';
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
