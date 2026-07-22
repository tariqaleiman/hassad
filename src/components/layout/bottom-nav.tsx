"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const bottomNavItemsLeft = [
  { label: "الرئيسية", href: "/dashboard", icon: Icons.Home },
  { label: "المالية", href: "/finance", icon: Icons.Finance },
];

const bottomNavItemsRight = [
  { label: "العمليات", href: "/operations", icon: Icons.Operations },
  { label: "المزيد", href: "/settings", icon: Icons.Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-xl border-t border-border/40 pb-safe">
      <div className="flex items-center justify-between h-16 px-4">
        
        {/* Left Items */}
        <div className="flex w-[40%] justify-around">
          {bottomNavItemsLeft.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:text-ink"
                )}
              >
                <div className={cn("flex items-center justify-center w-12 h-8 rounded-full transition-all duration-300", active ? "bg-black/5 dark:bg-white/10" : "bg-transparent")}>
                  <Icon className={cn("h-5 w-5", active && "fill-ink/10")} />
                </div>
                <span className={cn("text-[11px] font-medium transition-all duration-300", active ? "font-bold" : "")}>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Center Quick Add Button */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-14 w-14 items-center justify-center rounded-full bg-crop-600 text-white shadow-lg shadow-crop-600/30 hover:bg-crop-700 hover:scale-105 transition-all duration-300 border-4 border-paper">
                <Icons.Plus className="h-6 w-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 rounded-2xl mb-2">
              <DropdownMenuLabel>العمليات والمخزون</DropdownMenuLabel>
              <DropdownMenuGroup>
                <Link href="/operations"><DropdownMenuItem className="cursor-pointer">تسجيل عملية زراعية</DropdownMenuItem></Link>
                <Link href="/inventory"><DropdownMenuItem className="cursor-pointer">فاتورة مشتريات (مخزون)</DropdownMenuItem></Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>المالية والتسويق</DropdownMenuLabel>
              <DropdownMenuGroup>
                <Link href="/sales"><DropdownMenuItem className="cursor-pointer">إنشاء فاتورة مبيعات</DropdownMenuItem></Link>
                <Link href="/finance"><DropdownMenuItem className="cursor-pointer">إيصال سداد/تحصيل</DropdownMenuItem></Link>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Items */}
        <div className="flex w-[40%] justify-around">
          {bottomNavItemsRight.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:text-ink"
                )}
              >
                <div className={cn("flex items-center justify-center w-12 h-8 rounded-full transition-all duration-300", active ? "bg-black/5 dark:bg-white/10" : "bg-transparent")}>
                  <Icon className={cn("h-5 w-5", active && "fill-ink/10")} />
                </div>
                <span className={cn("text-[11px] font-medium transition-all duration-300", active ? "font-bold" : "")}>{item.label}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
