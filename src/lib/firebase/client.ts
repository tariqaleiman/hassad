import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// بيانات الإعداد تُقرأ من متغيرات البيئة (.env.local)
// انسخ .env.local.example إلى .env.local وضع فيه بيانات مشروع Firebase الخاص بك
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp(
        isFirebaseConfigured
          ? firebaseConfig
          : {
              // قيم وهمية تسمح للتطبيق بالعمل بدون كسر أثناء التطوير قبل ربط Firebase الحقيقي
              apiKey: "demo-api-key",
              authDomain: "demo.firebaseapp.com",
              projectId: "demo-hasad",
              storageBucket: "demo-hasad.appspot.com",
              messagingSenderId: "000000000000",
              appId: "1:000000000000:web:0000000000000000000000",
            }
      );

export const auth = getAuth(app);

// Firestore مع دعم العمل دون اتصال (Offline First) كما تنص الوثيقة
export const db = initializeFirestore(app, {
  localCache:
    typeof window === "undefined"
      ? memoryLocalCache()
      : persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
});

export const storage = getStorage(app);

export default app;
