// ═══════════════════════════════════════════════════════
//  حصاد — CATTLE MODULE
// ═══════════════════════════════════════════════════════
const GESTATION_DAYS=283;
const DRY_PERIOD_DAYS=60;

function isActiveFemale(c){return c.gender==='female' && c.lifecycle==='active';}
function isActiveAdult(c){return (c.gender==='female'||c.gender==='bull') && c.lifecycle==='active';}
function isCalf(c){return c.lifecycle==='calf'||c.lifecycle==='fattening'||c.lifecycle==='breeding';}
function isOut(c){return c.lifecycle==='sold'||c.lifecycle==='dead';}

const LIFECYCLE_LABELS={active:'نشطة',calf:'عجل/عجلة (رضاعة)',breeding:'عجلة (نامية/للتربية)',fattening:'تسمين',sold:'مباعة',dead:'نافقة/خارجة'};

function cowBadges(c){
  let out='';
  if(c.lifecycle==='sold') return '<span class="tag tag-gray">مباعة</span>';
  if(c.lifecycle==='dead') return '<span class="tag tag-gray">نافقة</span>';
  if(c.lifecycle==='calf') out+='<span class="tag tag-blue">'+(c.gender==='female'?'عجلة':'عجل')+' — رضاعة</span>';
  else if(c.lifecycle==='breeding') out+='<span class="tag tag-purple">نامية / للتربية</span>';
  else if(c.lifecycle==='fattening') out+='<span class="tag tag-orange">تسمين</span>';
  else if(c.gender==='bull') out+='<span class="tag tag-blue">ثور</span>';
  else { // active female
    out+= c.milkStatus==='lactating' ? '<span class="tag tag-green">حلوب</span>' : '<span class="tag tag-gray">جافة</span>';
    if(c.pregnant){
      const left=c.dueDate?dBetween(TODAY,c.dueDate):null;
      const dynMonths=c.dueDate?Math.max(1,Math.round(9 - left/30.4)):c.pregMonths;
      out+=' <span class="tag tag-gold">حامل'+(dynMonths?' — شهر '+dynMonths:'')+(left!=null?' ('+(left>=0?left+'ي':'تأخر')+')':'')+'</span>';
    }
    else {
      // Check for last insemination
      const cowInsems = (S.insems||[]).filter(i => i.cowId === c.id).sort((a,b) => b.date.localeCompare(a.date));
      if(cowInsems.length > 0) {
        const lastInsem = cowInsems[0];
        const hasCheck = (S.pregChecks||[]).find(p => p.insemId === lastInsem.id);
        if(!hasCheck) {
          const days = dBetween(lastInsem.date, TODAY);
          let alertClass = "tag-gray";
          let label = "تلقيح: منذ " + days + " يوم";
          if (days >= 19 && days <= 22) { alertClass = "tag-orange"; label = "صرفان محتمل ("+days+" يوم)"; }
          else if (days >= 39 && days <= 42) { alertClass = "tag-green"; label = "يُرجى الكشف ("+days+" يوم)"; }
          else if (days > 42) { alertClass = "tag-red"; label = "تأخر الكشف ("+days+" يوم)"; }
          out+='<span class="tag '+alertClass+'"><i class="fas fa-dna"></i> '+label+'</span>';
        }
      }
    }
  }
  return out;
}
function cowStripe(c){
  if(c.lifecycle==='sold'||c.lifecycle==='dead') return 's-sold';
  if(c.lifecycle==='calf') return 's-calf';
  if(c.lifecycle==='breeding') return 's-lactating'; /* Using a purple/green color maybe, fallback to lactating stripe */
  if(c.lifecycle==='fattening') return 's-fattening';
  if(c.pregnant) return 's-pregnant';
  return c.milkStatus==='lactating' ? 's-lactating':'s-dry';
}

// ═══════════════════════════════════════════════════════
//  CATTLE PAGE
// ═══════════════════════════════════════════════════════
function renderCattlePage(wrap){
  document.getElementById('topbar-actions').innerHTML=
    '<button class="btn btn-outline" onclick="goPage(\'partners\',null)"><i class="fas fa-handshake"></i> الملكية والشركاء</button>'+
    '<button class="btn btn-primary" onclick="openAddAnimalModal(null)"><i class="fas fa-plus"></i> إضافة حيوان</button>';
  const cattle=S.cattle||[];
  const active=cattle.filter(c=>!isOut(c));
  const adults=active.filter(c=>isActiveAdult(c));
  const lactating=adults.filter(c=>c.gender==='female'&&c.milkStatus==='lactating').length;
  const dryCows=adults.filter(c=>c.gender==='female'&&c.milkStatus==='dry').length;
  const pregnant=adults.filter(c=>c.pregnant).length;
  const calvesN=active.filter(c=>isCalf(c)).length;
  wrap.innerHTML=
    '<div class="kpi-grid">'+
      kpiCard('إجمالي القطيع',active.length+' رأس','fa-cow','')+
      kpiCard('حلوب',lactating,'fa-wine-bottle','green')+
      kpiCard('جافة',dryCows,'fa-pause-circle','gold')+
      kpiCard('حوامل',pregnant,'fa-baby','blue')+
      kpiCard('عجول/تسمين',calvesN,'fa-piggy-bank','orange')+
      kpiCard('تكاليف الاقتناء',fMoney(cattle.reduce((s,c)=>s+Number(c.buyPrice||0),0)),'fa-coins','red')+
    '</div>'+
    (adults.length?
      '<div class="sec-title"><div class="sec-title-line">الأبقار والثيران البالغة</div></div>'+
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:14px;margin-bottom:24px">'+adults.map(c=>animalCard(c)).join('')+'</div>'
      :'')+
    (calvesN?
      '<div class="sec-title"><div class="sec-title-line">العجول والتسمين</div><button class="btn btn-sm btn-outline" onclick="goPage(\'calves\',null)">عرض صفحة العجول</button></div>'+
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:14px">'+active.filter(c=>isCalf(c)).map(c=>animalCard(c)).join('')+'</div>'
      :'')+
    (!active.length?emptyState('fa-cow','لا يوجد رؤوس في القطيع','ابدأ بإضافة أول رأس','openAddAnimalModal(null)'):'');
}

function animalCard(c){
  try{
    return animalCardInner(c);
  }catch(err){
    console.error('animalCard render error for cattle id='+(c&&c.id)+':',err);
    return '<div class="animal-card"><div class="ac-body"><div class="alert alert-danger"><i class="fas fa-triangle-exclamation"></i><span>خطأ في عرض سجل الحيوان #'+(c&&c.id)+' ('+esc(c&&c.name||'بدون اسم')+'). <button class="link-btn" onclick="openAnimalDetail('+(c&&c.id)+')">فتح الملف</button></span></div></div></div>';
  }
}
function animalCardInner(c){
  const lastMilk=getLastMilk(c.id);
  return '<div class="animal-card">'+
    '<div class="ac-stripe '+cowStripe(c)+'"></div>'+
    '<div class="ac-head">'+
      '<div class="ac-info">'+
        '<div class="ac-avatar"><i class="fas fa-'+(c.gender==='bull'?'horse-head':'cow')+'"></i></div>'+
        '<div><div class="ac-name">'+esc(c.name)+'</div>'+
          '<div class="ac-sub">'+(c.breed||'—')+' | '+(c.dob?ageStr(c.dob):'—')+'</div>'+
          '<div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap">'+cowBadges(c)+'</div>'+
          ownerPillsHTML(c.owners)+
        '</div>'+
      '</div>'+
    '</div>'+
    '<div class="ac-body">'+
      '<div class="ac-stats">'+
        '<div class="ac-stat"><div class="ac-stat-val">'+(c.buyPrice?fMoney(c.buyPrice):'—')+'</div><div class="ac-stat-lbl">تكلفة الاقتناء</div></div>'+
        '<div class="ac-stat"><div class="ac-stat-val">'+(lastMilk!=null?fN(lastMilk)+' ك':'—')+'</div><div class="ac-stat-lbl">آخر حليب</div></div>'+
        '<div class="ac-stat"><div class="ac-stat-val">'+(c.pregnant&&c.dueDate?dBetween(TODAY,c.dueDate)+' يوم':'—')+'</div><div class="ac-stat-lbl">للولادة</div></div>'+
      '</div>'+
      '<div class="ac-actions">'+
        '<button class="btn btn-sm btn-outline" onclick="openAnimalDetail('+c.id+')"><i class="fas fa-file-alt"></i> الملف</button>'+
        (isActiveFemale(c)?'<button class="btn btn-sm btn-outline" onclick="openInsemForCow('+c.id+')"><i class="fas fa-dna"></i> تلقيح</button>':'')+
        (isActiveFemale(c)?'<button class="btn btn-sm btn-outline" onclick="openBirthForCow('+c.id+')"><i class="fas fa-baby"></i> ولادة</button>':'')+
        '<button class="btn btn-sm btn-outline" onclick="openStatusModal('+c.id+')"><i class="fas fa-rotate"></i> الحالة</button>'+
        '<button class="btn btn-sm btn-outline" onclick="openSellForCow('+c.id+')"><i class="fas fa-hand-holding-usd"></i> بيع/خروج</button>'+
      '</div>'+
    '</div>'+
  '</div>';
}
function getLastMilk(cowId){
  const logs=[...(S.milkLogs||[])].sort((a,b)=>b.date.localeCompare(a.date));
  for(const l of logs){if(l.qtys&&l.qtys[cowId]!=null)return Number(l.qtys[cowId]);}
  return null;
}

// ═══════════════════════════════════════════════════════
//  ADD / EDIT ANIMAL MODAL
// ═══════════════════════════════════════════════════════
function openAddAnimalModal(editId){
  populateAnimalSels();
  const c=editId?( S.cattle||[]).find(x=>x.id===editId):null;
  document.getElementById('a-edit-id').value=editId||'';
  document.getElementById('m-animal-title').innerHTML='<i class="fas fa-cow"></i> '+(c?'تعديل بيانات: '+esc(c.name):'إضافة حيوان للقطيع');

  document.getElementById('a-name').value=c?c.name:'';
  document.getElementById('a-gender').value=c?c.gender:'female';
  document.getElementById('a-breed').value=c?(c.breed||''):'';
  document.getElementById('a-dob').value=c?(c.dob||''):'';
  document.getElementById('a-source').value=c?c.source:'bought';
  document.getElementById('a-buydate').value=c?(c.buyDate||TODAY):TODAY;
  document.getElementById('a-buyprice').value=c?(c.buyPrice||''):'';
  document.getElementById('a-seller').value=c?(c.seller||''):'';
  document.getElementById('a-notes').value=c?(c.notes||''):'';
  document.getElementById('a-mother').value=c?(c.motherId||''):'';

  document.getElementById('a-milkstatus').value=c?(c.milkStatus||'dry'):'dry';
  document.getElementById('a-pregnant').value=c&&c.pregnant?'yes':'no';
  document.getElementById('a-pregmonths').value=c?(c.pregMonths||''):'';

  document.getElementById('a-own-wrap').innerHTML=shareEditorHTML('a-own', c?c.owners:[{partnerId:meId(),pct:100}]);
  document.getElementById('a-sale-wrap').innerHTML=shareEditorHTML('a-sale', c?c.saleShares:[{partnerId:meId(),pct:100}]);
  document.getElementById('a-birth-wrap').innerHTML=shareEditorHTML('a-birth', c?c.birthShares:[{partnerId:meId(),pct:100}]);
  const sameSale = !c || sharesEqual(c.owners,c.saleShares);
  const sameBirth = !c || sharesEqual(c.owners,c.birthShares);
  document.getElementById('a-sale-same').checked=sameSale;
  document.getElementById('a-birth-same').checked=sameBirth;
  document.getElementById('a-sale-editor-box').style.display=sameSale?'none':'block';
  document.getElementById('a-birth-editor-box').style.display=sameBirth?'none':'block';

  document.getElementById('a-paytype').value='cash';
  document.getElementById('a-paid').value='';
  document.getElementById('a-vendor-name').value=c?(c.seller||''):'';

  toggleAnimalGenderFields();
  togglePregMonths();
  toggleAnimalSource();
  document.getElementById('a-paid-fg').style.display='none';
  document.getElementById('a-vendor-fg').style.display='none';
  openModal('m-animal');
}
function sharesEqual(a,b){
  a=a||[];b=b||[];
  if(a.length!==b.length) return false;
  const sa=[...a].sort((x,y)=>x.partnerId-y.partnerId), sb=[...b].sort((x,y)=>x.partnerId-y.partnerId);
  return sa.every((x,i)=>x.partnerId===sb[i].partnerId && Math.abs(x.pct-sb[i].pct)<0.01);
}
function toggleAnimalGenderFields(){
  const g=document.getElementById('a-gender').value;
  const adultFemale = g==='female';
  document.getElementById('a-adult-female-fields').style.display=adultFemale?'block':'none';
}
function togglePregMonths(){
  document.getElementById('a-pregmonths-fg').style.display=document.getElementById('a-pregnant').value==='yes'?'block':'none';
}
function toggleAnimalSource(){
  const src=document.getElementById('a-source').value;
  document.getElementById('a-buy-fields').style.display=(src==='bought')?'block':'none';
  document.getElementById('a-mother-fg').style.display=(src==='born')?'block':'none';
}
function toggleSaleShareEditor(){
  document.getElementById('a-sale-editor-box').style.display=document.getElementById('a-sale-same').checked?'none':'block';
}
function toggleBirthShareEditor(){
  document.getElementById('a-birth-editor-box').style.display=document.getElementById('a-birth-same').checked?'none':'block';
}

function saveAnimal(){
  const name=document.getElementById('a-name').value.trim();
  if(!name){toast('⚠ أدخل اسم/رقم الحيوان');return;}
  if(!validateShareEditor('a-own','نسب ملكية رأس المال')) return;
  const sameSale=document.getElementById('a-sale-same').checked;
  const sameBirth=document.getElementById('a-birth-same').checked;
  if(!sameSale && !validateShareEditor('a-sale','نسب نصيب البيع')) return;
  if(!sameBirth && !validateShareEditor('a-birth','نسب نصيب المواليد')) return;

  const editId=document.getElementById('a-edit-id').value;
  const gender=document.getElementById('a-gender').value;
  const source=document.getElementById('a-source').value;
  const buyPrice=source==='bought'?parseFloat(document.getElementById('a-buyprice').value)||0:0;
  const owners=readShareEditor('a-own');
  const saleShares=sameSale?JSON.parse(JSON.stringify(owners)):readShareEditor('a-sale');
  const birthShares=sameBirth?JSON.parse(JSON.stringify(owners)):readShareEditor('a-birth');

  let lifecycle='active', milkStatus=null, pregnant=false, pregMonths=null, dueDate=null;
  if(gender==='calf_f'||gender==='calf_m') lifecycle='calf';
  else if(gender==='female'){
    milkStatus=document.getElementById('a-milkstatus').value;
    pregnant=document.getElementById('a-pregnant').value==='yes';
    if(pregnant){
      pregMonths=parseFloat(document.getElementById('a-pregmonths').value)||1;
      dueDate=addDays(TODAY, Math.max(0,Math.round(GESTATION_DAYS-pregMonths*30.4)));
    }
  }

  if(editId){
    const c=(S.cattle||[]).find(x=>x.id===Number(editId));
    if(!c){toast('⚠ لم يتم العثور على السجل');return;}
    const old=JSON.parse(JSON.stringify(c));
    Object.assign(c,{
      name, gender, breed:document.getElementById('a-breed').value.trim(),
      dob:document.getElementById('a-dob').value,
      source, buyDate:source==='bought'?document.getElementById('a-buydate').value:c.buyDate,
      buyPrice, seller:document.getElementById('a-seller').value.trim(),
      owners, saleShares, birthShares,
      notes:document.getElementById('a-notes').value.trim(),
      motherId:document.getElementById('a-mother').value?Number(document.getElementById('a-mother').value):null,
    });
    if(gender==='female'){
      if(old.milkStatus!==milkStatus) c.statusLog=(c.statusLog||[]).concat([{date:TODAY,field:'milkStatus',from:old.milkStatus,to:milkStatus,note:'تعديل من نموذج التعديل'}]);
      c.milkStatus=milkStatus; c.pregnant=pregnant; c.pregMonths=pregMonths; c.dueDate=dueDate;
      if(c.lifecycle!=='sold'&&c.lifecycle!=='dead') c.lifecycle='active';
    }
    schedSave();closeModal('m-animal');renderPage(currentPage);toast('تم حفظ التعديلات');
    return;
  }

    const entryDate = source==='bought'?document.getElementById('a-buydate').value:(document.getElementById('a-dob').value||TODAY);
    const a={id:uid(),name,gender,breed:document.getElementById('a-breed').value.trim(),dob:document.getElementById('a-dob').value,
    lifecycle, milkStatus, pregnant, pregMonths, dueDate,
    source, buyDate:source==='bought'?document.getElementById('a-buydate').value:'', buyPrice,
    seller:source==='bought'?document.getElementById('a-seller').value.trim():'',
    owners, saleShares, birthShares,
    motherId:document.getElementById('a-mother').value?Number(document.getElementById('a-mother').value):null,
    notes:document.getElementById('a-notes').value.trim(),
    statusLog:[{date:entryDate,field:'created',from:null,to:lifecycle,note:'إضافة الحيوان للقطيع'}],
    createdAt:entryDate};
  S.cattle=S.cattle||[];S.cattle.push(a);
  if(source==='bought'&&buyPrice>0){
    const paytype=document.getElementById('a-paytype').value;
    if(paytype==='credit'){
      const paid=parseFloat(document.getElementById('a-paid').value)||0;
      S.debts=S.debts||[];
      S.debts.push({id:uid(),vendor:document.getElementById('a-vendor-name').value||document.getElementById('a-seller').value||'بائع',reason:'شراء حيوان: '+name,amount:buyPrice,remaining:buyPrice-paid,status:paid>=buyPrice?'paid':'open',date:document.getElementById('a-buydate').value,refId:a.id,refType:'cattle'});
    }
  }
  schedSave();closeModal('m-animal');renderPage(currentPage);toast('تم إضافة الحيوان');
}

function deleteAnimal(id){
  const c=(S.cattle||[]).find(x=>x.id===id);if(!c)return;
  confirmAction('حذف "'+c.name+'" وكل السجلات المرتبطة به (حليب، صحة، تلقيح، مواليد...)؟ لا يمكن التراجع.',()=>{
    cascadeDeleteCattle(id);
    schedSave();closeModal('m-animaldetail');renderPage(currentPage);toast('تم الحذف نهائياً');
  });
}

// ═══════════════════════════════════════════════════════
//  STATUS CHANGE MODAL  (lactating <-> dry, pregnancy info)
// ═══════════════════════════════════════════════════════
function openStatusModal(cowId){
  const c=(S.cattle||[]).find(x=>x.id===cowId);if(!c)return;
  document.getElementById('st-cow-id').value=cowId;
  document.getElementById('m-status-title').textContent='تغيير حالة: '+c.name;
  document.getElementById('st-date').value=TODAY;
  document.getElementById('st-note').value='';
  const box=document.getElementById('st-current-box');
  let body='';
  if(c.gender==='female'&&c.lifecycle==='active'){
    body+='<div class="fg"><label>الحالة الإنتاجية (حلوب/جافة)</label><select id="st-milkstatus">'+
      '<option value="lactating"'+(c.milkStatus==='lactating'?' selected':'')+'>حلوب</option>'+
      '<option value="dry"'+(c.milkStatus==='dry'?' selected':'')+'>جافة</option></select></div>'+
      '<div class="fg"><label>الحالة التناسلية</label><select id="st-pregnant" onchange="document.getElementById(\'st-pregmonths-fg\').style.display=this.value===\'yes\'?\'block\':\'none\'">'+
      '<option value="no"'+(!c.pregnant?' selected':'')+'>فارغة</option>'+
      '<option value="yes"'+(c.pregnant?' selected':'')+'>حامل</option></select></div>'+
      '<div class="fg" id="st-pregmonths-fg" style="display:'+(c.pregnant?'block':'none')+'"><label>عدد شهور الحمل</label><input type="number" id="st-pregmonths" min="1" max="9" value="'+(c.pregMonths||'')+'"><div class="hint">سيُعاد حساب موعد الولادة المتوقع تلقائياً</div></div>';
    if(c.pregnant&&c.dueDate){
      const left=dBetween(TODAY,c.dueDate);
      body='<div class="alert alert-info" style="margin-bottom:12px"><i class="fas fa-calendar"></i><span>موعد الولادة المتوقع الحالي: '+c.dueDate+' (متبقي '+left+' يوم)'+(left<=DRY_PERIOD_DAYS?' — موعد مناسب لبدء الجفاف إن لم يبدأ بعد':'')+'</span></div>'+body;
    }
  } else {
    body='<div class="fg"><label>الحالة العامة</label><select id="st-lifecycle">'+
      Object.entries(LIFECYCLE_LABELS).filter(([k])=>k!=='sold'&&k!=='dead').map(([k,v])=>'<option value="'+k+'"'+(c.lifecycle===k?' selected':'')+'>'+v+'</option>').join('')+
      '</select><div class="hint">للبيع أو الوفاة استخدم زر "بيع/خروج"</div></div>';
  }
  box.innerHTML=body;
  const hist=document.getElementById('st-history');
  const logs=(c.statusLog||[]).slice().reverse();
  hist.innerHTML=logs.length?('<div class="form-divider">سجل التغييرات</div><div class="tl" style="margin-top:8px">'+logs.map(l=>
    '<div class="tli ev-status"><div class="tl-date">'+l.date+'</div><div class="tl-title">'+statusLogLabel(l)+'</div>'+(l.note?'<div class="tl-meta">'+esc(l.note)+'</div>':'')+'</div>'
  ).join('')+'</div>'):'';
  openModal('m-status');
}
function statusLogLabel(l){
  const names={milkStatus:'الحالة الإنتاجية',pregnant:'الحالة التناسلية',lifecycle:'الحالة العامة',created:'إضافة'};
  const vals={lactating:'حلوب',dry:'جافة',yes:'حامل',no:'فارغة',active:'نشطة',calf:'رضاعة',fattening:'تسمين',sold:'مباعة',dead:'نافقة'};
  if(l.field==='created') return 'تمت الإضافة للقطيع';
  return (names[l.field]||l.field)+': '+(vals[l.from]||l.from||'—')+' ← '+(vals[l.to]||l.to);
}
function saveStatusChange(){
  const cowId=Number(document.getElementById('st-cow-id').value);
  const c=(S.cattle||[]).find(x=>x.id===cowId);if(!c)return;
  const date=document.getElementById('st-date').value||TODAY;
  const note=document.getElementById('st-note').value.trim();
  const logs=[];
  if(c.gender==='female'&&c.lifecycle==='active'){
    const newMilk=document.getElementById('st-milkstatus').value;
    const newPreg=document.getElementById('st-pregnant').value==='yes';
    const newMonths=newPreg?(parseFloat(document.getElementById('st-pregmonths').value)||1):null;

    if(newMilk!==c.milkStatus){
      if(newMilk==='dry'&&newPreg&&newMonths){
        const newDue=addDays(date,Math.max(0,Math.round(GESTATION_DAYS-newMonths*30.4)));
        const left=dBetween(date,newDue);
        if(left>DRY_PERIOD_DAYS+20){
          applyStatusChangeConfirm('بدء الجفاف الآن مبكر — متبقي '+left+' يوم على الولادة المتوقعة (المعتاد بدء الجفاف قبل الولادة بحوالي '+DRY_PERIOD_DAYS+' يوم). هل تريد الاستمرار؟',()=>finishStatusChange(c,date,note,newMilk,newPreg,newMonths,logs));
          return;
        }
      }
      if(newMilk==='lactating'&&newPreg&&newMonths){
        const newDue=addDays(date,Math.max(0,Math.round(GESTATION_DAYS-newMonths*30.4)));
        const left=dBetween(date,newDue);
        if(left<=DRY_PERIOD_DAYS){
          applyStatusChangeConfirm('متبقي '+left+' يوم فقط على الولادة المتوقعة — العادة تجفيف البقرة في هذه الفترة. هل تريد بالفعل استئناف الحلب؟',()=>finishStatusChange(c,date,note,newMilk,newPreg,newMonths,logs));
          return;
        }
      }
    }
    finishStatusChange(c,date,note,newMilk,newPreg,newMonths,logs);
  } else {
    const newLc=document.getElementById('st-lifecycle').value;
    if(newLc!==c.lifecycle) {
      logs.push({date,field:'lifecycle',from:c.lifecycle,to:newLc,note});
      if(newLc==='active' && (c.gender==='calf_f'||c.gender==='calf_m')) {
        const oldGender = c.gender;
        c.gender = (oldGender==='calf_f')?'female':'bull';
        if(c.gender==='female') {
          c.milkStatus='dry'; c.pregnant=false; c.pregMonths=null; c.dueDate=null;
        }
        logs.push({date,field:'gender',from:oldGender,to:c.gender,note:'تم الترقية لبلوغ الحيوان'});
      }
    }
    c.lifecycle=newLc;
    c.statusLog=(c.statusLog||[]).concat(logs);
    schedSave();closeModal('m-status');renderPage(currentPage);toast('تم تحديث الحالة');
  }
}
function applyStatusChangeConfirm(msg,cb){
  confirmAction(msg,cb);
}
function finishStatusChange(c,date,note,newMilk,newPreg,newMonths,logs){
  if(newMilk!==c.milkStatus){
    logs.push({date,field:'milkStatus',from:c.milkStatus,to:newMilk,note});
    if(newMilk==='dry') c.lastDryDate=date;
  }
  if(newPreg!==c.pregnant || (newPreg&&newMonths!==c.pregMonths)){
    logs.push({date,field:'pregnant',from:c.pregnant?'yes':'no',to:newPreg?'yes':'no',note:newPreg?('شهر '+newMonths):note});
  }
  c.milkStatus=newMilk;c.pregnant=newPreg;c.pregMonths=newPreg?newMonths:null;
  c.dueDate=newPreg?addDays(date,Math.max(0,Math.round(GESTATION_DAYS-newMonths*30.4))):null;
  c.statusLog=(c.statusLog||[]).concat(logs);
  schedSave();closeModal('m-status');renderPage(currentPage);toast('تم تحديث الحالة');
}

// ═══════════════════════════════════════════════════════
//  SELL / EXIT ANIMAL
// ═══════════════════════════════════════════════════════
function openSellForCow(cowId){
  populateAnimalSels();
  document.getElementById('sc-date').value=TODAY;
  ['sc-buyer','sc-notes','sc-price'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  document.getElementById('sc-reason').value='sold';
  const cow=(S.cattle||[]).find(c=>c.id===cowId);
  document.getElementById('sc-split-wrap').innerHTML=shareEditorHTML('sc-split', cow?cow.saleShares:[{partnerId:meId(),pct:100}]);
  document.getElementById('sc-split-preview').innerHTML='';
  setTimeout(()=>{const e=document.getElementById('sc-cow');if(e)e.value=cowId;updateShareTotal('sc-split');},10);
  openModal('m-sellcow');
}
function calcSellSplitPreview(){
  const price=parseFloat(document.getElementById('sc-price').value)||0;
  const shares=readShareEditor('sc-split');
  const prev=document.getElementById('sc-split-preview');
  if(price<=0){prev.innerHTML='';return;}
  prev.innerHTML='<div class="split-grid">'+shares.filter(s=>s.pct>0).map(s=>{
    const p=partnerById(s.partnerId);
    return '<div class="split-card" style="border-color:'+(p?p.color:'#999')+'"><div class="sc-name"><span class="share-dot" style="background:'+(p?p.color:'#999')+'"></span>'+esc(p?p.name:'—')+' ('+fN(s.pct)+'%)</div><div class="sc-val">'+fMoney(price*s.pct/100)+'</div></div>';
  }).join('')+'</div>';
}
function saveSellCow(){
  const cowId=Number(document.getElementById('sc-cow').value),date=document.getElementById('sc-date').value;
  if(!cowId||!date){toast('⚠ اختر الحيوان والتاريخ');return;}
  const reason=document.getElementById('sc-reason').value;
  const price=parseFloat(document.getElementById('sc-price').value)||0;
  let sellSplits=null;
  if(reason==='sold'&&price>0){
    if(!validateShareEditor('sc-split','نسب توزيع سعر البيع')) return;
    const shares=readShareEditor('sc-split');
    sellSplits=shares.map(s=>({partnerId:s.partnerId,pct:s.pct,amount:price*s.pct/100}));
  }
  const cow=(S.cattle||[]).find(c=>c.id===cowId);
  if(cow){
    cow.statusLog=(cow.statusLog||[]).concat([{date,field:'lifecycle',from:cow.lifecycle,to:(reason==='sold'?'sold':'dead'),note:reason==='sold'?'بيع':(reason==='slaughter'?'ذبح':'وفاة')}]);
    cow.lifecycle=(reason==='sold'?'sold':'dead');
    cow.sellDate=date;cow.sellPrice=price;cow.sellReason=reason;
    cow.buyer=document.getElementById('sc-buyer').value.trim();
    cow.sellSplits=sellSplits;
    cow.sellNotes=document.getElementById('sc-notes').value.trim();
  }
  schedSave();closeModal('m-sellcow');renderPage(currentPage);toast('تم تسجيل الخروج');
}

// ═══════════════════════════════════════════════════════
//  ANIMAL DETAIL MODAL
// ═══════════════════════════════════════════════════════
function openAnimalDetail(cowId){
  const c=(S.cattle||[]).find(x=>x.id===cowId);if(!c)return;
  const fin=cowFinancials(c);
  const mlogs=(S.milkLogs||[]).filter(l=>l.qtys&&l.qtys[cowId]!=null).sort((a,b)=>b.date.localeCompare(a.date));
  const totalMilk=mlogs.reduce((s,l)=>s+Number((l.qtys||{})[cowId]||0),0);
  const offspring=(S.births||[]).filter(b=>b.cowId===cowId);
  const hlogs=(S.healthLogs||[]).filter(h=>h.cowId===cowId).sort((a,b)=>b.date.localeCompare(a.date));
  const insems=(S.insems||[]).filter(i=>i.cowId===cowId).sort((a,b)=>b.date.localeCompare(a.date));
  const mother=c.motherId?(S.cattle||[]).find(x=>x.id===c.motherId):null;

  document.getElementById('ad-title').innerHTML='ملف: '+esc(c.name)+' '+cowBadges(c);
  let body='';

  body+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">'+
    miniStat(c.breed||'—','السلالة')+miniStat(c.dob?ageStr(c.dob):'—','العمر')+
    miniStat(mother?mother.name:'—','الأم')+
    miniStat(fN(totalMilk)+' ك','إجمالي الحليب')+miniStat(mlogs.length?fN(totalMilk/mlogs.length)+' ك':'—','متوسط/سجل')+
    miniStat(LIFECYCLE_LABELS[c.lifecycle]||c.lifecycle,'الحالة العامة')+
  '</div>';

  body+='<div class="form-divider">الملكية والتوزيع المالي</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:10px 0 14px">'+
      '<div><div style="font-size:11px;color:var(--txt3);font-weight:700;margin-bottom:6px">ملكية رأس المال</div>'+ownerPillsHTML(c.owners)+'</div>'+
      '<div><div style="font-size:11px;color:var(--txt3);font-weight:700;margin-bottom:6px">نصيب البيع</div>'+ownerPillsHTML(c.saleShares)+'</div>'+
      '<div><div style="font-size:11px;color:var(--txt3);font-weight:700;margin-bottom:6px">نصيب المواليد</div>'+ownerPillsHTML(c.birthShares)+'</div>'+
    '</div>'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الشريك</th><th>قيمة الأصل (نصيبه)</th><th>التكاليف (نصيبه)</th><th>إيراد الحليب (نصيبه)</th><th>إيراد البيع (نصيبه)</th><th>صافي الربح</th></tr></thead><tbody>'+
    (S.partners||[]).map(p=>{
      const my=cowPartnerSplit(c,fin,p.id);
      return '<tr><td style="font-weight:700"><span class="share-dot" style="background:'+p.color+'"></span> '+esc(p.name)+'</td>'+
        '<td>'+fMoney(my.assetValue)+'</td><td class="amt-red">'+fMoney(my.cost)+'</td>'+
        '<td class="amt-green">'+fMoney(my.milkRev)+'</td><td class="amt-green">'+fMoney(my.saleRev)+'</td>'+
        '<td class="'+(my.net>=0?'amt-green':'amt-red')+'">'+(my.net>=0?'+':'')+fMoney(my.net)+'</td></tr>';
    }).join('')+
    '</tbody></table></div>';

  if(c.lifecycle==='sold'||c.lifecycle==='dead'){
    body+='<div class="form-divider">بيانات الخروج</div><div class="alert '+(c.lifecycle==='sold'?'alert-success':'alert-danger')+'" style="margin-top:8px">'+
      '<i class="fas '+(c.lifecycle==='sold'?'fa-hand-holding-usd':'fa-skull')+'"></i><span>'+
      (c.lifecycle==='sold'?('تم البيع بتاريخ '+c.sellDate+' بسعر '+fMoney(c.sellPrice)+(c.buyer?' للمشتري: '+esc(c.buyer):'')):('خرجت بتاريخ '+c.sellDate+' — '+(c.sellReason==='slaughter'?'ذبح':'وفاة')))+
      '</span></div>';
  }

  if(offspring.length){body+='<div class="form-divider">المواليد ('+offspring.length+')</div><div style="margin-top:8px">'+offspring.map(b=>{const calf=(S.cattle||[]).find(x=>x.id===b.calfId);const fates={keep_female:'ستصبح بقرة',sell_female:'بيع صغيرة',fatten_male:'تسمين',sell_male:'بيع صغير'};return '<div style="display:flex;justify-content:space-between;padding:8px 10px;background:var(--bg3);border-radius:var(--r2);margin-bottom:6px"><div><div style="font-weight:700;font-size:13px">'+(b.gender==='female'?'أنثى':'ذكر')+' — '+esc(b.calfName)+'</div><div style="font-size:11px;color:var(--txt3)">'+b.date+' | '+(fates[b.fate]||'')+(calf?' | <button class="link-btn" onclick="closeModal(\'m-animaldetail\');openAnimalDetail('+calf.id+')">عرض الملف</button>':'')+'</div></div><span class="tag '+(b.gender==='female'?'tag-green':'tag-blue')+'">'+b.weight+' ك</span></div>';}).join('')+'</div>';}

  if(insems.length){body+='<div class="form-divider">التلقيح والتناسل</div><div class="tl" style="margin-top:8px">'+insems.map(i=>{const chk=(S.pregChecks||[]).find(p=>p.insemId===i.id);return '<div class="tli ev-insem"><div class="tl-date">'+i.date+'</div><div class="tl-title">تلقيح '+i.type+(i.bull?' — '+esc(i.bull):'')+'</div>'+( i.cost?'<div class="tl-meta">تكلفة: '+fMoney(i.cost)+'</div>':'')+( chk?'<div class="tl-meta" style="color:'+(chk.result==='positive'?'var(--pr2)':'var(--red)')+';font-weight:700">'+( chk.result==='positive'?'✓ حامل — ولادة متوقعة '+chk.dueDate:'✗ لم تحمل')+'</div>':'<div class="tl-meta" style="color:var(--gold)">في انتظار كشف الحمل</div>')+'</div>';}).join('')+'</div>';}

  if(hlogs.length){body+='<div class="form-divider">السجل الصحي</div><div class="tl" style="margin-top:8px">'+hlogs.slice(0,10).map(h=>'<div class="tli ev-health"><div class="tl-date">'+h.date+'</div><div class="tl-title">'+h.type+(h.desc?' — '+esc(h.desc):'')+'</div>'+(h.hasCost?'<div class="tl-meta">'+fMoney(h.cost)+(h.vet?' | '+esc(h.vet):'')+'</div>':'')+(h.nextDate?'<div class="tl-meta" style="color:var(--blue)">موعد التكرار: '+h.nextDate+'</div>':'')+'</div>').join('')+'</div>';}

  if((c.statusLog||[]).length){body+='<div class="form-divider">سجل تغييرات الحالة</div><div class="tl" style="margin-top:8px">'+[...c.statusLog].reverse().slice(0,12).map(l=>'<div class="tli ev-status"><div class="tl-date">'+l.date+'</div><div class="tl-title">'+statusLogLabel(l)+'</div>'+(l.note?'<div class="tl-meta">'+esc(l.note)+'</div>':'')+'</div>').join('')+'</div>';}

  if(mlogs.length){
    const sessLbl={full:'يوم كامل',am:'صباحي',pm:'مسائي'};
    body+='<div class="form-divider">آخر سجلات الحليب</div><div class="tbl-wrap" style="margin-top:8px"><table class="tbl"><thead><tr><th>التاريخ</th><th>الفترة</th><th>الكمية</th></tr></thead><tbody>'+
      mlogs.slice(0,8).map(l=>'<tr><td>'+l.date+'</td><td><span class="tag tag-gray">'+(sessLbl[l.session]||'يوم كامل')+'</span></td><td class="amt">'+fN(l.qtys[cowId])+' ك</td></tr>').join('')+
    '</tbody></table></div>';
  }

  document.getElementById('ad-body').innerHTML=body;
  document.getElementById('ad-footer').innerHTML=
    '<button class="btn btn-outline" onclick="closeModal(\'m-animaldetail\')">إغلاق</button>'+
    '<button class="btn btn-danger" onclick="deleteAnimal('+c.id+')"><i class="fas fa-trash"></i> حذف نهائي</button>'+
    '<button class="btn btn-primary" onclick="closeModal(\'m-animaldetail\');openAddAnimalModal('+c.id+')"><i class="fas fa-pen"></i> تعديل</button>';
  openModal('m-animaldetail');
}

// ═══════════════════════════════════════════════════════
//  SELECT POPULATION HELPERS
// ═══════════════════════════════════════════════════════
function populateAnimalSels(){
  const all=(S.cattle||[]).filter(c=>!isOut(c));
  const opts=all.map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join('');
  const femOpts=all.filter(c=>isActiveFemale(c)).map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join('');
  ['hl-animal','sc-cow'].forEach(id=>{const e=document.getElementById(id);if(e)e.innerHTML=opts;});
  ['in-cow','br-cow','pc-cow','hp-cow'].forEach(id=>{const e=document.getElementById(id);if(e)e.innerHTML=femOpts;});
  const mo=document.getElementById('a-mother');if(mo)mo.innerHTML='<option value="">اختر الأم (إن وُجدت)</option>'+femOpts;
}

// ═══════════════════════════════════════════════════════
//  RATION CALCULATOR (حاسبة الأعلاف)
// ═══════════════════════════════════════════════════════
function renderRationPage(wrap){
  wrap.innerHTML=
    '<div class="card" style="max-width:800px;margin:0 auto">'+
      '<div class="card-header"><div class="card-title"><i class="fas fa-scale-balanced"></i> حاسبة الأعلاف المبسطة للقطيع</div></div>'+
      '<div class="card-body">'+
        '<p style="color:var(--txt4);font-size:14px;margin-bottom:20px">تساعدك الحاسبة في تقدير كمية العلف المركز (بالكيلو جرام) المطلوب تقديمها للبقرة بناءً على إنتاجها من الحليب ووزنها التقريبي.</p>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'+
          '<div class="fg">'+
            '<label>متوسط وزن البقرة الحلوب (كجم)</label>'+
            '<input type="number" id="rat-weight" placeholder="مثال: 550" value="550">'+
          '</div>'+
          '<div class="fg">'+
            '<label>الإنتاج اليومي من الحليب للرأس (كجم)</label>'+
            '<input type="number" id="rat-milk" placeholder="مثال: 20">'+
          '</div>'+
        '</div>'+
        '<button class="btn btn-primary" style="width:100%;margin-top:10px" onclick="calculateRation()">احسب الاحتياج التقريبي</button>'+
        '<div id="rat-result" style="margin-top:20px;display:none" class="alert alert-info"></div>'+
      '</div>'+
    '</div>';
}

function calculateRation(){
  const w = Number(document.getElementById('rat-weight').value||0);
  const m = Number(document.getElementById('rat-milk').value||0);
  const res = document.getElementById('rat-result');
  
  if(!w || !m){ toast('يرجى إدخال الوزن والإنتاج'); return; }
  
  // Simplified maintenance requirement: 1% of body weight for dry matter from concentrate
  // For milk production: approx 0.4 kg of concentrate per 1 kg of milk
  const maintenance = w * 0.01;
  const production = m * 0.4;
  const totalCon = maintenance + production;
  const roughage = w * 0.02; // Roughly 2% body weight for roughage dry matter
  
  res.style.display = 'block';
  res.innerHTML =
    '<div style="font-size:16px;font-weight:bold;margin-bottom:10px;text-align:center">الاحتياجات اليومية التقديرية (للرأس الواحدة)</div>'+
    '<ul style="padding-right:20px;line-height:2">'+
      '<li>العلف المركز (حبوب/مكعبات): <strong>'+totalCon.toFixed(1)+' كجم</strong> '+
      '<span style="color:var(--txt4);font-size:12px">(منها '+maintenance.toFixed(1)+' لحفظ الحياة + '+production.toFixed(1)+' لإنتاج اللبن)</span></li>'+
      '<li>العلف الماليء (دريس/سيلاج) المادة الجافة: حوالي <strong>'+roughage.toFixed(1)+' كجم</strong></li>'+
      '<li>المياه النظيفة: <strong>حوالي '+(m*3 + 40).toFixed(0)+' لتر</strong></li>'+
    '</ul>'+
    '<div style="font-size:12px;color:var(--txt4);margin-top:10px">* ملاحظة: هذه تقديرات استرشادية عامة وتختلف حسب جودة العلف ونسبة البروتين وظروف الطقس وصحة الحيوان.</div>';
}
