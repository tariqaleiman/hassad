import type { BaseEntity } from "./common";
import type { ItemCategory } from "./inventory";

export interface ItemDictionaryEntry extends BaseEntity {
  userId: string; // The user who created this dictionary entry
  category: ItemCategory;
  mainType: string; // e.g., أرز, قمح, يوريا
  subType?: string; // e.g., رفيع الحبة, عريض الحبة, 46%
  variety?: string; // e.g., جيزة 178, سخا 104
  unit: string; // Default unit
}

export type ItemDictionaryFormValues = Omit<ItemDictionaryEntry, "id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedAt" | "userId">;
