"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";

const bottomNavItems = [
  { label: "الرئيسية", href: "/dashboard", icon: Icons.Home },
  { label: "الأراضي", href: "/lands", icon: Icons.Lands },
  { label: "المواسم", href: "/seasons", icon: Icons.Seasons },
  { label: "المحاصيل", href: "/crops", icon: Icons.Crops },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-xl border-t border-border/40 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {bottomNavItems.map((item) => {
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
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-8 rounded-full transition-all duration-300",
                  active ? "bg-black/5 dark:bg-white/10" : "bg-transparent"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "fill-ink/10")} />
              </div>
              <span className={cn("text-[10px] font-medium transition-all duration-300", active ? "font-bold" : "")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
