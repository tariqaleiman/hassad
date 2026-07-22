"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Lock, CreditCard } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Icons } from "@/components/ui/icons";
import { useAuth } from "@/lib/providers/auth-provider";
import { useOwnerProfile } from "@/lib/hooks/use-owner";
import { useFarms } from "@/lib/hooks/use-farms";
import { useNotifications, useNotificationsActions } from "@/lib/hooks/use-notifications";
import { useTheme } from "@/lib/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { UserProfileDialog } from "@/components/settings/user-profile-dialog";
import { useSaveOwnerProfile } from "@/lib/hooks/use-owner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OmniAddMenu } from "@/components/layout/omni-add-menu";
import { FarmDialog } from "@/components/settings/farm-dialog";

export function Topbar({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { data: owner } = useOwnerProfile();
  const { data: farms, isLoading: loadingFarms } = useFarms();
  
  // Active Farm - Ideally this would be selected via a global store
  const activeFarm = farms && farms.length > 0 ? farms[0] : null;

  const { data: notifications } = useNotifications(activeFarm?.id || "");
  const { markAsRead, markAllAsRead } = useNotificationsActions();

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [omniOpen, setOmniOpen] = useState(false);
  const [farmDialogOpen, setFarmDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  const saveProfile = useSaveOwnerProfile();

  const handleSaveProfile = (values: any) => {
    saveProfile.mutate(
      {
        ...owner,
        ...values,
        email: user?.email ?? "",
      },
      {
        onSuccess: () => setUserDialogOpen(false)
      }
    );
  };

  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  /* Close menus when clicking outside */
  useEffect(() => {
    if (!menuOpen && !notificationsOpen) return;
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
    <>
      <header className="flex h-16 shrink-0 items-center justify-between sticky top-0 z-40 w-full bg-paper/80 backdrop-blur-xl border-b border-border/40 transition-colors duration-300">
        
        {/* Start: Menu & Logo */}
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

        {/* Middle: Farm Switcher */}
        <div className="flex-1 flex items-center px-2 md:px-4">
          <div className="hidden md:block">
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full bg-black/5 dark:bg-white/5 px-3 py-1.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-border/60 outline-none">
                <Icons.Farms className="h-4 w-4 text-crop-500 shrink-0" />
                <span className="text-sm font-bold text-ink truncate max-w-[150px]">
                  {loadingFarms ? "جاري التحميل..." : activeFarm?.name || "اختر المزرعة"}
                </span>
                <Icons.ChevronDown className="h-3 w-3 text-ink-muted ms-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 rounded-2xl bg-paper-raised border-border/50 shadow-2xl p-2">
                <DropdownMenuLabel className="text-xs text-ink-muted px-2 py-1.5">تبديل المزرعة / الفرع</DropdownMenuLabel>
                <DropdownMenuGroup className="mt-1">
                  {farms?.map(farm => (
                    <DropdownMenuItem key={farm.id} className="cursor-pointer flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-black/5 dark:hover:bg-white/10">
                      <span className="font-bold">{farm.name}</span>
                      {activeFarm?.id === farm.id && <Icons.Check className="h-4 w-4 text-crop-600" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-2 bg-border/50" />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setFarmDialogOpen(true)} className="cursor-pointer text-sky-600 rounded-xl px-3 py-2.5 font-bold transition-colors hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:text-sky-700">
                    <Icons.Plus className="h-4 w-4 me-2" /> إضافة مزرعة جديدة
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* End: Actions & Profile */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 px-3 md:px-4">

          {/* Quick Add Action (Omni-Add) */}
          <div className="hidden sm:block mx-1">
            <Button 
              size="sm" 
              onClick={() => setOmniOpen(true)}
              className="rounded-full gap-1.5 px-4 font-bold bg-crop-600 hover:bg-crop-700 text-white shadow-sm"
            >
              <Icons.Plus className="h-4 w-4" />
              <span>إضافة جديد</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-sans font-medium text-white ms-1">
                <span className="text-xs">Alt</span>+N
              </kbd>
            </Button>
          </div>

          <div className="hidden sm:block w-px h-5 bg-border/60 mx-1" />

          {/* Theme Toggle (Moved to dropdown) */}
          {/* The redundant Settings button was removed per user feedback */}

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="flex h-10 w-10 md:h-9 md:w-9 items-center justify-center rounded-full text-ink-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative"
              aria-label="الإشعارات"
            >
              <Icons.Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white border-2 border-paper">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute end-0 top-full z-20 mt-2 w-80 rounded-2xl border border-border bg-paper-raised shadow-2xl animate-in fade-in slide-in-from-top-2 overflow-hidden flex flex-col max-h-[85vh]">
                <div className="px-4 py-3 flex justify-between items-center border-b border-border bg-paper-sunken shrink-0">
                  <div className="font-bold text-sm">الإشعارات والتنبيهات</div>
                  {unreadCount > 0 && (
                    <button onClick={() => markAllAsRead.mutate(activeFarm?.id || "")} className="text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline">
                      تحديد الكل كمقروء
                    </button>
                  )}
                </div>
                
                <div className="overflow-y-auto flex-1">
                  {(!notifications || notifications.length === 0) ? (
                    <div className="px-4 py-10 text-center text-sm text-ink-muted flex flex-col items-center">
                      <Icons.Bell className="h-8 w-8 mb-2 opacity-20" />
                      لا توجد إشعارات حالياً.
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex gap-3 ${!n.isRead ? 'bg-sky-50/30 dark:bg-sky-900/10' : ''}`}
                          onClick={() => {
                            if (!n.isRead) markAsRead.mutate(n.id);
                          }}
                        >
                          <div className="shrink-0 mt-1">
                            {n.category === 'agricultural' ? <Icons.Sprout className={`h-5 w-5 ${n.priority === 'critical' ? 'text-danger' : 'text-crop-600'}`} /> : 
                             n.category === 'financial' ? <Icons.Wallet className={`h-5 w-5 ${n.priority === 'critical' ? 'text-danger' : 'text-amber-500'}`} /> : 
                             <Icons.Info className="h-5 w-5 text-sky-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-tight ${!n.isRead ? 'font-bold text-ink' : 'font-medium text-ink-muted'}`}>{n.title}</p>
                            <p className="text-xs text-ink-muted mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-ink-faint mt-1.5">{formatDistanceToNow(new Date(n.date), { addSuffix: true, locale: ar })}</p>
                          </div>
                          {!n.isRead && <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-1.5"></div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative ms-1" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 md:h-9 md:w-9 items-center justify-center rounded-full transition-all hover:ring-4 hover:ring-sky-500/20 p-0.5 md:p-0"
            >
              <span className="flex h-full w-full items-center justify-center rounded-full bg-sky-600 text-white font-bold text-sm shadow-sm border-2 border-paper">
                {owner?.name?.[0] || user?.email?.[0]?.toUpperCase() || <Icons.User className="h-4 w-4" />}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute end-0 top-full z-20 mt-2 w-64 rounded-2xl border border-border bg-paper-raised p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 mb-2 border-b border-border/50 bg-paper-sunken/50 rounded-xl">
                  <p className="text-sm font-bold text-ink truncate">{owner?.name || user?.displayName || "المستخدم"}</p>
                  <p className="text-xs text-ink-muted truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="h-px bg-border/50 my-1 mx-2" />
                
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setUserDialogOpen(true);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <Icons.User className="h-5 w-5 text-ink-muted" />
                    تعديل البيانات الشخصية
                  </div>
                </button>

                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <Icons.Settings className="h-5 w-5 text-ink-muted" />
                    إعدادات النظام المتقدمة
                  </div>
                </Link>

                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    if (user?.email) {
                      try {
                        const { sendPasswordResetEmail } = await import("firebase/auth");
                        const { auth } = await import("@/lib/firebase/client");
                        await sendPasswordResetEmail(auth, user.email);
                        const { toast } = await import("sonner");
                        toast.success("تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني بنجاح.");
                      } catch (error) {
                        const { toast } = await import("sonner");
                        toast.error("حدث خطأ أثناء إرسال الرابط.");
                      }
                    } else {
                      const { toast } = await import("sonner");
                      toast.error("لا يوجد بريد إلكتروني مرتبط بالحساب.");
                    }
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-ink-muted" />
                    تغيير كلمة المرور
                  </div>
                </button>

                <Link
                  href="/settings?tab=subscription"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-ink-muted" />
                    الفواتير والاشتراك
                  </div>
                </Link>

                <div className="h-px bg-border/50 my-1 mx-2" />

                <button
                  onClick={() => toggleTheme()}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? <Icons.Moon className="h-5 w-5 text-ink-muted" /> : <Icons.Sun className="h-5 w-5 text-ink-muted" />}
                    المظهر الداكن
                  </div>
                  <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${theme === "dark" ? "bg-crop-500" : "bg-black/20 dark:bg-white/20"}`}>
                    <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform", theme === "dark" ? "-translate-x-1" : "-translate-x-4")} />
                  </div>
                </button>
                <div className="h-px bg-border/50 my-1 mx-2" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-danger hover:bg-danger-bg hover:text-danger rounded-xl font-bold px-4 py-2.5 h-auto text-sm"
                  onClick={() => signOut()}
                >
                  <Icons.LogOut className="h-5 w-5 me-3" />
                  تسجيل الخروج
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Omni-Add Global Dialog */}
      <OmniAddMenu open={omniOpen} onOpenChange={setOmniOpen} />

      {/* Global Farm Dialog */}
      <FarmDialog open={farmDialogOpen} onOpenChange={setFarmDialogOpen} />

      {/* Global User Profile Dialog */}
      <UserProfileDialog 
        open={userDialogOpen} 
        onOpenChange={setUserDialogOpen}
        profile={owner}
        email={user?.email || undefined}
        onSave={handleSaveProfile}
        isSaving={saveProfile.isPending}
      />
    </>
  );
}
