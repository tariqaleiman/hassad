# الخطة التنفيذية التفصيلية - المرحلة 1 (Phase 1: Detailed Technical Plan)
### تهيئة البنية التحتية، قواعد البيانات، المرونة المالية، ونظام الصلاحيات (RBAC Data Models)

---

## 1. هدف المرحلة 1 (Phase Goal)
تعديل وتطوير نماذج قواعد البيانات (Data Models & TypeScript Interfaces) لتدعم كافة متطلبات المرونة والعمليات الزراعية الواقعية (يومية المقاول المجمعة، الدفع كاش/آجل، خدمات المعدات الخارجية، والتوسع التدريجي قسم بقسم) مع بناء نظام الأدوار والصلاحيات (Role-Based Access Control - RBAC) دون كسر البنية الحالية للنظام.

---

## 2. النطاق الفني والهندسي المفصل (Technical Scope Breakdown)

### 2.1. تطوير نماذج العمالة والمقاولين (Labor & Contractor Models Refactoring)
- **المعضلة الحالية:** النظام يفصل العمال عن المقاولين، ولا يستوعب نموذج "يومية مقاول الأنفار".
- **التطوير الفني المطلوب:**
  - تعديل `src/lib/types/contractor.ts` و `src/lib/types/labor.ts`.
  - إضافة واجهة **`ContractorLaborBatch` (دفعة يومية مقاول):**
    ```typescript
    export interface ContractorLaborBatch extends BaseEntity {
      farmId: string;
      cropCycleId: string;        // الزرعة المرتبطة
      contractorId: string;       // اسم/معرف المقاول
      contractorName: string;
      date: string;               // تاريخ اليومية
      workerCount: number;        // عدد العمال
      wagePerWorker: number;     // أجرة العامل الواحد
      contractorDailyFee: number; // يومية/عمولة المقاول نفسه
      totalAmount: number;        // (workerCount * wagePerWorker) + contractorDailyFee
      paymentStatus: "cash" | "credit" | "partial"; // كاش / آجل نوتة / جزئي
      paidAmount: number;         // المبلغ المدفوع نقداً
      remainingAmount: number;    // المتبقي في النوتة
      notes?: string;
    }
    ```
  - **ميزة الحفظ التلقائي:** إضافة دالة `ensureContractorExists(name: string)`، إذا أدخل المزارع اسماً جديداً لمقاول، يتم إنشاؤه تلقائياً في قاعدة البيانات وحفظه للمرات القادمة بمرونة تامة.

### 2.2. تطوير نماذج الآلات والمعدات (Equipment & External Service Models)
- **المعضلة الحالية:** التعامل مع كل الآلات كـ "أصول وإهلاكات محاسبية".
- **التطوير الفني المطلوب:**
  - تعديل `src/lib/types/equipment.ts` لتدعم نوعين من الاستخدام:
    1. **المعدات المملوكة (Owned Equipment):**
       - تسجيل مصاريف التشغيل والصيانة (سولار، بنزين، تغيير زيت) وتوزيع تكلفتها كـ "مصروف تشغيل".
       - **المعدة كمصدر دخل (Service Income):** إضافة واجهة `EquipmentServiceIncome` لتسجيل إيراد عندما يقوم المزارع بحراثة أرض جاره أو رشها بمعدته الخاصة (تسجيل كإيراد + مديونية في النوتة على الجار).
    2. **خدمات المعدات الخارجية / المقاولات (External Machinery Services):**
       - عدم تسجيل الجرار أو آلة الحصاد كمعدة مملوكة، بل كـ **"خدمة مقاولة تشغيل"** تضاف كدين على المزارع لمالك المعدة ومصروف إعداد أرض على الزرعة.

### 2.3. تطبيق المرونة المالية الشاملة (Universal Cash/Credit Payment Structure)
- **المعضلة الحالية:** بعض الشاشات تفترض الدفع الكاش المباشر.
- **التطوير الفني المطلوب:**
  - تعديل `src/lib/types/payment.ts` و `src/lib/types/purchase.ts` و `src/lib/types/sales.ts`.
  - توحيد كائن طريقة الدفع في كل المعاملات:
    ```typescript
    export type FlexiblePaymentMode = "cash" | "credit" | "partial";
    export interface TransactionPaymentDetails {
      paymentMode: FlexiblePaymentMode;
      paidAmount: number;
      remainingAmount: number;
      dueDate?: string; // موعد السداد المتوقع لموسم الحصاد
      ledgerPartyId?: string; // معرف الشخص في النوتة (تاجر/مقاول/عميل)
    }
    ```

### 2.4. نظام الصلاحيات والأدوار (Role-Based Access Control - RBAC)
- **التطوير الفني المطلوب:**
  - إنشاء ملف نماذج الصلاحيات `src/lib/types/rbac.ts`.
  - تعريف الأدوار الأربعة بوضوح:
    ```typescript
    export type UserRole = "owner" | "farm_manager" | "accountant" | "field_supervisor";
    export interface UserPermissions {
      canViewProfitAndLoss: boolean;
      canManageUsers: boolean;
      canAccessAdminPanel: boolean;
      canEditFinances: boolean;
      canLogOperations: boolean;
      canViewDebts: boolean;
    }
    ```

### 2.5. متغيرات التوسع التدريجي قسم بقسم (Section Expansion Configuration)
- **التطوير الفني المطلوب:**
  - إضافة كائن تكوين النمط المتقدم في `src/lib/types/settings.ts`:
    ```typescript
    export interface SectionModeSettings {
      inventoryMode: "simple" | "enterprise";
      laborMode: "simple" | "enterprise";
      financeMode: "simple" | "enterprise";
      equipmentMode: "simple" | "enterprise";
      landsMode: "simple" | "enterprise";
    }
    ```

---

## 3. قائمة الملفات التي سيتم إنشاؤها وتعديلها (File Change List)

### [MODIFY] النماذج الحالية:
- `src/lib/types/contractor.ts` - إضافة نموذج `ContractorLaborBatch` والحفظ التلقائي.
- `src/lib/types/labor.ts` - الربط بدفعات المقاول وإضافة حقول الدفع المرن.
- `src/lib/types/equipment.ts` - التفريق بين المعدات المملوكة وإيراد مقاولة الآلات والخدمات الخارجية.
- `src/lib/types/farming-operation.ts` - دعم سحب التكاليف المجمعة (مخزون + عمالة + جاز).
- `src/lib/types/purchase.ts` - إضافة الدفع المرن والشراء المسبق.
- `src/lib/types/sales.ts` - دعم البيع المرن وتتبع مديونية الوكالة/التاجر.

### [NEW] النماذج الجديدة:
- `src/lib/types/rbac.ts` - تعريف أدوار المستخدمين وصلاحيات مالك المزرعة والمدراء والمحاسبين.
- `src/lib/types/farmer-mode.ts` - تعريف متغيرات التوسع التدريجي قسم بقسم وتكوين الواجهات.

---

## 4. خطة التحقق واختبار الجودة (Verification Plan)

1. **فحص الأنواع وتوافق التجميع (TypeScript Compilation Check):**
   - تشغيل فحص الأنواع (`npx tsc --noEmit`) للتأكد من خلو نماذج قواعد البيانات الجديدة من أي أخطاء في الـ Signatures أو كسر للأكواد القائمة.
2. **اختبار اتساق النماذج (Data Consistency Test):**
   - التحقق من أن كائن `ContractorLaborBatch` يقوم بحساب الإجمالي تلقائياً: `(workerCount * wagePerWorker) + contractorDailyFee`.
   - التثبت من أن خيار `partial` الدفع يحسب المتبقي الصحيح في النوتة.
