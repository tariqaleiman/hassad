"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { navItems } from "./nav-items";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col bg-paper">
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          if (!item.implemented) {
            return (
              <div
                key={item.href}
                className="flex cursor-not-allowed items-center gap-4 rounded-lg px-3 py-2.5 text-sm text-ink-faint"
                title="هذه الوحدة ضمن المراحل القادمة من خارطة الطريق"
              >
                <Icon className="h-6 w-6 opacity-50" />
                <span className="flex-1">{item.label}</span>
                <Lock className="h-3.5 w-3.5 opacity-50" />
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-4 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-black/5 dark:bg-white/10 text-ink font-bold"
                  : "text-ink hover:bg-black/5 dark:hover:bg-white/10"
              )}
            >
              <Icon className={cn("h-6 w-6", active ? "text-ink fill-ink/10" : "text-ink")} />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/50 p-4 text-center text-xs text-ink-faint">
        الإصدار الأول (MVP) — حصاد
      </div>
    </aside>
  );
}
