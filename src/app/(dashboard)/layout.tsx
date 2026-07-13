"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/providers/auth-provider";
import { navItems } from "@/components/layout/nav-items";
import { isFirebaseConfigured } from "@/lib/firebase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setMobileOpen(true); // Always ensure mobile drawer can open if on mobile
    setDesktopSidebarOpen(!desktopSidebarOpen); // Toggle desktop version
  };

  useEffect(() => {
    if (!loading && !user && isFirebaseConfigured) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const title = navItems.find((n) => n.href === pathname)?.label ?? "حصاد";

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-paper">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user && isFirebaseConfigured) {
    return null;
  }

  return (
    <div className="h-dvh bg-paper text-ink overflow-hidden relative">
      {/* شريط العنوان العلوي (مطلق ليغطي المحتوى ويسمح بتأثير الزجاج) */}
      <div className="absolute top-0 left-0 right-0 w-full z-50">
        <Topbar onMenuClick={toggleSidebar} />
      </div>

      <div className="flex h-full w-full">
        {/* القائمة الجانبية الثابتة */}
        {desktopSidebarOpen && (
          <div className="hidden md:block h-full w-64 shrink-0 z-40 bg-paper border-e border-border/40">
            <div className="pt-14 h-full overflow-y-auto">
              <Sidebar />
            </div>
          </div>
        )}

        {/* القائمة الجانبية للموبايل */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div
              className="absolute inset-0 bg-black/50 transition-opacity"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative z-10 h-full w-64 bg-paper animate-in slide-in-from-start-4 pt-14">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* منطقة المحتوى الرئيسية */}
        <main className="flex-1 h-full overflow-y-auto scroll-smooth bg-paper pb-16 md:pb-0">
          {/* مسافة فارغة لتفادي اختفاء المحتوى تحت شريط العنوان في البداية */}
          <div className="h-14 w-full shrink-0"></div>
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* شريط التنقل السفلي للموبايل */}
      <BottomNav />
    </div>
  );
}
