// ═══════════════════════════════════════════════════════
//  حصاد — FIREBASE INTEGRATION (offline-first sync)
// ═══════════════════════════════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSyDj2OC0DphEz5LuUPkvjWRYmq_eGB7MW3A",
  authDomain: "hassad-d60e9.firebaseapp.com",
  databaseURL: "https://hassad-d60e9-default-rtdb.firebaseio.com",
  projectId: "hassad-d60e9",
  storageBucket: "hassad-d60e9.firebasestorage.app",
  messagingSenderId: "464642052778",
  appId: "1:464642052778:web:032346f9c4f5df6dab36d3",
  measurementId: "G-2GGHPFFYJ6"
};

let fbApp=null, fbDb=null, fbRef=null, fbAuth=null, fbReady=false, fbSyncing=false;
let fbUser=null;
let authResolve=null;

function initFirebase(){
  return new Promise((resolve) => {
    try{
      if(typeof firebase==='undefined'){
        console.warn('Firebase SDK not loaded — falling back to local storage only');
        setStatus('offline');
        resolve(false);
        return;
      }
      fbApp = firebase.initializeApp(firebaseConfig);
      fbDb = firebase.database();
      fbAuth = firebase.auth();
      fbReady = true;

      authResolve = resolve; // save resolve to be called when auth state settles

      fbAuth.onAuthStateChanged((user) => {
        fbUser = user;
        if(user) {
          fbRef = fbDb.ref('farms/users/' + user.uid);
          document.getElementById('auth-overlay').style.display='none';
          if(authResolve) { authResolve(true); authResolve=null; }
          else {
            // Logged in later (after initial boot), reload db
            loadDB().then(()=> { if(typeof renderPage==='function') renderPage(currentPage); });
          }
        } else {
          document.getElementById('auth-overlay').style.display='flex';
          document.getElementById('loading').style.display='none';
          if(authResolve) { authResolve(false); authResolve=null; }
        }
      });
    }catch(e){
      console.error('Firebase init failed:',e);
      setStatus('offline');
      resolve(false);
    }
  });
}

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  fbAuth.signInWithPopup(provider).catch(err => {
    document.getElementById('auth-error').textContent = err.message;
    document.getElementById('auth-error').style.display='block';
  });
}

let authMode = 'login';
function toggleAuthMode() {
  authMode = authMode === 'login' ? 'register' : 'login';
  document.getElementById('auth-submit-btn').textContent = authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد';
  document.getElementById('auth-toggle-mode').textContent = authMode === 'login' ? 'ليس لديك حساب؟ إنشاء حساب' : 'لديك حساب؟ تسجيل الدخول';
}

function handleEmailAuth(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-password').value;
  document.getElementById('auth-error').style.display='none';
  
  if (authMode === 'login') {
    fbAuth.signInWithEmailAndPassword(email, pass).catch(err => {
      document.getElementById('auth-error').textContent = err.message;
      document.getElementById('auth-error').style.display='block';
    });
  } else {
    fbAuth.createUserWithEmailAndPassword(email, pass).catch(err => {
      document.getElementById('auth-error').textContent = err.message;
      document.getElementById('auth-error').style.display='block';
    });
  }
}

function signOutUser() {
  if(fbAuth) fbAuth.signOut().then(() => {
    window.location.reload();
  });
}

async function fbMigrateIfNeeded(uid) {
  // Check if we have legacy data in 'farms/main'
  try {
    const mainRef = fbDb.ref('farms/main');
    const snap = await mainRef.once('value');
    const legacyData = snap.val();
    if(legacyData && Object.keys(legacyData).length > 0) {
      // Migrate it to the current user
      await fbDb.ref('farms/users/' + uid).set(legacyData);
      console.log('Migrated legacy data from farms/main to user profile.');
      return legacyData;
    }
  } catch(e) { console.error('Migration check failed', e); }
  return null;
}

function fbLoadOnce(){
  return new Promise(async (resolve)=>{
    if(!fbReady || !fbUser || !fbRef){resolve(null);return;}
    fbRef.once('value',
      async snap=>{ 
        let data = snap.val();
        // If no data, check for migration from main
        if(!data) {
          data = await fbMigrateIfNeeded(fbUser.uid);
        }
        resolve(data);
      },
      err=>{ console.error('Firebase read error:',err); resolve(null); }
    );
  });
}

function fbPush(data){
  if(!fbReady || !fbUser || !fbRef) return Promise.resolve(false);
  fbSyncing=true;
  return fbRef.set(data)
    .then(()=>{ fbSyncing=false; return true; })
    .catch(err=>{
      console.error('Firebase write error:',err);
      fbSyncing=false;
      if(err && (err.code==='PERMISSION_DENIED' || /permission/i.test(err.message||''))){
        toast('⚠ Firebase رفض الحفظ بسبب قواعد الأمان (Security Rules) — البيانات محفوظة محلياً فقط حالياً. راجع Realtime Database → Rules.');
      }
      return false;
    });
}

function fbListenLive(){
  if(!fbReady || !fbUser || !fbRef) return;
  fbRef.on('value', snap=>{
    const remote=snap.val();
    if(!remote) return;
    if(remote._syncTs && remote._syncTs===S._syncTs) return; 
    if(fbSyncing) return; 
    if(remote._syncTs && remote._syncTs>(S._syncTs||0)){
      Object.assign(S, remote);
      migrateData();
      if(typeof renderPage==='function') renderPage(currentPage);
      toast('🔄 تم تحديث البيانات من جهاز آخر');
    }
  }, err=>{ console.error('Firebase listen error:',err); });
}
