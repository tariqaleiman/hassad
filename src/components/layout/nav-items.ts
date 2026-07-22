import type { IconType } from "@/components/ui/icons";
import { Icons } from "@/components/ui/icons";

export interface NavItem {
  label: string;
  href: string;
  icon: IconType;
  implemented: boolean;
  enterpriseOnly?: boolean;
  category: string;
}

export const navItems: NavItem[] = [
  { label: "الرئيسية", href: "/dashboard", icon: Icons.Home, implemented: true, category: "الأساسيات" },
  { label: "مهام اليوم", href: "/tasks", icon: Icons.CheckCircle, implemented: true, category: "الأساسيات" },
  
  { label: "الأراضي", href: "/lands", icon: Icons.Lands, implemented: true, category: "الإنتاج الزراعي" },
  { label: "المواسم", href: "/seasons", icon: Icons.Seasons, implemented: true, category: "الإنتاج الزراعي" },
  { label: "المحاصيل", href: "/crops", icon: Icons.Crops, implemented: true, category: "الإنتاج الزراعي" },
  { label: "برامج المحاصيل", href: "/crop-programs", icon: Icons.CropPrograms, implemented: true, category: "الإنتاج الزراعي" },
  { label: "العمليات الزراعية", href: "/operations", icon: Icons.Operations, implemented: true, category: "الإنتاج الزراعي" },
  
  { label: "المخازن", href: "/inventory", icon: Icons.Inventory, implemented: true, category: "الإمداد والمخزون" },
  { label: "الموردين", href: "/suppliers", icon: Icons.Suppliers, implemented: true, category: "الإمداد والمخزون" },
  { label: "المشتريات", href: "/purchases", icon: Icons.ShoppingCart, implemented: true, category: "الإمداد والمخزون" },
  
  { label: "العملاء", href: "/customers", icon: Icons.Customers, implemented: true, category: "المالية والتسويق" },
  { label: "المبيعات", href: "/sales", icon: Icons.Receipt, implemented: true, category: "المالية والتسويق" },
  { label: "الديون", href: "/debts", icon: Icons.Debts, implemented: true, enterpriseOnly: true, category: "المالية والتسويق" },
  { label: "المالية والحسابات", href: "/finance", icon: Icons.Finance, implemented: true, enterpriseOnly: true, category: "المالية والتسويق" },
  
  { label: "العمال", href: "/workers", icon: Icons.Workers, implemented: true, enterpriseOnly: true, category: "الموارد" },
  { label: "المعدات", href: "/equipment", icon: Icons.Equipment, implemented: true, enterpriseOnly: true, category: "الموارد" },
  { label: "المقاولين", href: "/contractors", icon: Icons.Contractors, implemented: true, enterpriseOnly: true, category: "الموارد" },
  
  { label: "التقارير", href: "/reports", icon: Icons.Reports, implemented: true, category: "التحليلات" },
];
