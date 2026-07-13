# حصاد — نظام إدارة المزارع والمحاسبة الزراعية

تطبيق ويب (PWA لاحقًا) لإدارة المزارع، الأراضي، المواسم، المخزون، والمحاسبة الزراعية،
مبني حسب وثيقة تأسيس مشروع "حصاد".

## الحالة الحالية

هذا تأسيس حقيقي وقابل للتشغيل للمشروع، وليس نموذجًا تجريبيًا فقط:

**تم بناؤه فعليًا وجاهز للاستخدام:**
- المعمارية الكاملة (Clean Architecture + Repository Pattern) القابلة للتوسع لكل الوحدات القادمة.
- الاتصال بـ Firebase (Authentication + Firestore + Storage) مع دعم العمل دون اتصال (Offline Persistence).
- تسجيل الدخول.
- لوحة التحكم (بمؤشرات حقيقية من البيانات).
- وحدة **إدارة المزارع** كاملة: إضافة، تعديل، حذف منطقي (Soft Delete)، بحث.
- نظام تصميم متكامل: دعم RTL، الوضع الليلي/الفاتح، مكونات واجهة قابلة لإعادة الاستخدام.
- قواعد أمان Firestore أساسية (`firestore.rules`).

**لم يُبنَ بعد (الخطوات التالية حسب خارطة الطريق):**
الأراضي، المواسم، قاعدة بيانات المحاصيل، العمليات الزراعية، المخزون، الموردين،
العملاء، الديون والسداد، العمال، المعدات، التقارير، الإعدادات.
هذه الوحدات ظاهرة في القائمة الجانبية بعلامة قفل لتوضيح أنها قادمة.

## التشغيل محليًا

```bash
npm install
cp .env.local.example .env.local
# افتح .env.local وضع بيانات مشروع Firebase الخاص بك
npm run dev
```

افتح http://localhost:3000

### ربط Firebase

1. من Firebase Console أنشئ مشروعًا (أو استخدم مشروعك الحالي).
2. فعّل: Authentication (Email/Password) و Cloud Firestore و Storage.
3. انسخ بيانات إعداد التطبيق (Web App Config) إلى `.env.local`.
4. انشر ملف `firestore.rules` على مشروعك:
   ```bash
   firebase deploy --only firestore:rules
   ```
5. أنشئ أول مستخدم من تبويب Authentication في الكونسول لتسجيل الدخول به.

> إذا تركت `.env.local` فارغة، سيعمل التطبيق بدون فرض تسجيل الدخول (وضع تطوير)
> لكن لن تُحفظ أي بيانات فعليًا في Firestore حقيقي.

## بنية المشروع

```
src/
  app/                      صفحات Next.js (App Router)
    (auth)/login/           صفحة تسجيل الدخول
    (dashboard)/            القسم المحمي: لوحة التحكم + كل الوحدات
  components/
    ui/                     مكونات واجهة عامة (Button, Input, Dialog...)
    layout/                 Sidebar, Topbar, Logo, تعريف عناصر التنقل
    farms/                  مكونات خاصة بوحدة المزارع (مثال يُحتذى للوحدات القادمة)
  lib/
    types/                  أنواع TypeScript لكل كيان (Farm, Land, Season...)
    repositories/           طبقة الوصول لـ Firestore (Repository Pattern)
    services/                طبقة الخدمات — نقطة الوصول الوحيدة من الواجهة للبيانات
    hooks/                  React Query hooks لكل وحدة
    providers/              Auth, Theme, React Query
    firebase/                إعداد الاتصال بـ Firebase
```

## نمط إضافة وحدة جديدة (مثال: الأراضي)

اتبع بالضبط نفس نمط وحدة المزارع الموجودة فعليًا في المشروع:

1. **النوع**: أضف `Land` في `src/lib/types/land.ts` (موجود مسبقًا كمثال).
2. **المستودع**: أنشئ `src/lib/repositories/land-repository.ts` بوراثة `FirestoreRepository`.
3. **الخدمة**: أنشئ `src/lib/services/land-service.ts`.
4. **الـ Hooks**: أنشئ `src/lib/hooks/use-lands.ts` (انسخ نمط `use-farms.ts`).
5. **الواجهة**: أنشئ نموذج `LandForm` وصفحة `src/app/(dashboard)/lands/page.tsx`.
6. **التفعيل**: غيّر `implemented: false` إلى `true` في `src/components/layout/nav-items.ts`.

بهذا النمط لا تُكتب أي منطق Firestore جديد، ولا يتكرر أي كود — تمامًا كما تنص
قواعد التطوير في وثيقة التأسيس.

## التقنيات

Next.js 16 · TypeScript · Tailwind CSS v4 · React Query · React Hook Form + Zod ·
Firebase (Auth, Firestore, Storage) · lucide-react
