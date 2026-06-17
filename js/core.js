// ═══════════════════════════════════════════════════════
//  حصاد — CORE: DATA MODEL, PERSISTENCE, SHARED HELPERS
// ═══════════════════════════════════════════════════════

// ---------- Default data model ----------
const DEFAULT_PARTNERS = [
  {id:1, name:'أنا (المستخدم)', isMe:true,  color:'#2E7D32'},
  {id:2, name:'الشريك',          isMe:false, color:'#1565C0'}
];

function emptyDB(){
  return {
    nid: 3,
    _syncTs: 0,
    partners: JSON.parse(JSON.stringify(DEFAULT_PARTNERS)),
    // Cattle & related
    cattle:[], milkLogs:[], fridays:[], healthLogs:[], insems:[], pregChecks:[],
    births:[], calfLogs:[], heatPrograms:[],
    // Crops & agricultural ops
    cropTypes: JSON.parse(JSON.stringify(DEFAULT_CROP_TYPES)),
    crops:[], ops:[], harvests:[], cuttings:[],
    // Inventory & feed
    feeds:[], inventoryItems:[], inventoryMoves:[], internalFeedUse:[],
    // Maintenance & byproducts
    maintenanceLogs:[], byproducts:[],
    // Expenses (separated from operations — section requested by user)
    expenses:[],
    // Accounting (chart of accounts + auto-generated journal entries)
    accounts: JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS)),
    journal:[],
    // Finance
    vendors:[], debts:[], payments:[]
  };
}

// ---------- Default, fully-editable crop type list (was a hardcoded enum before) ----------
const DEFAULT_CROP_TYPES=[
  'برسيم/علف','مرعى','قمح','شعير','ذرة شامية (لب)','ذرة شامية (لب سوبر)','ذرة رفيعة (دريس)',
  'أرز','قطن','فول صويا','فول بلدي','عدس','حمص','سمسم','كتان',
  'بطاطس','بطاطا','بصل','ثوم','طماطم','خس','كرنب','فلفل','باذنجان','كوسة','خيار','بامية',
  'بنجر السكر','قصب السكر','موالح','مانجو','عنب','نخيل','زيتون','أخرى'
];

// ---------- Default chart of accounts (شجرة الحسابات) ----------
// Standard farm-accounting structure: Assets / Liabilities / Equity / Revenue / Expenses
const DEFAULT_ACCOUNTS=[
  // ASSETS (1000s)
  {code:'1000',name:'الأصول',type:'asset',parent:null},
  {code:'1100',name:'النقدية والصندوق',type:'asset',parent:'1000'},
  {code:'1200',name:'المخزون',type:'asset',parent:'1000'},
  {code:'1210',name:'مخزون الأعلاف',type:'asset',parent:'1200'},
  {code:'1220',name:'مخزون المدخلات الزراعية',type:'asset',parent:'1200'},
  {code:'1300',name:'الأصول الحيوانية (القطيع)',type:'asset',parent:'1000'},
  {code:'1400',name:'الأصول الزراعية (المحاصيل تحت الزراعة)',type:'asset',parent:'1000'},
  {code:'1500',name:'المعدات والآلات',type:'asset',parent:'1000'},
  // LIABILITIES (2000s)
  {code:'2000',name:'الالتزامات (الديون)',type:'liability',parent:null},
  {code:'2100',name:'ديون الموردين',type:'liability',parent:'2000'},
  // EQUITY (3000s) — partner capital accounts created dynamically per partner
  {code:'3000',name:'حقوق الشركاء',type:'equity',parent:null},
  // REVENUE (4000s)
  {code:'4000',name:'الإيرادات',type:'revenue',parent:null},
  {code:'4100',name:'إيراد الحليب',type:'revenue',parent:'4000'},
  {code:'4200',name:'إيراد بيع الحيوانات',type:'revenue',parent:'4000'},
  {code:'4300',name:'إيراد بيع المحاصيل',type:'revenue',parent:'4000'},
  {code:'4400',name:'إيراد بيع الحشات والعلف',type:'revenue',parent:'4000'},
  {code:'4500',name:'إيراد بيع المخلفات الزراعية',type:'revenue',parent:'4000'},
  // EXPENSES (5000s)
  {code:'5000',name:'المصروفات',type:'expense',parent:null},
  {code:'5100',name:'مصروفات الأعلاف',type:'expense',parent:'5000'},
  {code:'5200',name:'مصروفات الصحة والبيطرة',type:'expense',parent:'5000'},
  {code:'5300',name:'مصروفات التلقيح والتناسل',type:'expense',parent:'5000'},
  {code:'5400',name:'مصروفات العمليات الزراعية',type:'expense',parent:'5000'},
  {code:'5410',name:'مصروفات أجور العمالة',type:'expense',parent:'5400'},
  {code:'5420',name:'مصروفات المبيدات والأسمدة',type:'expense',parent:'5400'},
  {code:'5500',name:'مصروفات الصيانة والوقود',type:'expense',parent:'5000'},
  {code:'5600',name:'مصروفات شراء حيوانات',type:'expense',parent:'5000'},
  {code:'5700',name:'مصروفات نقل وتجهيز',type:'expense',parent:'5000'},
  {code:'5900',name:'مصروفات أخرى',type:'expense',parent:'5000'},
];

const API='/api/db';
const LS_KEY='hassad_v6';
const LS_BACKUP_KEY='hassad_v6_backup';
let S = emptyDB();
let saveTimer=null;

async function loadDB(){
  // 1) Show something instantly from localStorage cache (if any) while Firebase loads
  let hadLocalCache=false;
  try{
    const r=localStorage.getItem(LS_KEY);
    if(r){ Object.assign(S, JSON.parse(r)); hadLocalCache=true; }
  }catch(e2){
    try{
      const b=localStorage.getItem(LS_BACKUP_KEY);
      if(b){ Object.assign(S, JSON.parse(b)); hadLocalCache=true; }
    }catch(e3){}
  }

  // 2) Try Firebase as the source of truth
  const fbOk = initFirebase();
  if(fbOk){
    try{
      const remote = await fbLoadOnce();
      if(remote && Object.keys(remote).length){
        // Merge: if local cache is newer than what's on Firebase (rare, e.g. wrote offline), prefer the newer _syncTs
        const localTs = S._syncTs||0, remoteTs = remote._syncTs||0;
        if(remoteTs>=localTs){ S = Object.assign(emptyDB(), remote); }
        // else: keep local (it's newer); next save will push it up to Firebase
      } else if(hadLocalCache){
        // Firebase is empty but we have local data (first-time migration) — push it up
        S._syncTs = Date.now();
        await fbPush(S);
      }
      fbListenLive();
      setStatus('ok');
    }catch(e){
      console.error('Firebase load failed, using local cache:',e);
      setStatus('offline');
    }
  } else {
    // No Firebase available — try legacy local server API as secondary fallback
    try{
      const r=await fetch(API);
      if(r.ok){
        const d=await r.json();
        if(d && Object.keys(d).length) Object.assign(S,d);
      }
    }catch(e){ /* ignore — we already have local cache or empty defaults */ }
    setStatus(hadLocalCache?'offline':'offline');
  }
  migrateData();
}

function schedSave(){
  setStatus('saving');
  clearTimeout(saveTimer);
  saveTimer=setTimeout(doSave,700);
}
async function doSave(){
  S._syncTs = Date.now();
  const data=JSON.stringify(S);
  // Always cache locally first — instant, never fails, protects against any network issue
  try{
    const prev=localStorage.getItem(LS_KEY);
    if(prev) localStorage.setItem(LS_BACKUP_KEY,prev);
    localStorage.setItem(LS_KEY,data);
  }catch(e2){}

  // Push to Firebase (primary persistent store)
  let firebaseOk=false;
  if(fbReady){
    firebaseOk = await fbPush(S);
  }
  if(firebaseOk){ setStatus('ok'); return; }

  // Fallback: legacy local server, if running
  try{
    const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:data});
    setStatus(r.ok?'ok':(fbReady?'error':'offline'));
  }catch(e){
    setStatus(fbReady?'error':'offline');
  }
}
function setStatus(st){
  const dot=document.getElementById('status-dot'),txt=document.getElementById('status-txt');if(!dot)return;
  const map={ok:['#4CAF50','محفوظ'],saving:['var(--gold)','جاري الحفظ...'],offline:['#78909C','محفوظ محلياً'],error:['var(--red)','خطأ في الحفظ']};
  const[c,t]=map[st]||['#4CAF50','متصل'];
  dot.style.background=c;txt.textContent=t;
}

// ---------- Migration from older data shapes ----------
function migrateData(){
  // ensure arrays exist
  Object.keys(emptyDB()).forEach(k=>{ if(S[k]===undefined) S[k]= Array.isArray(emptyDB()[k]) ? [] : emptyDB()[k]; });
  if(!S.partners || !S.partners.length) S.partners = JSON.parse(JSON.stringify(DEFAULT_PARTNERS));

  (S.cattle||[]).forEach(c=>{
    // ---- Data integrity repair: never let a malformed record crash rendering ----
    if(!c.gender) c.gender='female';
    if(!c.lifecycle) c.lifecycle='active';
    if(c.name==null||c.name==='') c.name='بدون اسم #'+c.id;
    if(c.milkStatus===undefined) c.milkStatus = c.gender==='female'&&c.lifecycle==='active' ? 'dry' : null;
    if(c.pregnant===undefined) c.pregnant=false;
    if(c.pregMonths===undefined) c.pregMonths=null;
    if(c.dueDate===undefined) c.dueDate=null;
    if(!c.owners){
      const pct = c.ownershipPct!=null ? Number(c.ownershipPct) : 100;
      c.owners = pct>=100 ? [{partnerId:1,pct:100}] : [{partnerId:1,pct:pct},{partnerId:2,pct:100-pct}].filter(s=>s.pct>0);
      if(!c.owners.length) c.owners=[{partnerId:1,pct:100}];
    }
    if(!c.saleShares){
      if(c.profitCowPct!=null){
        const pct=Number(c.profitCowPct);
        c.saleShares = pct>=100 ? [{partnerId:1,pct:100}] : [{partnerId:1,pct:pct},{partnerId:2,pct:100-pct}].filter(s=>s.pct>0);
      } else c.saleShares = JSON.parse(JSON.stringify(c.owners));
      if(!c.saleShares.length) c.saleShares=[{partnerId:1,pct:100}];
    }
    if(!c.birthShares){
      if(c.profitCalfPct!=null){
        const pct=Number(c.profitCalfPct);
        c.birthShares = pct>=100 ? [{partnerId:1,pct:100}] : [{partnerId:1,pct:pct},{partnerId:2,pct:100-pct}].filter(s=>s.pct>0);
      } else c.birthShares = JSON.parse(JSON.stringify(c.owners));
      if(!c.birthShares.length) c.birthShares=[{partnerId:1,pct:100}];
    }
    if(!c.statusLog) c.statusLog=[];
    if(c.sellSplits===undefined) c.sellSplits=null;
  });
  (S.milkLogs||[]).forEach(l=>{ if(!l.session) l.session='full'; });
  (S.crops||[]).forEach(c=>{ if(!c.stageLog) c.stageLog=[]; });
  (S.ops||[]).forEach(o=>{ if(o.qty===undefined) o.qty=null; if(o.opUnit===undefined) o.opUnit=''; if(o.worker===undefined) o.worker=''; });

  // ---- Crop types: merge any custom types already in use into the editable list (never lose a type a user already has) ----
  if(!S.cropTypes||!S.cropTypes.length) S.cropTypes=JSON.parse(JSON.stringify(DEFAULT_CROP_TYPES));
  (S.crops||[]).forEach(c=>{ if(c.type && !S.cropTypes.includes(c.type)) S.cropTypes.push(c.type); });

  // ---- Chart of accounts: merge defaults in (additive only, never remove existing custom accounts) ----
  if(!S.accounts||!S.accounts.length) S.accounts=JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS));
  else {
    const existingCodes=new Set(S.accounts.map(a=>a.code));
    DEFAULT_ACCOUNTS.forEach(a=>{ if(!existingCodes.has(a.code)) S.accounts.push(JSON.parse(JSON.stringify(a))); });
  }
  // Ensure every partner has an equity account
  (S.partners||[]).forEach(p=>{
    const code='3'+String(p.id).padStart(3,'0');
    if(!S.accounts.find(a=>a.code===code)) S.accounts.push({code,name:'حساب رأس مال — '+p.name,type:'equity',parent:'3000',partnerId:p.id});
  });

  // ---- Expenses: ensure structure exists ----
  if(!S.expenses) S.expenses=[];
  (S.expenses||[]).forEach(e=>{
    if(e.linkType===undefined) e.linkType='none'; // 'none' | 'crop' | 'cropop' | 'cattle'
    if(e.linkId===undefined) e.linkId=null;
    if(e.accountCode===undefined) e.accountCode=guessExpenseAccount(e.category);
    if(e.paytype===undefined) e.paytype='cash';
  });

  // ---- Migrate legacy crop-op embedded costs into separate Expenses records (additive, originals untouched) ----
  // Only run once: mark migrated ops so we never duplicate on subsequent loads.
  (S.ops||[]).forEach(o=>{
    if(o.hasCost && Number(o.cost)>0 && !o._migratedToExpense){
      S.expenses.push({
        id:uid(), date:o.date, amount:Number(o.cost), category:opExpenseCategory(o.type),
        accountCode:guessExpenseAccount(opExpenseCategory(o.type)),
        linkType:'cropop', linkId:o.id, vendor:o.vendor||'', paytype:o.paytype||'cash',
        notes:'مرحّل تلقائياً من عملية: '+opTypeLabel(o.type), worker:o.worker||''
      });
      o._migratedToExpense=true;
    }
  });

  // ---- Journal: ensure structure exists ----
  if(!S.journal) S.journal=[];

  if(!S._syncTs) S._syncTs=Date.now();
}
// Best-guess mapping from an operation type to an expense category (used during one-time migration)
function opExpenseCategory(opType){
  const map={plow:'cropops',prep:'cropops',sow:'cropops',transplant:'cropops',weed:'cropops',harvest:'cropops',irrigate:'cropops',labor:'labor',fertilize:'inputs',spray:'inputs',other:'other'};
  return map[opType]||'other';
}
function guessExpenseAccount(category){
  const map={feed:'5100',health:'5200',repro:'5300',cropops:'5400',labor:'5410',inputs:'5420',maintenance:'5500',cattlepurchase:'5600',transport:'5700',other:'5900'};
  return map[category]||'5900';
}

// ---------- Manual backup export / import (extra safety net) ----------
function exportBackup(){
  const data=JSON.stringify(S,null,2);
  const blob=new Blob([data],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='hassad_backup_'+TODAY+'.json';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('تم تنزيل نسخة احتياطية');
}
function importBackupFile(input){
  const file=input.files&&input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const data=JSON.parse(e.target.result);
      confirmAction('استيراد هذه النسخة الاحتياطية سيستبدل كل البيانات الحالية. هل أنت متأكد؟',()=>{
        Object.assign(S,data);
        migrateData();
        schedSave();
        renderPage(currentPage);
        toast('تم استيراد النسخة الاحتياطية بنجاح');
      });
    }catch(err){
      toast('⚠ ملف غير صالح — تأكد أنه ملف نسخة احتياطية صحيح من حصاد');
    }
  };
  reader.readAsText(file);
  input.value='';
}
const TODAY=new Date().toISOString().split('T')[0];
function uid(){return S.nid++;}
function fN(n){return Number(n||0).toLocaleString('ar-EG',{maximumFractionDigits:2});}
function fMoney(n){return fN(n)+' ج';}
function dBetween(d1,d2){return Math.round((new Date(d2)-new Date(d1))/86400000);}
function addDays(d,n){const dt=new Date(d);dt.setDate(dt.getDate()+n);return dt.toISOString().split('T')[0];}
function ageStr(dob){if(!dob)return'—';const m=Math.floor(dBetween(dob,TODAY)/30);if(m<1)return dBetween(dob,TODAY)+' يوم';return m<24?m+' شهر':Math.floor(m/12)+' سنة'+(m%12?' و'+(m%12)+' ش':'');}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

// ---------- Toast & Modal helpers ----------
let toastT;
function toast(msg,type=''){
  const el=document.getElementById('toast');el.textContent=msg;el.className='toast show'+(type?' toast-'+type:'');
  clearTimeout(toastT);toastT=setTimeout(()=>el.className='toast',2800);
}
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
function ovClick(e,id){if(e.target===document.getElementById(id))closeModal(id);}

// ---------- Confirm dialog (custom, non-blocking) ----------
let confirmCb=null;
function confirmAction(msg,cb){
  const box=document.getElementById('confirm-box');
  if(!box){ if(window.confirm(msg)) cb(); return; }
  document.getElementById('confirm-msg').textContent=msg;
  confirmCb=cb;
  openModal('m-confirm');
}
function confirmYes(){ closeModal('m-confirm'); const cb=confirmCb; confirmCb=null; if(cb) cb(); }

// ---------- Partners & Ownership Shares ----------
function partnerById(id){return (S.partners||[]).find(p=>p.id===Number(id));}
function partnerName(id){const p=partnerById(id);return p?p.name:'—';}
function meId(){const p=(S.partners||[]).find(x=>x.isMe);return p?p.id:(S.partners[0]?S.partners[0].id:1);}
function sharesSum(shares){return (shares||[]).reduce((s,x)=>s+Number(x.pct||0),0);}
function shareFor(shares,pid){const f=(shares||[]).find(x=>Number(x.partnerId)===Number(pid));return f?Number(f.pct):0;}
function splitAmount(total,shares){
  const map={};(S.partners||[]).forEach(p=>map[p.id]=Number(total||0)*shareFor(shares,p.id)/100);
  return map;
}
// Human readable summary e.g. "أنا 50% · الشريك 50%"
function sharesText(shares){
  if(!shares||!shares.length) return '—';
  return shares.filter(s=>Number(s.pct)>0).map(s=>partnerName(s.partnerId)+' '+fN(s.pct)+'%').join(' · ');
}
function myShare(shares){ return shareFor(shares, meId()); }

// Build the share-editor HTML block. `prefix` must be unique per usage.
function shareEditorHTML(prefix,shares){
  shares = (shares&&shares.length)?shares:[{partnerId:meId(),pct:100}];
  const map={};shares.forEach(s=>map[s.partnerId]=Number(s.pct));
  const rows=(S.partners||[]).map(p=>{
    const v=map[p.id]!=null?map[p.id]:0;
    return '<div class="share-row"><span class="share-dot" style="background:'+(p.color||'#999')+'"></span>'+
      '<span class="share-name">'+esc(p.name)+'</span>'+
      '<input type="number" class="share-input" id="'+prefix+'-p-'+p.id+'" value="'+v+'" min="0" max="100" step="0.5" oninput="updateShareTotal(\''+prefix+'\')">'+
      '<span class="share-pctsign">%</span></div>';
  }).join('');
  return '<div class="share-editor" id="'+prefix+'-editor">'+rows+
    '<div class="share-total" id="'+prefix+'-total-row">الإجمالي: <span id="'+prefix+'-total">'+fN(sharesSum(shares))+'</span>%</div>'+
    '<div class="share-quick">'+
      '<button type="button" class="chip" onclick="setShareQuick(\''+prefix+'\',[100,0])">100% لي</button>'+
      '<button type="button" class="chip" onclick="setShareQuick(\''+prefix+'\',[0,100])">100% للشريك</button>'+
      '<button type="button" class="chip" onclick="setShareQuick(\''+prefix+'\',[50,50])">50/50</button>'+
      '<button type="button" class="chip" onclick="setShareQuick(\''+prefix+'\',[75,25])">75/25</button>'+
      '<button type="button" class="chip" onclick="setShareQuick(\''+prefix+'\',[25,75])">25/75</button>'+
    '</div></div>';
}
function setShareQuick(prefix,arr){
  (S.partners||[]).forEach((p,i)=>{
    const el=document.getElementById(prefix+'-p-'+p.id);
    if(el) el.value = arr[i]!=null?arr[i]:0;
  });
  updateShareTotal(prefix);
}
function updateShareTotal(prefix){
  let total=0;
  (S.partners||[]).forEach(p=>{
    const el=document.getElementById(prefix+'-p-'+p.id);
    if(el) total+=parseFloat(el.value)||0;
  });
  const t=document.getElementById(prefix+'-total');
  if(t){
    t.textContent=fN(total);
    const row=document.getElementById(prefix+'-total-row');
    if(row) row.style.color = Math.abs(total-100)<0.01 ? 'var(--pr2)' : 'var(--red)';
  }
}
function readShareEditor(prefix){
  const out=[];
  (S.partners||[]).forEach(p=>{
    const el=document.getElementById(prefix+'-p-'+p.id);
    const v=el?parseFloat(el.value)||0:0;
    if(v>0) out.push({partnerId:p.id,pct:v});
  });
  if(!out.length) out.push({partnerId:meId(),pct:100});
  return out;
}
function validateShareEditor(prefix,label){
  let total=0;
  (S.partners||[]).forEach(p=>{
    const el=document.getElementById(prefix+'-p-'+p.id);
    if(el) total+=parseFloat(el.value)||0;
  });
  if(Math.abs(total-100)>0.05){
    toast('⚠ إجمالي '+(label||'النسب')+' يجب أن يكون 100% (الحالي: '+fN(total)+'%)');
    return false;
  }
  return true;
}
// Toggle a "same as ownership" linked editor: when checkbox checked, hide editor and mirror owners values
function toggleLinkedShares(checkboxId,editorWrapId){
  const cb=document.getElementById(checkboxId);
  const wrap=document.getElementById(editorWrapId);
  if(!cb||!wrap)return;
  wrap.style.display=cb.checked?'none':'block';
}

// ---------- Mini stat / empty state / kpi card (shared UI atoms) ----------
function miniStat(val,label){return '<div class="ministat"><div class="ministat-val">'+val+'</div><div class="ministat-lbl">'+label+'</div></div>';}
function kpiCard(label,val,icon,color){
  return '<div class="kpi-card '+(color==='red'?'red':color==='blue'?'blue':color==='orange'?'orange':color==='gold'?'gold':'')+'">'+
    '<div class="kpi-label">'+label+'</div>'+
    '<div class="kpi-val">'+val+'</div>'+
    '<i class="fas '+icon+' kpi-icon"></i>'+
  '</div>';
}
function emptyState(icon,title,sub,action){return '<div style="text-align:center;padding:60px 20px"><i class="fas '+icon+'" style="font-size:48px;color:var(--brd);margin-bottom:16px;display:block"></i><div style="font-size:16px;font-weight:700;color:var(--txt2);margin-bottom:8px">'+title+'</div><div style="font-size:13px;color:var(--txt4);margin-bottom:20px">'+sub+'</div>'+(action?'<button class="btn btn-primary" onclick="'+action+'"><i class="fas fa-plus"></i> إضافة</button>':'')+'</div>';}
function reportRow(label,val,color){
  return '<tr><td style="padding:9px 12px;color:var(--txt2)">'+label+'</td>'+
    '<td style="text-align:left;padding:9px 12px;font-weight:700;color:'+(color==='green'?'var(--pr2)':color==='red'?'var(--red)':'var(--txt)')+'">'+fMoney(val)+'</td></tr>';
}
function reportRowTotal(label,val,color){
  return '<tr style="border-top:1px solid var(--brd)"><td style="padding:10px 12px;font-weight:800">'+label+'</td>'+
    '<td style="text-align:left;padding:10px 12px;font-weight:900;font-size:14px;color:'+(color==='green'?'var(--pr2)':color==='red'?'var(--red)':'var(--txt)')+'">'+fMoney(val)+'</td></tr>';
}

// ---------- Generic cascade delete for cattle ----------
function cascadeDeleteCattle(cowId){
  S.milkLogs=(S.milkLogs||[]).map(l=>{ if(l.qtys&&l.qtys[cowId]!=null){ const q=Object.assign({},l.qtys); delete q[cowId]; return Object.assign({},l,{qtys:q}); } return l;});
  S.healthLogs=(S.healthLogs||[]).filter(h=>h.cowId!==cowId);
  S.insems=(S.insems||[]).filter(i=>i.cowId!==cowId);
  S.pregChecks=(S.pregChecks||[]).filter(p=>p.cowId!==cowId);
  S.heatPrograms=(S.heatPrograms||[]).filter(p=>p.cowId!==cowId);
  S.births=(S.births||[]).filter(b=>b.cowId!==cowId && b.calfId!==cowId);
  S.calfLogs=(S.calfLogs||[]).filter(l=>l.calfId!==cowId);
  // any animal whose mother is this one becomes motherless (keep the animal, clear ref)
  (S.cattle||[]).forEach(c=>{ if(c.motherId===cowId) c.motherId=null; });
  S.cattle=(S.cattle||[]).filter(c=>c.id!==cowId);
}
