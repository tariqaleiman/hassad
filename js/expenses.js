// ═══════════════════════════════════════════════════════
//  حصاد — EXPENSES MODULE (مستقل عن العمليات، بربط اختياري)
// ═══════════════════════════════════════════════════════
const EXPENSE_CATEGORIES={
  feed:'أعلاف', health:'صحة وبيطرة', repro:'تلقيح وتناسل',
  cropops:'عمليات زراعية', labor:'أجور عمالة', inputs:'مدخلات (أسمدة/مبيدات)',
  maintenance:'صيانة ووقود', cattlepurchase:'شراء حيوانات', transport:'نقل وتجهيز', other:'أخرى'
};
const EXPENSE_LINK_LABELS={none:'بدون ربط',crop:'محصول',cropop:'عملية زراعية',cattle:'حيوان'};

function renderExpensesTab(){
  const expenses=[...(S.expenses||[])].sort((a,b)=>b.date.localeCompare(a.date));
  const total=expenses.reduce((s,e)=>s+Number(e.amount||0),0);
  const thisWeek=expenses.filter(e=>dBetween(e.date,TODAY)<=7&&dBetween(e.date,TODAY)>=0).reduce((s,e)=>s+Number(e.amount||0),0);
  const byCategory={};
  expenses.forEach(e=>{byCategory[e.category]=(byCategory[e.category]||0)+Number(e.amount||0);});

  return '<div class="kpi-grid">'+
      kpiCard('إجمالي المصروفات',fMoney(total),'fa-receipt','red')+
      kpiCard('هذا الأسبوع',fMoney(thisWeek),'fa-calendar-week','gold')+
      kpiCard('عدد السجلات',expenses.length,'fa-list','')+
    '</div>'+
    '<div class="card" style="margin-bottom:16px"><div class="card-header"><div class="card-title">المصروفات حسب التصنيف</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التصنيف</th><th>الإجمالي</th></tr></thead><tbody>'+
    Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).map(([k,v])=>'<tr><td style="font-weight:700">'+(EXPENSE_CATEGORIES[k]||k)+'</td><td class="amt-red">'+fMoney(v)+'</td></tr>').join('')+
    (!Object.keys(byCategory).length?'<tr><td colspan="2" style="text-align:center;padding:20px;color:var(--txt4)">لا توجد مصروفات</td></tr>':'')+
    '</tbody></table></div></div></div>'+
    '<div class="card"><div class="card-header"><div class="card-title">سجل المصروفات الكامل</div></div><div class="card-body p0">'+
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>التصنيف</th><th>حساب</th><th>المبلغ</th><th>مرتبط بـ</th><th>المورد</th><th>طريقة الدفع</th><th>ملاحظات</th><th></th></tr></thead><tbody>'+
    (expenses.length?expenses.map(e=>{
      let linkText='—';
      if(e.linkType==='crop'){const c=(S.crops||[]).find(x=>x.id===e.linkId);linkText=c?'محصول: '+esc(c.name):'محصول محذوف';}
      else if(e.linkType==='cropop'){const o=(S.ops||[]).find(x=>x.id===e.linkId);const c=o?(S.crops||[]).find(x=>x.id===o.cropId):null;linkText=o?'عملية: '+opTypeLabel(o.type)+(c?' — '+esc(c.name):''):'عملية محذوفة';}
      else if(e.linkType==='cattle'){const cw=(S.cattle||[]).find(x=>x.id===e.linkId);linkText=cw?'حيوان: '+esc(cw.name):'حيوان محذوف';}
      return '<tr><td>'+e.date+'</td><td><span class="tag tag-blue">'+(EXPENSE_CATEGORIES[e.category]||e.category)+'</span></td>'+
        '<td><span class="tag tag-gray">'+(e.accountCode||guessExpenseAccount(e.category))+' — '+accountName(e.accountCode||guessExpenseAccount(e.category))+'</span></td>'+
        '<td class="amt-red">'+fMoney(e.amount)+'</td><td>'+linkText+'</td>'+
        '<td>'+esc(e.vendor||'—')+'</td><td>'+(e.paytype==='credit'?'<span class="tag tag-gold">آجل</span>':'<span class="tag tag-green">نقدي</span>')+'</td>'+
        '<td>'+esc(e.notes||'—')+'</td>'+
        '<td><div style="display:flex;gap:4px"><button class="btn-icon" onclick="openExpenseModal('+e.id+')"><i class="fas fa-pen" style="font-size:11px"></i></button><button class="btn-icon danger" onclick="deleteExpense('+e.id+')"><i class="fas fa-trash" style="font-size:11px"></i></button></div></td></tr>';
    }).join(''):'<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--txt4)">لا توجد مصروفات مسجلة</td></tr>')+
    '</tbody></table></div></div></div>';
}

// ---------- Modal ----------
function openExpenseModal(editId,presetLink){
  const e=editId?(S.expenses||[]).find(x=>x.id===editId):null;
  document.getElementById('ex-edit-id').value=editId||'';
  document.getElementById('m-expense-title').textContent=e?'تعديل مصروف':'تسجيل مصروف جديد';
  document.getElementById('ex-date').value=e?e.date:TODAY;
  document.getElementById('ex-category').innerHTML=Object.entries(EXPENSE_CATEGORIES).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join('');
  document.getElementById('ex-category').value=e?e.category:(presetLink&&presetLink.category)||'other';
  document.getElementById('ex-amount').value=e?e.amount:'';
  document.getElementById('ex-vendor').value=e?(e.vendor||''):'';
  document.getElementById('ex-paytype').value=e?(e.paytype||'cash'):'cash';
  document.getElementById('ex-worker').value=e?(e.worker||''):'';
  document.getElementById('ex-notes').value=e?(e.notes||''):'';

  const linkType=e?e.linkType:(presetLink&&presetLink.linkType)||'none';
  document.getElementById('ex-linktype').value=linkType;
  populateExpenseLinkSel(linkType);
  setTimeout(()=>{
    const sel=document.getElementById('ex-linkid');
    if(sel) sel.value=e?(e.linkId||''):(presetLink&&presetLink.linkId)||'';
  },10);
  toggleExpenseLink();
  openModal('m-expense');
}
function toggleExpenseLink(){
  const lt=document.getElementById('ex-linktype').value;
  document.getElementById('ex-link-fg').style.display=lt==='none'?'none':'block';
  if(lt!=='none') populateExpenseLinkSel(lt);
}
function populateExpenseLinkSel(linkType){
  const sel=document.getElementById('ex-linkid');
  if(!sel) return;
  if(linkType==='crop'){
    sel.innerHTML=(S.crops||[]).map(c=>'<option value="'+c.id+'">'+esc(c.name)+' ('+c.type+')</option>').join('');
  } else if(linkType==='cropop'){
    sel.innerHTML=(S.ops||[]).map(o=>{const c=(S.crops||[]).find(x=>x.id===o.cropId);return '<option value="'+o.id+'">'+o.date+' — '+opTypeLabel(o.type)+(c?' — '+esc(c.name):'')+'</option>';}).join('');
  } else if(linkType==='cattle'){
    sel.innerHTML=(S.cattle||[]).filter(c=>!isOut(c)).map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join('');
  }
}
function saveExpense(){
  const date=document.getElementById('ex-date').value,amount=parseFloat(document.getElementById('ex-amount').value)||0;
  if(!date||amount<=0){toast('⚠ أدخل التاريخ والمبلغ');return;}
  const editId=document.getElementById('ex-edit-id').value;
  const category=document.getElementById('ex-category').value;
  const linkType=document.getElementById('ex-linktype').value;
  const linkId=linkType!=='none'?Number(document.getElementById('ex-linkid').value)||null:null;
  const data={date,amount,category,accountCode:guessExpenseAccount(category),
    linkType,linkId,vendor:document.getElementById('ex-vendor').value.trim(),
    paytype:document.getElementById('ex-paytype').value,worker:document.getElementById('ex-worker').value.trim(),
    notes:document.getElementById('ex-notes').value.trim()};
  if(editId){
    Object.assign((S.expenses||[]).find(x=>x.id===Number(editId)),data);
  } else {
    S.expenses=S.expenses||[];
    const ex=Object.assign({id:uid()},data);
    S.expenses.push(ex);
    if(data.paytype==='credit'){
      S.debts=S.debts||[];
      S.debts.push({id:uid(),vendor:data.vendor||'مورد',reason:(EXPENSE_CATEGORIES[category]||category),amount,remaining:amount,status:'open',date,refId:ex.id,refType:'expense'});
    }
  }
  schedSave();closeModal('m-expense');renderPage(currentPage);toast('تم حفظ المصروف');
}
function deleteExpense(id){
  confirmAction('حذف هذا المصروف؟',()=>{
    S.expenses=(S.expenses||[]).filter(e=>e.id!==id);
    schedSave();renderPage(currentPage);toast('تم الحذف');
  });
}

// ---------- Helpers used by other modules to query linked expenses ----------
function expensesForCrop(cropId){
  const direct=(S.expenses||[]).filter(e=>e.linkType==='crop'&&e.linkId===cropId);
  const opIds=(S.ops||[]).filter(o=>o.cropId===cropId).map(o=>o.id);
  const viaOps=(S.expenses||[]).filter(e=>e.linkType==='cropop'&&opIds.includes(e.linkId));
  return [...direct,...viaOps];
}
function expensesForCattle(cowId){
  return (S.expenses||[]).filter(e=>e.linkType==='cattle'&&e.linkId===cowId);
}
function totalExpensesForCrop(cropId){
  return expensesForCrop(cropId).reduce((s,e)=>s+Number(e.amount||0),0);
}
