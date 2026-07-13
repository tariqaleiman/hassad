import type { BaseEntity } from "./common";

/* ─── أنواع فرعية للملكية والإيجار ─── */

export type OwnershipType = "owned" | "rented" | "crop_sharing";
export type AreaUnit = "feddan" | "qirat";
export type RentalDuration = "yearly" | "seasonal";
export type RentalModel = "fixed_cost" | "crop_sharing";
export type RentalCostType = "total" | "per_qirat";
export type PaymentMethod = "full" | "installments";
export type CostSharingModel = "proportional" | "owner_bears_all" | "tenant_bears_all";

/* ─── قسط إيجار ─── */
export interface Installment {
  amount: number;
  dueDate: string;
  note?: string;
}

/* ─── تفاصيل الإيجار ─── */
export interface RentalInfo {
  duration: RentalDuration;
  model: RentalModel;

  /** إيجار ثابت */
  costType?: RentalCostType;
  cost?: number;

  /** طريقة الدفع (فقط مع الإيجار الثابت) */
  paymentMethod?: PaymentMethod;
  installments?: Installment[];

  /** مشاركة محصول */
  ownerSharePercent?: number;
  costSharingModel?: CostSharingModel;
}

/* ─── بيانات المؤجر (صاحب الأرض الأصلي) ─── */
export interface LandlordInfo {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}

/* ─── قطعة الأرض ─── */
export interface Land extends BaseEntity {
  farmId: string; // المزرعة (الكيان) التابعة لها
  name: string;
  
  /** المساحة */
  areaValue?: number;
  areaUnit?: AreaUnit;
  areaInFeddan?: number; // القيمة الموحدة للحسابات

  soilType?: string;
  irrigationType?: "غمر" | "رش" | "تنقيط" | "أخرى";
  notes?: string;

  /** نوع الملكية */
  ownershipType: OwnershipType;

  /** تفاصيل الإيجار (فقط إذا مستأجرة) */
  rental?: RentalInfo;

  /** بيانات المؤجر (فقط إذا مستأجرة) */
  landlord?: LandlordInfo;
}

export interface LandFormValues {
  farmId: string;
  name: string;
  areaValue?: number;
  areaUnit?: AreaUnit;
  areaInFeddan?: number;
  soilType?: string;
  irrigationType?: Land["irrigationType"];
  notes?: string;
  
  ownershipType: OwnershipType;
  rental?: RentalInfo;
  landlord?: LandlordInfo;
}
