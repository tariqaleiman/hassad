// ═══════════════════════════════════════════════════════
//  حصاد — PARTNERS & OWNERSHIP PAGE
// ═══════════════════════════════════════════════════════

const PARTNER_COLORS=['#2E7D32','#1565C0','#C62828','#E65100','#6A1B9A','#00838F','#AD1457','#5D4037'];

function renderPartnersPage(wrap){
  document.getElementById('topbar-actions').innerHTML='<button class="btn btn-primary" onclick="openPartnerModal(null)"><i class="fas fa-user-plus"></i> إضافة شريك</button>';
  const partners=S.partners||[];
  const activeCattle=(S.cattle||[]).filter(c=>!isOut(c));

  wrap.innerHTML=
    '<div class="alert alert-info"><i class="fas fa-circle-info"></i><span>هذه الصفحة تتحكم في الشركاء المستخدمين عند تحديد نسب ملكية الأبقار، نصيب المواليد، ونصيب الأرباح عند البيع. يمكن إضافة أي عدد من الشركاء ودعم أي تركيبة نسب (50/50، 25/75، 0/100 مع نصيب أرباح ثابت...إلخ).</span></div>'+
    '<div style="display:flex;flex-direction:column;gap:14px;margin-bottom:20px">'+
      partners.map(p=>partnerCard(p,activeCattle)).join('')+
    '</div>'+
    '<div class="card"><div class="card-header"><div class="card-title"><i class="fas fa-cow"></i> تفاصيل ملكية كل رأس</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الحيوان</th><th>الحالة</th><th>ملكية رأس المال</th><th>نصيب البيع</th><th>نصيب المواليد</th><th></th></tr></thead><tbody>'+
    (activeCattle.length?activeCattle.map(c=>{
      return '<tr><td style="font-weight:700">'+esc(c.name)+'</td>'+
        '<td>'+cowBadges(c)+'</td>'+
        '<td>'+ownerPillsHTML(c.owners)+'</td>'+
        '<td>'+ownerPillsHTML(c.saleShares)+'</td>'+
        '<td>'+ownerPillsHTML(c.birthShares)+'</td>'+
        '<td><button class="btn btn-sm btn-outline" onclick="openAddAnimalModal('+c.id+')"><i class="fas fa-pen"></i> تعديل</button></td></tr>';
    }).join(''):'<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--txt4)">لا توجد رؤوس مسجلة</td></tr>')+
    '</tbody></table></div></div></div>';
}

function ownerPillsHTML(shares){
  if(!shares||!shares.length) return '<span style="color:var(--txt4)">—</span>';
  return '<div class="owner-pills">'+shares.filter(s=>Number(s.pct)>0).map(s=>{
    const p=partnerById(s.partnerId);
    return '<span class="owner-pill" style="background:'+(p?p.color:'#999')+'">'+esc(p?p.name:'—')+' '+fN(s.pct)+'%</span>';
  }).join('')+'</div>';
}

function partnerCard(p,activeCattle){
  const cs=partnerCattleSummary(p.id);
  const owned=activeCattle.filter(c=>shareFor(c.owners,p.id)>0).length;
  return '<div class="card"><div class="card-body">'+
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">'+
      '<div style="display:flex;align-items:center;gap:12px">'+
        '<div style="width:42px;height:42px;border-radius:10px;background:'+p.color+';display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px"><i class="fas fa-user"></i></div>'+
        '<div><div style="font-size:15px;font-weight:800;color:var(--txt)">'+esc(p.name)+(p.isMe?' <span class="tag tag-green" style="margin-right:4px">أنت</span>':'')+'</div>'+
        '<div style="font-size:11px;color:var(--txt3);margin-top:2px">يملك حصة في '+owned+' من '+activeCattle.length+' رأس</div></div>'+
      '</div>'+
      '<div style="display:flex;gap:6px">'+
        '<button class="btn btn-sm btn-outline" onclick="openPartnerModal('+p.id+')"><i class="fas fa-pen"></i> تعديل</button>'+
        (partners_length()>1?'<button class="btn btn-sm btn-ghost" style="color:var(--red)" onclick="deletePartner('+p.id+')"><i class="fas fa-trash"></i></button>':'')+
      '</div>'+
    '</div>'+
    '<div class="split-grid" style="margin-top:14px">'+
      '<div class="split-card" style="border-color:'+p.color+'"><div class="sc-name">قيمة الأصول (نصيبه)</div><div class="sc-val">'+fMoney(cs.assetValue)+'</div></div>'+
      '<div class="split-card" style="border-color:'+p.color+'"><div class="sc-name">إيرادات (حليب+بيع)</div><div class="sc-val" style="color:var(--pr2)">'+fMoney(cs.revenue)+'</div></div>'+
      '<div class="split-card" style="border-color:'+p.color+'"><div class="sc-name">التكاليف</div><div class="sc-val" style="color:var(--red)">'+fMoney(cs.cost)+'</div></div>'+
      '<div class="split-card" style="border-color:'+p.color+'"><div class="sc-name">صافي الربح</div><div class="sc-val" style="color:'+(cs.net>=0?'var(--pr2)':'var(--red)')+'">'+fMoney(cs.net)+'</div></div>'+
    '</div>'+
  '</div></div>';
}
function partners_length(){return (S.partners||[]).length;}

// ---------- Modal ----------
function openPartnerModal(id){
  document.getElementById('pt-id').value=id||'';
  const p=id?partnerById(id):null;
  document.getElementById('pt-name').value=p?p.name:'';
  document.getElementById('pt-ismee').checked=p?!!p.isMe:false;
  const colorWrap=document.getElementById('pt-colors');
  const current=p?p.color:PARTNER_COLORS[(S.partners||[]).length % PARTNER_COLORS.length];
  colorWrap.innerHTML=PARTNER_COLORS.map(c=>'<button type="button" class="color-swatch'+(c===current?' on':'')+'" data-c="'+c+'" style="background:'+c+'" onclick="pickPartnerColor(this)"></button>').join('');
  colorWrap.dataset.selected=current;
  document.getElementById('m-partner-title').textContent=p?'تعديل شريك':'إضافة شريك';
  openModal('m-partner');
}
function pickPartnerColor(btn){
  document.querySelectorAll('#pt-colors .color-swatch').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('pt-colors').dataset.selected=btn.dataset.c;
}
function savePartner(){
  const id=document.getElementById('pt-id').value;
  const name=document.getElementById('pt-name').value.trim();
  if(!name){toast('⚠ أدخل اسم الشريك');return;}
  const color=document.getElementById('pt-colors').dataset.selected||PARTNER_COLORS[0];
  const isMe=document.getElementById('pt-ismee').checked;
  if(id){
    const p=partnerById(id);
    p.name=name;p.color=color;
    if(isMe) (S.partners||[]).forEach(x=>x.isMe=(x.id===p.id));
    else if(p.isMe && !(S.partners||[]).some(x=>x.id!==p.id&&x.isMe)) p.isMe=true;
  }else{
    if(isMe) (S.partners||[]).forEach(x=>x.isMe=false);
    S.partners=S.partners||[];
    S.partners.push({id:uid(),name,color,isMe:isMe||!S.partners.length});
  }
  schedSave();closeModal('m-partner');renderPage(currentPage);toast('تم الحفظ');
}
function deletePartner(id){
  const used=(S.cattle||[]).some(c=>shareFor(c.owners,id)>0||shareFor(c.saleShares,id)>0||shareFor(c.birthShares,id)>0);
  if(used){toast('⚠ لا يمكن حذف هذا الشريك لوجود نسب ملكية مرتبطة به في القطيع. عدّل النسب أولاً.');return;}
  if((S.partners||[]).length<=1){toast('⚠ لا يمكن حذف الشريك الوحيد');return;}
  confirmAction('حذف هذا الشريك؟',()=>{
    S.partners=(S.partners||[]).filter(p=>p.id!==Number(id));
    if(!(S.partners||[]).some(p=>p.isMe)) S.partners[0].isMe=true;
    schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}
