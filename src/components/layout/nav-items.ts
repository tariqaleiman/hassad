import type { IconType } from "@/components/ui/icons";
import { Icons } from "@/components/ui/icons";

export interface NavItem {
  label: string;
  href: string;
  icon: IconType;
  /** الوحدة شغالة فعليًا في هذا الإصدار */
  implemented: boolean;
}

export const navItems: NavItem[] = [
  { label: "الرئيسية", href: "/dashboard", icon: Icons.Home, implemented: true },
  { label: "الأراضي", href: "/lands", icon: Icons.Lands, implemented: true },
  { label: "المواسم", href: "/seasons", icon: Icons.Seasons, implemented: true },
  { label: "المحاصيل", href: "/crops", icon: Icons.Crops, implemented: true },
  { label: "العمليات الزراعية", href: "/operations", icon: Icons.Operations, implemented: false },
  { label: "المخزون", href: "/inventory", icon: Icons.Inventory, implemented: false },
  { label: "الموردين", href: "/suppliers", icon: Icons.Suppliers, implemented: false },
  { label: "العملاء", href: "/customers", icon: Icons.Customers, implemented: false },
  { label: "الديون", href: "/debts", icon: Icons.Debts, implemented: false },
  { label: "العمال", href: "/workers", icon: Icons.Workers, implemented: false },
  { label: "المعدات", href: "/equipment", icon: Icons.Equipment, implemented: false },
  { label: "الإيرادات والمصروفات", href: "/finance", icon: Icons.Finance, implemented: false },
  { label: "التقارير", href: "/reports", icon: Icons.Reports, implemented: false },
];
