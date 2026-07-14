export type AreaUnitType = "feddan" | "qirat" | "meter";

export const FEDDAN_TO_QIRAT = 24;
export const QIRAT_TO_METER = 175.035; // Actually ~175.035 sq meters per qirat
export const FEDDAN_TO_METER = 4200.83; // Actually ~4200.83 sq meters per feddan

export function convertToFeddan(value: number, unit: AreaUnitType | string): number {
  if (unit === "feddan") return value;
  if (unit === "qirat") return value / FEDDAN_TO_QIRAT;
  if (unit === "meter") return value / FEDDAN_TO_METER;
  return value;
}

export function convertFromFeddan(feddanValue: number, toUnit: AreaUnitType | string): number {
  if (toUnit === "feddan") return feddanValue;
  if (toUnit === "qirat") return feddanValue * FEDDAN_TO_QIRAT;
  if (toUnit === "meter") return feddanValue * FEDDAN_TO_METER;
  return feddanValue;
}

export function formatArea(value: number, unit: AreaUnitType | string): string {
  if (unit === "feddan") return `${value} فدان`;
  if (unit === "qirat") return `${value} قيراط`;
  if (unit === "meter") return `${value} متر مربع`;
  return `${value}`;
}
