import type { BaseEntity } from "./common";

/* ─── أنواع الملكية والشراكة ─── */

export type OwnershipCategory =
  | "owned_full"           // مملوكة للمالك بالكامل
  | "owned_partner"        // مملوكة بنسبة مع الشريك
  | "rented_cash"          // مستأجرة نقدياً (بالمبلغ المقطوع، الفدان، القيراط)
  | "rented_crop_share"    // مستأجرة بالمشاركة في الإنتاج (النص، الربع، الخ)
  | "rented_partner";      // مستأجرة ويوجد شريك في الإدارة والزراعة

export type AreaUnit = "feddan" | "qirat";
export type RentCashDuration = "yearly" | "seasonal";
export type RentCashType = "per_qirat" | "per_feddan" | "total";
export type CostBearing = "owner_full" | "tenant_full" | "shared" | "custom";
export type CropShareRatio = "half" | "third" | "quarter" | "custom";

/* ─── بيانات المؤجر (صاحب الأرض الأصلي في حال الإيجار) ─── */
export interface LandlordInfo {
  name: string;
  phone?: string;
}

/* ─── بيانات الشريك (سواء في الملكية أو في الزراعة) ─── */
export interface LandPartnerInfo {
  name: string;
  ownerSharePercent: number; // نسبة المالك
  partnerSharePercent: number; // نسبة الشريك (يجب أن يكون المجموع 100)
}

/* ─── تفاصيل الإيجار النقدي ─── */
export interface RentCashInfo {
  type: RentCashType;
  amount: number; // السعر
  duration: RentCashDuration;
}

/* ─── تفاصيل إيجار المشاركة (المزارعة) ─── */
export interface RentCropShareInfo {
  ratio: CropShareRatio;
  customRatioPercent?: number; // إذا كان الاختيار custom
  costBearing: CostBearing; // من يتحمل التكاليف؟
  notes?: string; // شروط إضافية أو (حسب الاتفاق)
}

/* ─── بيانات الحيازة المتكاملة ─── */
export interface TenureInfo {
  category: OwnershipCategory;
  
  // متوفر في حال owned_partner أو rented_partner
  partner?: LandPartnerInfo;
  
  // متوفر في كل حالات الإيجار (rented_*)
  landlord?: LandlordInfo;

  // متوفر في حال rented_cash
  rentCash?: RentCashInfo;

  // متوفر في حال rented_crop_share
  rentCropShare?: RentCropShareInfo;
}

/* ─── تفاصيل حساب المساحة التلقائي ─── */
export type AreaMeasurementUnit = "meter" | "nos";
export type AreaShape = "regular" | "irregular";

export interface AreaCalculatorData {
  unit: AreaMeasurementUnit;
  shape: AreaShape;
  // للمنتظم
  length?: number;
  width?: number;
  // لغير المنتظم
  north?: number;
  south?: number;
  east?: number;
  west?: number;
}

/* ─── قطعة الأرض ─── */
export interface Land extends BaseEntity {
  farmId: string; // المزرعة (الكيان) التابعة لها
  name: string;
  
  /** المساحة */
  areaValue: number; // المدخل النهائي
  areaUnit: AreaUnit;
  areaInFeddan: number; // القيمة الموحدة للحسابات

  /** بيانات الآلة الحاسبة (لتسهيل التعديل لاحقاً) */
  areaCalculatorData?: AreaCalculatorData;

  soilType?: string;
  irrigationType?: "غمر" | "رش" | "تنقيط" | "أخرى" | "";
  notes?: string;

  /** بيانات الحيازة والملكية */
  tenure: TenureInfo;
}

export interface LandFormValues {
  farmId: string;
  name: string;
  areaValue: number;
  areaUnit: AreaUnit;
  areaInFeddan?: number;
  areaCalculatorData?: AreaCalculatorData;
  
  soilType?: string;
  irrigationType?: Land["irrigationType"];
  notes?: string;
  
  tenure: TenureInfo;
}
