"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Icons } from "@/components/ui/icons";
import { useAuth } from "@/lib/providers/auth-provider";
import { useOwnerProfile } from "@/lib/hooks/use-owner";
import { useFarms } from "@/lib/hooks/use-farms";
import { useActiveFarm } from "@/lib/stores/use-active-farm";
import { Button } from "@/components/ui/button";

export function Topbar({
  title,
  onMenuClick,
}: {
  title?: string;
  onMenuClick?: () => void;
}) {
  const { user, signOut } = useAuth();
  const { data: owner } = useOwnerProfile();
  const { data: farms, isLoading: loadingFarms } = useFarms();
  const { activeFarmId } = useActiveFarm();
  
  const activeFarm = farms?.find((f) => f.id === activeFarmId) || farms?.[0];

  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  /* إغلاق القائمة عند النقر خارجها */
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuOpen && menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
      if (notificationsOpen && notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen, notificationsOpen]);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between sticky top-0 z-50 w-full bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-xl transition-colors duration-300">

      {/* Start: Menu & Logo (Matches sidebar boundary) */}
      <div className="flex items-center w-auto md:w-64 shrink-0 px-3 md:px-6 h-full">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 md:h-9 md:w-9 items-center justify-center rounded-full text-ink hover:bg-black/5 dark:hover:bg-white/10 transition-colors me-1 md:me-3"
          aria-label="فتح القائمة"
        >
          <Icons.Menu className="h-5 w-5 md:h-5 md:w-5" />
        </button>
        <Logo />
      </div>

      {/* Middle/Main Area: Starts exactly after the sidebar boundary */}
      <div className="flex-1 flex items-center px-2 md:px-4">
        {/* Farm Profile Link */}
        <div className="hidden md:block">
          <Link 
            href="/farms"
            className="flex items-center gap-2 rounded-full bg-black/5 dark:bg-white/5 px-3 py-1.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-border/60" 
            title="إعدادات المزرعة"
          >
            <Icons.Farms className="h-4 w-4 text-crop-500 shrink-0" />
            <span className="text-sm font-medium text-ink truncate max-w-[150px]">
              {loadingFarms ? "جاري التحميل..." : activeFarm?.name || "إعداد المزرعة"}
            </span>
          </Link>
        </div>
      </div>

      {/* End: Actions & Profile */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 px-3 md:px-4">

        {/* Quick Add Action */}
        <Button size="sm" className="hidden sm:flex rounded-full gap-1.5 h-9 px-4 font-medium mx-1">
          <Icons.Plus className="h-4 w-4" />
          <span>إضافة جديد</span>
        </Button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-border/60 mx-1" />

        {/* Quick Action Icons */}
        <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 transition-colors tooltip-trigger" aria-label="المظهر">
          <Icons.Moon className="h-5 w-5" />
        </button>

        <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 transition-colors tooltip-trigger" aria-label="الدعم والمساعدة">
          <Icons.Phone className="h-5 w-5" />
        </button>

        <Link href="/settings" className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 transition-colors tooltip-trigger" aria-label="الإعدادات">
          <Icons.Settings className="h-5 w-5" />
        </Link>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="flex h-10 w-10 md:h-9 md:w-9 items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative"
            aria-label="الإشعارات"
          >
            <Icons.Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 md:top-2 md:right-2 h-2 w-2 rounded-full bg-danger border-2 border-paper"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute end-0 top-full z-20 mt-2 w-80 rounded-xl border border-border bg-paper-raised p-2 shadow-xl animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-3 text-base font-medium border-b border-border mb-2">الإشعارات</div>
              <div className="px-3 py-8 text-center text-sm text-ink-muted">لا توجد إشعارات جديدة.</div>
            </div>
          )}
        </div>


        {/* User Profile */}
        <div className="relative ms-1" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 md:h-9 md:w-9 items-center justify-center rounded-full transition-colors hover:ring-2 hover:ring-sky-500/50 p-0.5 md:p-0"
          >
            <span className="flex h-full w-full items-center justify-center rounded-full bg-sky-600 text-white font-medium text-sm shadow-sm">
              {owner?.name?.[0] || user?.email?.[0]?.toUpperCase() || <Icons.User className="h-4 w-4" />}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute end-0 top-full z-20 mt-2 w-64 rounded-xl border border-border bg-paper-raised p-2 shadow-xl animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 mb-2 border-b border-border">
                <p className="text-sm font-medium text-ink truncate">{owner?.name || user?.displayName || "المستخدم"}</p>
                <p className="text-xs text-ink-muted truncate">{user?.email}</p>
              </div>
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-4 rounded-lg px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Icons.Settings className="h-5 w-5" />
                الإعدادات
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-ink hover:bg-black/5 dark:hover:bg-white/10 rounded-lg mt-1 font-medium px-4 py-2.5 h-auto text-sm"
                onClick={() => signOut()}
              >
                <Icons.LogOut className="h-5 w-5 me-2" />
                تسجيل الخروج
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
