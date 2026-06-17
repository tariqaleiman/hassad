// ═══════════════════════════════════════════════════════
//  حصاد — INVENTORY & MAINTENANCE MODULE
// ═══════════════════════════════════════════════════════
const INV_CATEGORIES={feed:'أعلاف (تبن/قش/دريس/مركز)',fertilizer:'أسمدة',pesticide:'مبيدات',nutrient:'مغذيات',fuel:'وقود (بنزين/جاز)',spare:'قطع غيار وزيوت'};
const MAINT_TYPES={oil_change:'تغيير زيت',tractor_maint:'صيانة جرار',fuel:'بنزين/جاز',irrigation_maint:'صيانة مضخة/ري',sprayer_maint:'صيانة رشاش',other:'أخرى'};
function invCategoryLabel(cat){return INV_CATEGORIES[cat]||cat;}

// ---------- Core inventory helpers (used across modules) ----------
function recalcInventoryQtys(){
  (S.inventoryItems||[]).forEach(it=>{
    let qty=0,costSum=0,costQty=0;
    (S.inventoryMoves||[]).filter(m=>m.itemId===it.id).sort((a,b)=>a.date.localeCompare(b.date)).forEach(m=>{
      if(m.type==='in'){ qty+=Number(m.qty||0); if(Number(m.unitCost||0)>0){costSum+=Number(m.qty||0)*Number(m.unitCost||0);costQty+=Number(m.qty||0);} }
      else { qty-=Number(m.qty||0); }
    });
    it.qty=qty;
    if(costQty>0) it.avgCost=costSum/costQty;
  });
}
function addInventoryMove(itemId,date,type,qty,unitCost,refType,refId,reason){
  S.inventoryMoves=S.inventoryMoves||[];
  S.inventoryMoves.push({id:uid(),itemId,date,type,qty:Number(qty||0),unitCost:Number(unitCost||0),total:Number(qty||0)*Number(unitCost||0),refType,refId,reason,notes:''});
  recalcInventoryQtys();
}
function createOrGetFeedItem(name,unit){
  S.inventoryItems=S.inventoryItems||[];
  let item=S.inventoryItems.find(it=>it.category==='feed'&&it.name===name);
  if(!item){ item={id:uid(),category:'feed',name,unit:unit||'كيلو',qty:0,avgCost:0,minQty:null}; S.inventoryItems.push(item); }
  return item.id;
}
function populateFeedItemSel(selId){
  const items=(S.inventoryItems||[]).filter(it=>it.category==='feed');
  const el=document.getElementById(selId);
  if(el)el.innerHTML='<option value="">— إنشاء عنصر مخزون جديد تلقائياً —</option>'+items.map(it=>'<option value="'+it.id+'">'+esc(it.name)+' ('+fN(it.qty)+' '+esc(it.unit)+' متاح)</option>').join('');
}

let invTab='feed';
function setInvTab(t,btn){
  invTab=t;
  document.querySelectorAll('#inv-tabs button').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  renderPage('inventory');
}

// ═══════════════════════════════════════════════════════
//  INVENTORY PAGE (tabs: أعلاف | مدخلات زراعية | صيانة)
// ═══════════════════════════════════════════════════════
function renderInventoryPage(wrap){
  let actions='';
  if(invTab==='feed') actions='<button class="btn btn-outline" onclick="openInvConvertModal()"><i class="fas fa-arrows-rotate"></i> تحويل / دراس</button><button class="btn btn-primary" onclick="openInvMoveModal(\'feed\')"><i class="fas fa-plus"></i> حركة مخزون</button>';
  else if(invTab==='inputs') actions='<button class="btn btn-primary" onclick="openInvMoveModal(\'inputs\')"><i class="fas fa-plus"></i> حركة مخزون</button>';
  else actions='<button class="btn btn-primary" onclick="openMaintModal()"><i class="fas fa-plus"></i> سجل صيانة</button>';
  document.getElementById('topbar-actions').innerHTML=actions;

  wrap.innerHTML=
    '<div class="seg" id="inv-tabs" style="max-width:420px;margin-bottom:16px">'+
      '<button class="'+(invTab==='feed'?'on':'')+'" onclick="setInvTab(\'feed\',this)">مخزون الأعلاف</button>'+
      '<button class="'+(invTab==='inputs'?'on':'')+'" onclick="setInvTab(\'inputs\',this)">المدخلات الزراعية</button>'+
      '<button class="'+(invTab==='maint'?'on':'')+'" onclick="setInvTab(\'maint\',this)">الصيانة والوقود</button>'+
    '</div>'+
    (invTab==='feed'?renderInvTab('feed'):invTab==='inputs'?renderInvTab(['fertilizer','pesticide','nutrient','fuel','spare']):renderMaintTab());
}

function renderInvTab(categories){
  const cats=Array.isArray(categories)?categories:[categories];
  const items=(S.inventoryItems||[]).filter(it=>cats.includes(it.category));
  const moves=[...(S.inventoryMoves||[])].filter(m=>{const it=(S.inventoryItems||[]).find(x=>x.id===m.itemId);return it&&cats.includes(it.category);}).sort((a,b)=>b.date.localeCompare(a.date));
  const totalValue=items.reduce((s,it)=>s+Number(it.qty||0)*Number(it.avgCost||0),0);
  const low=items.filter(it=>it.minQty!=null&&Number(it.qty||0)<=Number(it.minQty)).length;
  return '<div class="kpi-grid">'+
      kpiCard('عدد العناصر',items.length,'fa-boxes-stacked','')+
      kpiCard('القيمة الإجمالية',fMoney(totalValue),'fa-coins','green')+
      kpiCard('عناصر منخفضة المخزون',low,'fa-triangle-exclamation','red')+
    '</div>'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'+
      '<div class="sec-title-line">عناصر المخزون</div><button class="btn btn-sm btn-outline" onclick="openInvItemModal(null,'+(Array.isArray(categories)?"'"+categories[0]+"'":"'"+categories+"'")+')"><i class="fas fa-plus"></i> إضافة عنصر</button>'+
    '</div>'+
    (items.length?'<div class="stock-grid" style="margin-bottom:20px">'+items.map(it=>stockCard(it)).join('')+'</div>'
      :'<div class="alert alert-info" style="margin-bottom:20px"><i class="fas fa-circle-info"></i><span>لا توجد عناصر مسجلة في هذا القسم. أضف عنصراً جديداً لبدء تتبع الكمية والتكلفة.</span></div>')+
    '<div class="card"><div class="card-header"><div class="card-title">سجل الحركة (وارد/صادر)</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>العنصر</th><th>الحركة</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th><th>السبب</th><th></th></tr></thead><tbody>'+
    (moves.length?moves.slice(0,40).map(m=>{
      const it=(S.inventoryItems||[]).find(x=>x.id===m.itemId);
      return '<tr><td>'+m.date+'</td><td style="font-weight:700">'+(it?esc(it.name):'—')+'</td>'+
        '<td><span class="tag '+(m.type==='in'?'tag-green':'tag-red')+'">'+(m.type==='in'?'وارد +':'صادر -')+'</span></td>'+
        '<td>'+fN(m.qty)+' '+(it?esc(it.unit):'')+'</td><td>'+(m.unitCost?fMoney(m.unitCost):'—')+'</td><td class="amt">'+(m.total?fMoney(m.total):'—')+'</td>'+
        '<td>'+esc(m.reason||'—')+'</td>'+
        '<td><button class="btn-icon danger" onclick="deleteInvMove('+m.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></td></tr>';
    }).join(''):'<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--txt4)">لا توجد حركات مسجلة</td></tr>')+
    '</tbody></table></div></div></div>';
}
function stockCard(it){
  const low=it.minQty!=null&&Number(it.qty||0)<=Number(it.minQty);
  return '<div class="stock-card'+(low?' low':'')+'">'+
    (low?'<span class="tag tag-red st-low-badge">منخفض</span>':'')+
    '<div class="st-name">'+esc(it.name)+'</div>'+
    '<div><span class="st-qty">'+fN(it.qty)+'</span> <span class="st-unit">'+esc(it.unit)+'</span></div>'+
    '<div class="st-meta">متوسط التكلفة: '+fMoney(it.avgCost)+' / '+esc(it.unit)+'</div>'+
    '<div class="st-meta">القيمة: '+fMoney(Number(it.qty||0)*Number(it.avgCost||0))+'</div>'+
    '<div style="display:flex;gap:6px;margin-top:8px">'+
      '<button class="btn btn-sm btn-outline" onclick="openInvItemModal('+it.id+')"><i class="fas fa-pen"></i> تعديل</button>'+
      '<button class="btn btn-sm btn-ghost" style="color:var(--red)" onclick="deleteInvItem('+it.id+')"><i class="fas fa-trash"></i></button>'+
    '</div></div>';
}

// ---------- Inventory item modal ----------
function openInvItemModal(editId,defaultCat){
  const it=editId?(S.inventoryItems||[]).find(x=>x.id===editId):null;
  document.getElementById('ii-edit-id').value=editId||'';
  document.getElementById('m-inv-item-title').textContent=it?'تعديل عنصر: '+it.name:'إضافة عنصر مخزون';
  document.getElementById('ii-name').value=it?it.name:'';
  document.getElementById('ii-cat').innerHTML=Object.entries(INV_CATEGORIES).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join('');
  document.getElementById('ii-cat').value=it?it.category:(defaultCat||'feed');
  document.getElementById('ii-unit').value=it?it.unit:'';
  document.getElementById('ii-qty').value=it?it.qty:'0';
  document.getElementById('ii-avgcost').value=it?it.avgCost:'0';
  document.getElementById('ii-minqty').value=it&&it.minQty!=null?it.minQty:'';
  openModal('m-inv-item');
}
function saveInvItem(){
  const name=document.getElementById('ii-name').value.trim();
  if(!name){toast('⚠ أدخل اسم العنصر');return;}
  const editId=document.getElementById('ii-edit-id').value;
  const data={name,category:document.getElementById('ii-cat').value,unit:document.getElementById('ii-unit').value.trim()||'وحدة',
    minQty:document.getElementById('ii-minqty').value?parseFloat(document.getElementById('ii-minqty').value):null};
  if(editId){ Object.assign((S.inventoryItems||[]).find(x=>x.id===Number(editId)),data); }
  else {
    S.inventoryItems=S.inventoryItems||[];
    const item=Object.assign({id:uid(),qty:0,avgCost:0},data);
    S.inventoryItems.push(item);
    const initQty=parseFloat(document.getElementById('ii-qty').value)||0;
    const initCost=parseFloat(document.getElementById('ii-avgcost').value)||0;
    if(initQty>0) addInventoryMove(item.id,TODAY,'in',initQty,initCost,'initial',null,'رصيد افتتاحي');
  }
  schedSave();closeModal('m-inv-item');renderPage(currentPage);toast('تم الحفظ');
}
function deleteInvItem(id){
  confirmAction('حذف هذا العنصر وكل حركاته المسجلة؟',()=>{
    S.inventoryItems=(S.inventoryItems||[]).filter(it=>it.id!==id);
    S.inventoryMoves=(S.inventoryMoves||[]).filter(m=>m.itemId!==id);
    schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}

// ---------- Inventory movement modal ----------
function openInvMoveModal(section){
  const cats=section==='feed'?['feed']:['fertilizer','pesticide','nutrient','fuel','spare'];
  const items=(S.inventoryItems||[]).filter(it=>cats.includes(it.category));
  if(!items.length){toast('⚠ أضف عنصر مخزون أولاً');return;}
  document.getElementById('im-item').innerHTML=items.map(it=>'<option value="'+it.id+'">'+esc(it.name)+' ('+fN(it.qty)+' '+esc(it.unit)+')</option>').join('');
  document.getElementById('im-date').value=TODAY;
  document.getElementById('im-type').value='in';
  ['im-qty','im-unitcost','im-reason'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('im-reason').value=section==='feed'?'شراء':'شراء';
  toggleInvMoveType();
  openModal('m-inv-move');
}
function toggleInvMoveType(){
  const isIn=document.getElementById('im-type').value==='in';
  document.getElementById('im-cost-fg').style.display=isIn?'block':'none';
  const reasonSel=document.getElementById('im-reason');
  if(isIn) reasonSel.innerHTML='<option value="شراء">شراء</option><option value="رصيد افتتاحي">رصيد افتتاحي</option><option value="إنتاج داخلي">إنتاج داخلي (محصول/حشة)</option><option value="أخرى">أخرى</option>';
  else reasonSel.innerHTML='<option value="استخدام كعلف للأبقار">استخدام كعلف للأبقار (يُحمَّل كتكلفة)</option><option value="استخدام في الرش/التسميد">استخدام في الرش/التسميد</option><option value="هالك/فقد">هالك/فقد</option><option value="أخرى">أخرى</option>';
}
function saveInvMove(){
  const itemId=Number(document.getElementById('im-item').value),date=document.getElementById('im-date').value;
  const qty=parseFloat(document.getElementById('im-qty').value)||0;
  if(!itemId||!date||qty<=0){toast('⚠ تأكد من اختيار العنصر والتاريخ والكمية');return;}
  const type=document.getElementById('im-type').value;
  const item=(S.inventoryItems||[]).find(x=>x.id===itemId);
  const reason=document.getElementById('im-reason').value;
  let unitCost=0,refType='manual';
  if(type==='in'){ unitCost=parseFloat(document.getElementById('im-unitcost').value)||0; refType=reason==='شراء'?'purchase':'manual'; }
  else if(reason==='استخدام كعلف للأبقار'){ unitCost=item?Number(item.avgCost||0):0; refType='feed_use'; }
  if(type==='out'&&item&&qty>Number(item.qty||0)){
    toast('⚠ الكمية المطلوب صرفها ('+fN(qty)+') أكبر من المتاح ('+fN(item.qty)+' '+item.unit+')');return;
  }
  addInventoryMove(itemId,date,type,qty,unitCost,refType,null,reason);
  schedSave();closeModal('m-inv-move');renderPage(currentPage);toast('تم تسجيل الحركة');
}
function deleteInvMove(id){
  confirmAction('حذف هذه الحركة؟ سيتم إعادة حساب الكمية المتاحة.',()=>{
    S.inventoryMoves=(S.inventoryMoves||[]).filter(m=>m.id!==id);
    recalcInventoryQtys();schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}

// ---------- Conversion (e.g. دراس: قش -> تبن) ----------
function openInvConvertModal(){
  const items=(S.inventoryItems||[]).filter(it=>it.category==='feed');
  if(items.length<1){toast('⚠ أضف عناصر مخزون أعلاف أولاً');return;}
  document.getElementById('cv-from').innerHTML=items.map(it=>'<option value="'+it.id+'">'+esc(it.name)+' ('+fN(it.qty)+' '+esc(it.unit)+' متاح)</option>').join('');
  document.getElementById('cv-date').value=TODAY;
  ['cv-fromqty','cv-toqty','cv-tonew','cv-cost','cv-notes'].forEach(id=>document.getElementById(id).value='');
  refreshConvertToSel();
  openModal('m-inv-convert');
}
function refreshConvertToSel(){
  const fromId=Number(document.getElementById('cv-from').value);
  const items=(S.inventoryItems||[]).filter(it=>it.category==='feed'&&it.id!==fromId);
  document.getElementById('cv-to').innerHTML='<option value="">— عنصر جديد —</option>'+items.map(it=>'<option value="'+it.id+'">'+esc(it.name)+' ('+fN(it.qty)+' '+esc(it.unit)+' متاح)</option>').join('');
  toggleConvertNew();
}
function toggleConvertNew(){
  document.getElementById('cv-tonew-fg').style.display=document.getElementById('cv-to').value?'none':'block';
}
function saveInvConvert(){
  const fromId=Number(document.getElementById('cv-from').value),date=document.getElementById('cv-date').value;
  const fromQty=parseFloat(document.getElementById('cv-fromqty').value)||0;
  const toQty=parseFloat(document.getElementById('cv-toqty').value)||0;
  if(!fromId||!date||fromQty<=0||toQty<=0){toast('⚠ تأكد من الكمية المستهلكة والمنتجة');return;}
  const fromItem=(S.inventoryItems||[]).find(x=>x.id===fromId);
  if(fromQty>Number(fromItem.qty||0)){toast('⚠ الكمية المستهلكة أكبر من المتاح ('+fN(fromItem.qty)+' '+fromItem.unit+')');return;}
  let toId=Number(document.getElementById('cv-to').value)||null;
  const cost=parseFloat(document.getElementById('cv-cost').value)||0;
  if(!toId){
    const newName=document.getElementById('cv-tonew').value.trim();
    if(!newName){toast('⚠ أدخل اسم العنصر الناتج (مثال: تبن)');return;}
    toId=createOrGetFeedItem(newName,fromItem.unit);
  }
  const convId=uid();
  addInventoryMove(fromId,date,'out',fromQty,fromItem.avgCost,'conversion',convId,'تحويل/دراس');
  const producedUnitCost=(fromQty*Number(fromItem.avgCost||0)+cost)/toQty;
  addInventoryMove(toId,date,'in',toQty,producedUnitCost,'conversion',convId,'منتج من تحويل/دراس');
  if(cost>0){
    S.maintenanceLogs=S.maintenanceLogs||[];
    S.maintenanceLogs.push({id:uid(),date,equipment:'دراس/تحويل أعلاف',type:'other',qty:null,unit:'',cost,vendor:'',paytype:'cash',notes:document.getElementById('cv-notes').value.trim()||'تكلفة تحويل/دراس'});
  }
  schedSave();closeModal('m-inv-convert');renderPage(currentPage);toast('تم التحويل بنجاح');
}

// ═══════════════════════════════════════════════════════
//  MAINTENANCE TAB
// ═══════════════════════════════════════════════════════
function renderMaintTab(){
  const logs=[...(S.maintenanceLogs||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const total=logs.reduce((s,m)=>s+Number(m.cost||0),0);
  const thisMonth=logs.filter(m=>m.date.slice(0,7)===TODAY.slice(0,7)).reduce((s,m)=>s+Number(m.cost||0),0);
  return '<div class="kpi-grid">'+
      kpiCard('إجمالي تكاليف الصيانة والوقود',fMoney(total),'fa-wrench','red')+
      kpiCard('هذا الشهر',fMoney(thisMonth),'fa-calendar','gold')+
      kpiCard('عدد السجلات',logs.length,'fa-list','')+
    '</div>'+
    '<div class="card"><div class="card-header"><div class="card-title">سجل الصيانة والوقود</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>المعدة</th><th>النوع</th><th>الكمية</th><th>التكلفة</th><th>المورد</th><th>ملاحظات</th><th></th></tr></thead><tbody>'+
    (logs.length?logs.map(m=>'<tr><td>'+m.date+'</td><td style="font-weight:700">'+esc(m.equipment||'—')+'</td>'+
      '<td><span class="tag tag-blue">'+(MAINT_TYPES[m.type]||m.type)+'</span></td>'+
      '<td>'+(m.qty?fN(m.qty)+' '+esc(m.unit||''):'—')+'</td><td class="amt-red">'+fMoney(m.cost)+'</td>'+
      '<td>'+esc(m.vendor||'—')+'</td><td>'+esc(m.notes||'—')+'</td>'+
      '<td><button class="btn-icon danger" onclick="deleteMaint('+m.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></td></tr>').join(''):
      '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--txt4)">لا توجد سجلات صيانة</td></tr>')+
    '</tbody></table></div></div></div>';
}
function openMaintModal(){
  document.getElementById('mt-date').value=TODAY;
  ['mt-equipment','mt-qty','mt-unit','mt-cost','mt-vendor','mt-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('mt-type').innerHTML=Object.entries(MAINT_TYPES).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join('');
  document.getElementById('mt-type').value='oil_change';
  document.getElementById('mt-paytype').value='cash';
  openModal('m-maint');
}
function saveMaint(){
  const date=document.getElementById('mt-date').value,cost=parseFloat(document.getElementById('mt-cost').value)||0;
  if(!date){toast('⚠ أدخل التاريخ');return;}
  const paytype=document.getElementById('mt-paytype').value;
  S.maintenanceLogs=S.maintenanceLogs||[];
  const m={id:uid(),date,equipment:document.getElementById('mt-equipment').value.trim(),type:document.getElementById('mt-type').value,
    qty:parseFloat(document.getElementById('mt-qty').value)||null,unit:document.getElementById('mt-unit').value.trim(),
    cost,vendor:document.getElementById('mt-vendor').value.trim(),paytype,notes:document.getElementById('mt-notes').value.trim()};
  S.maintenanceLogs.push(m);
  if(cost>0&&paytype==='credit'){
    S.debts=S.debts||[];
    S.debts.push({id:uid(),vendor:m.vendor||'مورد',reason:(MAINT_TYPES[m.type]||m.type)+(m.equipment?' — '+m.equipment:''),amount:cost,remaining:cost,status:'open',date,refId:m.id,refType:'maintenance'});
  }
  schedSave();closeModal('m-maint');renderPage(currentPage);toast('تم التسجيل');
}
function deleteMaint(id){
  confirmAction('حذف هذا السجل؟',()=>{S.maintenanceLogs=(S.maintenanceLogs||[]).filter(m=>m.id!==id);schedSave();renderPage(currentPage);toast('تم الحذف');});
}
