"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { navItems } from "./nav-items";
import { useSettingsStore } from "@/lib/store/settings-store";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { appMode } = useSettingsStore();

  return (
    <aside className="flex h-full w-full flex-col bg-paper">
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {Object.entries(
          navItems.reduce((acc, item) => {
            if (item.enterpriseOnly && appMode === "simple") return acc;
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {} as Record<string, typeof navItems>)
        ).map(([category, items]) => (
          <div key={category} className="space-y-1">
            <h4 className="px-3 text-[11px] font-bold text-ink-faint mb-2">
              {category}
            </h4>
            {items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              if (!item.implemented) {
                return (
                  <div
                    key={item.href}
                    className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-faint border-r-4 border-transparent"
                    title="هذه الوحدة ضمن المراحل القادمة من خارطة الطريق"
                  >
                    <Icon className="h-5 w-5 opacity-50" />
                    <span className="flex-1">{item.label}</span>
                    <Lock className="h-3 w-3 opacity-50" />
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  style={active ? { borderColor: "var(--crop-600)" } : {}}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 border-r-4",
                    active
                      ? "bg-[var(--crop-600)]/25 text-crop-600 font-bold"
                      : "text-ink hover:bg-black/5 dark:hover:bg-white/10 border-transparent"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-[var(--crop-600)] fill-[var(--crop-600)]/20" : "text-ink-muted")} />
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-border/50 p-4 text-center text-xs text-ink-faint">
        الإصدار الأول (MVP) — حصاد
      </div>
    </aside>
  );
}
