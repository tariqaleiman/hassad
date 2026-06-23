// ═══════════════════════════════════════════════════════
//  حصاد — REPRODUCTION MODULE (insem, heat programs, preg checks, births)
// ═══════════════════════════════════════════════════════

function renderReproPage(wrap){
  document.getElementById('topbar-actions').innerHTML=
    '<button class="btn btn-outline" onclick="openHeatProgModal()"><i class="fas fa-flask"></i> برنامج صراف</button>'+
    '<button class="btn btn-outline" onclick="openPregCheckModal()"><i class="fas fa-search"></i> كشف حمل</button>'+
    '<button class="btn btn-primary" onclick="openInsemModal()"><i class="fas fa-plus"></i> تلقيح جديد</button>';
  const insems=[...(S.insems||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const progs=[...(S.heatPrograms||[])].sort((a,b)=>b.start.localeCompare(a.start));
  const checks=[...(S.pregChecks||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const pregnant=(S.cattle||[]).filter(c=>isActiveFemale(c)&&c.pregnant);

  wrap.innerHTML=
    '<div class="kpi-grid">'+
      kpiCard('أبقار حوامل',pregnant.length,'fa-baby','gold')+
      kpiCard('إجمالي التلقيحات',insems.length,'fa-dna','blue')+
      kpiCard('برامج الصراف',progs.length,'fa-flask','')+
      kpiCard('تكلفة التلقيح والصراف',fMoney(insems.reduce((s,i)=>s+Number(i.cost||0),0)+progs.reduce((s,p)=>s+Number(p.cost||0),0)),'fa-coins','red')+
    '</div>'+
    (pregnant.length?'<div class="card" style="margin-bottom:16px"><div class="card-header"><div class="card-title">الأبقار الحوامل</div></div><div class="card-body p0">'+
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>البقرة</th><th>شهر الحمل</th><th>موعد الولادة المتوقع</th><th>الأيام المتبقية</th><th>الحالة الإنتاجية</th><th></th></tr></thead><tbody>'+
      pregnant.map(c=>{
          const left=c.dueDate?dBetween(TODAY,c.dueDate):null;
          const dynMonths=c.dueDate?Math.max(1,Math.round(9 - left/30.4)):c.pregMonths;
          return '<tr><td style="font-weight:700">'+esc(c.name)+'</td><td>'+(dynMonths||'—')+'</td><td>'+(c.dueDate||'—')+'</td>'+
          '<td><span class="tag '+(left!==null&&left<=7?'tag-red':left!==null&&left<=DRY_PERIOD_DAYS?'tag-gold':'tag-green')+'">'+(left!==null?(left>=0?left+' يوم':'تأخر'):'—')+'</span></td>'+
          '<td>'+(c.milkStatus==='lactating'?'<span class="tag tag-green">حلوب</span>':'<span class="tag tag-gray">جافة</span>')+'</td>'+
          '<td><button class="btn btn-sm btn-outline" onclick="openBirthForCow('+c.id+')"><i class="fas fa-baby"></i> تسجيل ولادة</button></td></tr>';
      }).join('')+'</tbody></table></div></div></div>':'') +
    (progs.length?'<div class="card" style="margin-bottom:16px"><div class="card-header"><div class="card-title">برامج الصراف / الشبق الصناعي</div></div><div class="card-body p0">'+
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>البقرة</th><th>نوع البرنامج</th><th>تاريخ البدء</th><th>التكلفة</th><th>الحالة</th><th></th></tr></thead><tbody>'+
      progs.map(p=>{
        const cow=(S.cattle||[]).find(c=>c.id===p.cowId);
        const linked=insems.find(i=>i.heatProgId===p.id);
        return '<tr><td>'+(cow?esc(cow.name):'—')+'</td><td><span class="tag tag-blue">'+p.type+'</span></td>'+
          '<td>'+p.start+'</td><td>'+fMoney(p.cost)+'</td>'+
          '<td>'+(linked?'<span class="tag tag-green">تم التلقيح</span>':'<span class="tag tag-gold">جاري</span>')+'</td>'+
          '<td><button class="btn-icon danger" onclick="deleteHeatProg('+p.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></td></tr>';
      }).join('')+'</tbody></table></div></div></div>':'') +
    '<div class="card"><div class="card-header"><div class="card-title">سجل التلقيحات</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>البقرة</th><th>النوع</th><th>الثور/الجرعة</th><th>التكلفة</th><th>نتيجة الكشف</th><th></th></tr></thead>'+
    '<tbody>'+(insems.length?insems.map(i=>{
      const cow=(S.cattle||[]).find(c=>c.id===i.cowId);
      const chk=checks.find(p=>p.insemId===i.id);
      let statusHtml = '';
      if(chk){
        statusHtml = chk.result==='positive'?'<span class="tag tag-green">✓ حامل</span>':'<span class="tag tag-red">✗ فاشل</span>';
      } else {
        const days = Math.floor((new Date(TODAY) - new Date(i.date))/(1000*60*60*24));
        const checkNeeded = days >= 21;
        statusHtml = '<span class="tag '+(checkNeeded?'tag-red':'tag-gold')+'">'+(checkNeeded?'مطلوب فحص (مر '+days+' يوم)':'انتظار كشف (مر '+days+' يوم)')+'</span>';
      }
      return '<tr><td>'+i.date+'</td><td>'+(cow?esc(cow.name):'—')+'</td>'+
        '<td><span class="tag tag-blue">'+i.type+'</span></td>'+
        '<td>'+(i.bull||'—')+'</td><td>'+fMoney(i.cost)+'</td>'+
        '<td>'+statusHtml+'</td>'+
        '<td><button class="btn-icon danger" onclick="deleteInsem('+i.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></td></tr>';
    }).join(''):'<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--txt4)">لا توجد تلقيحات</td></tr>')+
    '</tbody></table></div></div>';
}

// ---------- Insemination ----------
function openInsemModal(){
  populateAnimalSels();populateHeatProgSel();
  document.getElementById('in-edit').value='';
  document.getElementById('in-date').value=TODAY;
  ['in-bull','in-cost','in-vet','in-notes'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  document.getElementById('in-heatprog').value='';
  const d=addDays(TODAY,25);document.getElementById('in-checkdate').value=d;
  openModal('m-insem');
}
function openInsemForCow(cowId){openInsemModal();setTimeout(()=>{const e=document.getElementById('in-cow');if(e)e.value=cowId;},10);}
function populateHeatProgSel(){
  const progs=(S.heatPrograms||[]).map(p=>{const c=(S.cattle||[]).find(x=>x.id===p.cowId);return '<option value="'+p.id+'">'+(c?esc(c.name):'')+' — '+p.type+' ('+p.start+')</option>';}).join('');
  const hp=document.getElementById('in-heatprog');if(hp)hp.innerHTML='<option value="">لا — تلقيح مباشر</option>'+progs;
}
function saveInsem(){
  const cowId=Number(document.getElementById('in-cow').value),date=document.getElementById('in-date').value;
  if(!cowId||!date){toast('⚠ اختر البقرة والتاريخ');return;}
  S.insems=S.insems||[];
  S.insems.push({id:uid(),cowId,date,type:document.getElementById('in-type').value,bull:document.getElementById('in-bull').value.trim(),vet:document.getElementById('in-vet').value.trim(),cost:parseFloat(document.getElementById('in-cost').value)||0,heatProgId:Number(document.getElementById('in-heatprog').value)||null,checkDate:document.getElementById('in-checkdate').value,notes:document.getElementById('in-notes').value.trim()});
  schedSave();closeModal('m-insem');renderPage(currentPage);toast('تم تسجيل التلقيح');
}
function deleteInsem(id){
  confirmAction('حذف سجل التلقيح هذا؟ (لن يحذف كشوفات الحمل المرتبطة، تأكد من مراجعتها)',()=>{
    S.insems=(S.insems||[]).filter(i=>i.id!==id);schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}

// ---------- Heat program ----------
function openHeatProgModal(){
  populateAnimalSels();
  document.getElementById('hp-start').value=TODAY;
  ['hp-vet','hp-cost','hp-notes','hp-step0','hp-step1','hp-step2'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  document.getElementById('hp-step0-date').value=TODAY;
  document.getElementById('hp-step1-date').value=addDays(TODAY,7);
  document.getElementById('hp-step2-date').value=addDays(TODAY,9);
  openModal('m-heatprog');
}
function saveHeatProg(){
  const cowId=Number(document.getElementById('hp-cow').value),start=document.getElementById('hp-start').value;
  if(!cowId||!start){toast('⚠ اختر البقرة والتاريخ');return;}
  S.heatPrograms=S.heatPrograms||[];
  S.heatPrograms.push({id:uid(),cowId,start,type:document.getElementById('hp-type').value,vet:document.getElementById('hp-vet').value.trim(),cost:parseFloat(document.getElementById('hp-cost').value)||0,steps:[{desc:document.getElementById('hp-step0').value,date:document.getElementById('hp-step0-date').value},{desc:document.getElementById('hp-step1').value,date:document.getElementById('hp-step1-date').value},{desc:document.getElementById('hp-step2').value,date:document.getElementById('hp-step2-date').value}],notes:document.getElementById('hp-notes').value.trim()});
  schedSave();closeModal('m-heatprog');renderPage(currentPage);toast('تم حفظ البرنامج');
}
function deleteHeatProg(id){
  confirmAction('حذف برنامج الصراف هذا؟',()=>{
    S.heatPrograms=(S.heatPrograms||[]).filter(p=>p.id!==id);schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}

// ---------- Pregnancy check ----------
function openPregCheckModal(){
  populateAnimalSels();
  document.getElementById('pc-date').value=TODAY;
  ['pc-vet','pc-cost','pc-notes','pc-month','pc-due'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  document.getElementById('pc-result').value='positive';
  togglePregResult();
  loadCowInsems();
  openModal('m-pregcheck');
}
function loadCowInsems(){
  const cowId=Number(document.getElementById('pc-cow')?.value);
  const ins=(S.insems||[]).filter(i=>i.cowId===cowId).sort((a,b)=>b.date.localeCompare(a.date));
  const el=document.getElementById('pc-insem');
  if(el)el.innerHTML='<option value="">بدون ربط بتلقيح محدد</option>'+ins.map(i=>'<option value="'+i.id+'">'+i.date+' — '+i.type+(i.bull?' ('+i.bull+')':'')+'</option>').join('');
}
function togglePregResult(){document.getElementById('pc-positive-fields').style.display=document.getElementById('pc-result').value==='positive'?'block':'none';}
function calcPregDue(){
  const m=parseFloat(document.getElementById('pc-month').value)||0;
  const date=document.getElementById('pc-date').value||TODAY;
  if(m>0) document.getElementById('pc-due').value=addDays(date,Math.max(0,Math.round(GESTATION_DAYS-m*30.4)));
}
function savePregCheck(){
  const cowId=Number(document.getElementById('pc-cow').value),date=document.getElementById('pc-date').value,result=document.getElementById('pc-result').value;
  if(!cowId||!date){toast('⚠ اختر البقرة والتاريخ');return;}
  const month=parseFloat(document.getElementById('pc-month').value)||null;
  const dueDate=document.getElementById('pc-due').value||null;
  S.pregChecks=S.pregChecks||[];
  S.pregChecks.push({id:uid(),cowId,date,insemId:Number(document.getElementById('pc-insem').value)||null,result,month,dueDate,vet:document.getElementById('pc-vet').value.trim(),cost:parseFloat(document.getElementById('pc-cost').value)||0,notes:document.getElementById('pc-notes').value.trim()});
  const cow=(S.cattle||[]).find(c=>c.id===cowId);
  if(cow){
    const wasPreg=cow.pregnant;
    if(result==='positive'){
      cow.pregnant=true;cow.pregMonths=month||cow.pregMonths;cow.dueDate=dueDate||cow.dueDate;
      cow.statusLog=(cow.statusLog||[]).concat([{date,field:'pregnant',from:wasPreg?'yes':'no',to:'yes',note:'كشف حمل إيجابي'+(month?' — شهر '+month:'')}]);
    } else {
      cow.pregnant=false;cow.pregMonths=null;cow.dueDate=null;
      cow.statusLog=(cow.statusLog||[]).concat([{date,field:'pregnant',from:wasPreg?'yes':'no',to:'no',note:'كشف حمل سلبي'}]);
    }
  }
  schedSave();closeModal('m-pregcheck');renderPage(currentPage);toast(result==='positive'?'مبروك! البقرة حامل 🐮':'تم التسجيل');
}

// ═══════════════════════════════════════════════════════
//  BIRTHS — with ownership inheritance fix (section 5 of spec)
// ═══════════════════════════════════════════════════════
function openBirthForCow(cowId){
  populateAnimalSels();
  document.getElementById('br-date').value=TODAY;
  ['br-name','br-weight','br-cost','br-vet','br-notes'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  document.getElementById('br-gender').value='female';
  document.getElementById('br-fate').value='keep_female';
  setTimeout(()=>{
    const e=document.getElementById('br-cow');if(e)e.value=cowId;
    refreshCalfOwnershipPreview();
  },10);
  openModal('m-birth');
}
// Re-render the calf ownership editor based on the selected mother's birthShares.
// This is the FIX for section 5: never default to a hardcoded percentage —
// always derive from the mother's defined "نصيب المواليد" (birthShares), shown
// explicitly and editable so the user can confirm/adjust before saving.
function refreshCalfOwnershipPreview(){
  const cowId=Number(document.getElementById('br-cow').value);
  const cow=(S.cattle||[]).find(c=>c.id===cowId);
  const shares=cow?cow.birthShares:[{partnerId:meId(),pct:100}];
  document.getElementById('br-own-wrap').innerHTML=shareEditorHTML('br-own',shares);
  const info=document.getElementById('br-own-info');
  if(info){
    if(cow && sharesSum(cow.birthShares)>0 && !sharesEqual(cow.birthShares,[{partnerId:meId(),pct:100}])){
      info.innerHTML='<i class="fas fa-circle-info"></i> تم احتساب نسبة ملكية المولود تلقائياً بناءً على "نصيب المواليد" المتفق عليه للأم ('+sharesText(cow.birthShares)+'). يمكنك تعديلها أدناه إذا لزم.';
    } else {
      info.innerHTML='<i class="fas fa-circle-info"></i> راجع نسبة ملكية المولود أدناه قبل الحفظ — لن يتم افتراض 100% تلقائياً.';
    }
  }
}
function saveBirth(){
  const cowId=Number(document.getElementById('br-cow').value),date=document.getElementById('br-date').value;
  if(!cowId||!date){toast('⚠ اختر البقرة والتاريخ');return;}
  if(!validateShareEditor('br-own','نسب ملكية المولود')) return;
  const gender=document.getElementById('br-gender').value,fate=document.getElementById('br-fate').value;
  const calfName=document.getElementById('br-name').value.trim()||('مولود '+date);
  const cow=(S.cattle||[]).find(c=>c.id===cowId);
  const calfOwners=readShareEditor('br-own');
  const calfStatusLifecycle=fate==='fatten_male'?'fattening':'calf';
  const calfGender=gender==='female'?'calf_f':'calf_m';
  const calf={id:uid(),name:calfName,gender:calfGender,
    lifecycle:calfStatusLifecycle, milkStatus:null, pregnant:false, pregMonths:null, dueDate:null,
    source:'born',buyDate:'',buyPrice:0,seller:'',
    birthDate:date,dob:date,motherId:cowId,
    owners:calfOwners, saleShares:JSON.parse(JSON.stringify(calfOwners)), birthShares:JSON.parse(JSON.stringify(calfOwners)),
    breed:cow?cow.breed||'':'',notes:'',
    statusLog:[{date,field:'created',from:null,to:calfStatusLifecycle,note:'مولود من '+(cow?cow.name:'—')}],
    createdAt:date};
  S.cattle=S.cattle||[];S.cattle.push(calf);
  S.births=S.births||[];
  S.births.push({id:uid(),cowId,date,gender,fate,calfName,calfId:calf.id,weight:parseFloat(document.getElementById('br-weight').value)||0,birthType:document.getElementById('br-type').value,cost:parseFloat(document.getElementById('br-cost').value)||0,vet:document.getElementById('br-vet').value.trim(),notes:document.getElementById('br-notes').value.trim(),calfOwners:JSON.parse(JSON.stringify(calfOwners))});
  if(cow){
    const wasPreg=cow.pregnant, wasMilk=cow.milkStatus;
    cow.pregnant=false;cow.pregMonths=null;cow.dueDate=null;
    cow.milkStatus='lactating';
    const logs=[];
    if(wasPreg) logs.push({date,field:'pregnant',from:'yes',to:'no',note:'ولادة'});
    if(wasMilk!=='lactating') logs.push({date,field:'milkStatus',from:wasMilk,to:'lactating',note:'بدء موسم حليب جديد بعد الولادة'});
    cow.statusLog=(cow.statusLog||[]).concat(logs);
  }
  schedSave();closeModal('m-birth');renderPage(currentPage);toast('تم تسجيل الولادة — المولود أضيف للقطيع بنسبة ملكية '+sharesText(calfOwners));
}
