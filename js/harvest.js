// ═══════════════════════════════════════════════════════
//  حصاد — HARVEST & BYPRODUCTS MODULE
// ═══════════════════════════════════════════════════════
const HARVEST_DEST_LABELS={feed:'تحويل لعلف (مخزون)',sold:'بيع',stored:'تخزين بدون تحويل'};
const BYPRODUCT_CROPS=['بنجر','بطاطا','قشر أرز','مخلفات خضار','أخرى'];

let harvestTab='harvest';
function setHarvestTab(t,btn){
  harvestTab=t;
  document.querySelectorAll('#harvest-tabs button').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  renderPage('harvest');
}

function renderHarvestPage(wrap){
  document.getElementById('topbar-actions').innerHTML=
    harvestTab==='harvest'?'<button class="btn btn-primary" onclick="openHarvestModal()"><i class="fas fa-plus"></i> تسجيل حصاد</button>'
                          :'<button class="btn btn-primary" onclick="openByproductModal()"><i class="fas fa-plus"></i> تسجيل مخلفات</button>';
  wrap.innerHTML=
    '<div class="seg" id="harvest-tabs" style="max-width:340px;margin-bottom:16px">'+
      '<button class="'+(harvestTab==='harvest'?'on':'')+'" onclick="setHarvestTab(\'harvest\',this)">الحصاد</button>'+
      '<button class="'+(harvestTab==='byproducts'?'on':'')+'" onclick="setHarvestTab(\'byproducts\',this)">المخلفات الزراعية</button>'+
    '</div>'+
    (harvestTab==='harvest'?renderHarvestTab():renderByproductsTab());
}

// ---------- Harvest tab ----------
function renderHarvestTab(){
  const harvests=[...(S.harvests||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const totalSold=harvests.filter(h=>h.destination==='sold').reduce((s,h)=>s+Number(h.soldRevenue||0),0);
  const totalFeed=harvests.filter(h=>h.destination==='feed').reduce((s,h)=>s+Number(h.qty||0),0);
  return '<div class="kpi-grid">'+
      kpiCard('عدد سجلات الحصاد',harvests.length,'fa-wheat-awn','green')+
      kpiCard('كمية حُوّلت لعلف',fN(totalFeed),'fa-cow','blue')+
      kpiCard('إيرادات بيع المحاصيل',fMoney(totalSold),'fa-coins','green')+
    '</div>'+
    (!(S.crops||[]).length?'<div class="alert alert-info"><i class="fas fa-circle-info"></i><span>أضف محصولاً من صفحة "المحاصيل" أولاً قبل تسجيل الحصاد.</span></div>':'')+
    '<div class="card"><div class="card-header"><div class="card-title">سجل الحصاد</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>المحصول</th><th>الكمية</th><th>المصير</th><th>التفاصيل</th><th></th></tr></thead><tbody>'+
    (harvests.length?harvests.map(h=>{
      const crop=(S.crops||[]).find(c=>c.id===h.cropId);
      let details='—';
      if(h.destination==='feed') details='أُضيف '+fN(h.qty)+' '+esc(h.unit)+' للمخزون'+(h.feedItemId?(' — '+esc(invItemName(h.feedItemId))):'');
      else if(h.destination==='sold') details='إيراد: '+fMoney(h.soldRevenue);
      return '<tr><td>'+h.date+'</td><td style="font-weight:700">'+(crop?esc(crop.name):'—')+'</td>'+
        '<td>'+fN(h.qty)+' '+esc(h.unit)+'</td>'+
        '<td><span class="tag '+(h.destination==='sold'?'tag-green':h.destination==='feed'?'tag-blue':'tag-gray')+'">'+(HARVEST_DEST_LABELS[h.destination]||h.destination)+'</span></td>'+
        '<td>'+details+'</td>'+
        '<td><button class="btn-icon danger" onclick="deleteHarvest('+h.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></td></tr>';
    }).join(''):'<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--txt4)">لا توجد سجلات حصاد</td></tr>')+
    '</tbody></table></div></div></div>';
}
function openHarvestModal(){
  populateCropSel('hv-crop',false);
  populateFeedItemSel('hv-feeditem');
  document.getElementById('hv-date').value=TODAY;
  ['hv-qty','hv-soldtotal','hv-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('hv-unit').value='كيلو';
  document.getElementById('hv-destination').value='feed';
  toggleHarvestDestination();
  openModal('m-harvest');
}
function toggleHarvestDestination(){
  const d=document.getElementById('hv-destination').value;
  document.getElementById('hv-feed-box').style.display=d==='feed'?'block':'none';
  document.getElementById('hv-sold-box').style.display=d==='sold'?'block':'none';
}
function saveHarvest(){
  const cropId=Number(document.getElementById('hv-crop').value),date=document.getElementById('hv-date').value;
  const qty=parseFloat(document.getElementById('hv-qty').value)||0;
  if(!cropId||!date||qty<=0){toast('⚠ تأكد من المحصول والتاريخ والكمية');return;}
  const destination=document.getElementById('hv-destination').value;
  const unit=document.getElementById('hv-unit').value;
  const hv={id:uid(),cropId,date,qty,unit,destination,notes:document.getElementById('hv-notes').value.trim()};
  if(destination==='feed'){
    let itemId=Number(document.getElementById('hv-feeditem').value)||null;
    if(!itemId){const crop=(S.crops||[]).find(c=>c.id===cropId);itemId=createOrGetFeedItem(crop?crop.name:'علف من الحصاد',unit);}
    hv.feedItemId=itemId;
    addInventoryMove(itemId,date,'in',qty,0,'harvest',hv.id,'حصاد محصول');
  } else if(destination==='sold'){
    hv.soldRevenue=parseFloat(document.getElementById('hv-soldtotal').value)||0;
  }
  const crop=(S.crops||[]).find(c=>c.id===cropId);
  if(crop&&crop.status==='growing') crop.status='harvested';
  S.harvests=S.harvests||[];S.harvests.push(hv);
  schedSave();closeModal('m-harvest');renderPage(currentPage);toast('تم تسجيل الحصاد');
}
function deleteHarvest(id){
  confirmAction('حذف سجل الحصاد هذا؟ سيتم عكس أي حركة مخزون مرتبطة به.',()=>{
    S.inventoryMoves=(S.inventoryMoves||[]).filter(m=>!(m.refType==='harvest'&&m.refId===id));
    recalcInventoryQtys();
    S.harvests=(S.harvests||[]).filter(h=>h.id!==id);
    schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}

// ---------- Byproducts tab ----------
function renderByproductsTab(){
  const bps=[...(S.byproducts||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const totalCost=bps.reduce((s,b)=>s+Number(b.transportCost||0)+Number(b.prepCost||0),0);
  const totalSold=bps.filter(b=>b.destination==='sold').reduce((s,b)=>s+Number(b.soldTotal||0),0);
  return '<div class="kpi-grid">'+
      kpiCard('عدد سجلات المخلفات',bps.length,'fa-leaf','')+
      kpiCard('تكاليف النقل والتجهيز',fMoney(totalCost),'fa-truck','red')+
      kpiCard('إيرادات البيع',fMoney(totalSold),'fa-coins','green')+
    '</div>'+
    '<div class="card"><div class="card-header"><div class="card-title">سجل المخلفات الزراعية (بنجر، بطاطا...)</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>المحصول</th><th>المساحة (قيراط)</th><th>تكلفة النقل والتجهيز</th><th>المصير</th><th>التفاصيل</th><th></th></tr></thead><tbody>'+
    (bps.length?bps.map(b=>{
      let details='—';
      if(b.destination==='feed') details='أُضيف '+fN(b.qty||0)+' '+esc(b.unit||'كيلو')+' للمخزون'+(b.feedItemId?(' — '+esc(invItemName(b.feedItemId))):'');
      else if(b.destination==='sold') details='إيراد: '+fMoney(b.soldTotal);
      return '<tr><td>'+b.date+'</td><td style="font-weight:700">'+esc(b.cropName)+'</td>'+
        '<td>'+fN(b.qiratArea)+' قيراط</td><td class="amt-red">'+fMoney(Number(b.transportCost||0)+Number(b.prepCost||0))+'</td>'+
        '<td><span class="tag '+(b.destination==='sold'?'tag-green':b.destination==='feed'?'tag-blue':'tag-gray')+'">'+(HARVEST_DEST_LABELS[b.destination]||b.destination)+'</span></td>'+
        '<td>'+details+'</td>'+
        '<td><button class="btn-icon danger" onclick="deleteByproduct('+b.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></td></tr>';
    }).join(''):'<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--txt4)">لا توجد سجلات</td></tr>')+
    '</tbody></table></div></div></div>';
}
function openByproductModal(){
  populateFeedItemSel('bp-feeditem');
  document.getElementById('bp-date').value=TODAY;
  document.getElementById('bp-crop').innerHTML=BYPRODUCT_CROPS.map(c=>'<option value="'+c+'">'+c+'</option>').join('');
  ['bp-qirat','bp-transport','bp-prep','bp-qty','bp-soldtotal','bp-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('bp-unit').value='كيلو';
  document.getElementById('bp-destination').value='feed';
  toggleByproductDestination();
  openModal('m-byproduct');
}
function toggleByproductDestination(){
  const d=document.getElementById('bp-destination').value;
  document.getElementById('bp-feed-box').style.display=d==='feed'?'block':'none';
  document.getElementById('bp-sold-box').style.display=d==='sold'?'block':'none';
}
function saveByproduct(){
  const date=document.getElementById('bp-date').value,cropName=document.getElementById('bp-crop').value;
  if(!date){toast('⚠ أدخل التاريخ');return;}
  const destination=document.getElementById('bp-destination').value;
  const qty=parseFloat(document.getElementById('bp-qty').value)||0;
  const unit=document.getElementById('bp-unit').value;
  const bp={id:uid(),date,cropName,qiratArea:parseFloat(document.getElementById('bp-qirat').value)||0,
    transportCost:parseFloat(document.getElementById('bp-transport').value)||0,prepCost:parseFloat(document.getElementById('bp-prep').value)||0,
    destination,qty,unit,notes:document.getElementById('bp-notes').value.trim()};
  if(destination==='feed'&&qty>0){
    let itemId=Number(document.getElementById('bp-feeditem').value)||null;
    if(!itemId) itemId=createOrGetFeedItem(cropName,unit);
    bp.feedItemId=itemId;
    addInventoryMove(itemId,date,'in',qty,0,'byproduct',bp.id,'مخلفات زراعية');
  } else if(destination==='sold'){
    bp.soldTotal=parseFloat(document.getElementById('bp-soldtotal').value)||0;
  }
  S.byproducts=S.byproducts||[];S.byproducts.push(bp);
  schedSave();closeModal('m-byproduct');renderPage(currentPage);toast('تم تسجيل المخلفات');
}
function deleteByproduct(id){
  confirmAction('حذف هذا السجل؟ سيتم عكس أي حركة مخزون مرتبطة به.',()=>{
    S.inventoryMoves=(S.inventoryMoves||[]).filter(m=>!(m.refType==='byproduct'&&m.refId===id));
    recalcInventoryQtys();
    S.byproducts=(S.byproducts||[]).filter(b=>b.id!==id);
    schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}
