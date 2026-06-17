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

let fbApp=null, fbDb=null, fbRef=null, fbReady=false, fbSyncing=false;
let fbLastRemoteUpdate=0; // timestamp guard against echo loops
const FB_PATH='farms/main'; // single-farm path; could be extended to multi-tenant later

function initFirebase(){
  try{
    if(typeof firebase==='undefined'){
      console.warn('Firebase SDK not loaded — falling back to local storage only');
      setStatus('offline');
      return false;
    }
    fbApp = firebase.initializeApp(firebaseConfig);
    fbDb = firebase.database();
    fbRef = fbDb.ref(FB_PATH);
    fbReady = true;
    return true;
  }catch(e){
    console.error('Firebase init failed:',e);
    setStatus('offline');
    return false;
  }
}

// Pull initial data from Firebase once on load. Falls back gracefully if offline.
function fbLoadOnce(){
  return new Promise((resolve)=>{
    if(!fbReady){resolve(null);return;}
    fbRef.once('value',
      snap=>{ resolve(snap.val()); },
      err=>{ console.error('Firebase read error:',err); resolve(null); }
    );
  });
}

// Push current state to Firebase (debounced via schedSave in core.js)
function fbPush(data){
  if(!fbReady) return Promise.resolve(false);
  fbSyncing=true;
  return fbRef.set(data)
    .then(()=>{ fbSyncing=false; return true; })
    .catch(err=>{ console.error('Firebase write error:',err); fbSyncing=false; return false; });
}

// Listen for changes made from other devices/sessions and merge them in live.
// Uses a "last write timestamp" field (_syncTs) to avoid reacting to our own writes.
function fbListenLive(){
  if(!fbReady) return;
  fbRef.on('value', snap=>{
    const remote=snap.val();
    if(!remote) return;
    if(remote._syncTs && remote._syncTs===S._syncTs) return; // our own echo, ignore
    if(fbSyncing) return; // we're mid-write, ignore until settled
    // Only auto-merge if this looks like a genuinely newer remote change
    if(remote._syncTs && remote._syncTs>(S._syncTs||0)){
      Object.assign(S, remote);
      migrateData();
      if(typeof renderPage==='function') renderPage(currentPage);
      toast('🔄 تم تحديث البيانات من جهاز آخر');
    }
  }, err=>{ console.error('Firebase listen error:',err); });
}
