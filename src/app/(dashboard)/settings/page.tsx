"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Calculator, 
  Settings as SettingsIcon, 
  Users, 
  Crown,
  MapPin,
  User as UserIcon,
  ChevronRight
} from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

// Tabs Components
import { CompanyTab } from "@/components/settings/tabs/company-tab";
import { FarmsTab } from "@/components/settings/tabs/farms-tab";
import { AccountingTab } from "@/components/settings/tabs/accounting-tab";
import { SystemTab } from "@/components/settings/tabs/system-tab";
import { UsersTab } from "@/components/settings/tabs/users-tab";
import { SubscriptionTab } from "@/components/settings/tabs/subscription-tab";

type SettingsTab = "company" | "farms" | "accounting" | "system" | "users" | "subscription";

const tabs = [
  { id: "company", label: "الملف الشخصي والمنشأة", icon: UserIcon },
  { id: "farms", label: "إدارة الفروع والمزارع", icon: MapPin },
  { id: "accounting", label: "المحاسبة والضرائب", icon: Calculator },
  { id: "system", label: "تفضيلات النظام", icon: SettingsIcon },
  { id: "users", label: "المستخدمين والصلاحيات", icon: Users },
  { id: "subscription", label: "الباقة والاشتراك", icon: Crown },
];

function SettingsHubContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as SettingsTab) || "company";

  const handleTabChange = (tabId: string) => {
    router.push(`${pathname}?tab=${tabId}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "company": return <CompanyTab />;
      case "farms": return <FarmsTab />;
      case "accounting": return <AccountingTab />;
      case "system": return <SystemTab />;
      case "users": return <UsersTab />;
      case "subscription": return <SubscriptionTab />;
      default: return <CompanyTab />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Simple Professional Header */}
      <div className="flex flex-col gap-2 pb-6 border-b border-border/50">
        <h1 className="text-3xl font-bold font-display text-ink flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-ink-muted" />
          الإعدادات
        </h1>
        <p className="text-ink-muted">
          إدارة إعدادات حسابك، المنشأة، الفروع، التفضيلات المالية، والمستخدمين.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 hide-scrollbar sticky top-24">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  style={active ? { borderColor: "var(--crop-600)" } : {}}
                  className={cn(
                    "flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-medium transition-all text-start whitespace-nowrap",
                    active
                      ? "bg-[var(--crop-600)]/15 text-[var(--crop-600)] font-bold border-r-4"
                      : "text-ink-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-ink border-r-4 border-transparent"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-[var(--crop-600)] fill-[var(--crop-600)]/20" : "opacity-60")} />
                  <span className="flex-1">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default function SettingsHubPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-10"><Spinner className="h-6 w-6 text-[var(--crop-600)]" /></div>}>
      <SettingsHubContent />
    </Suspense>
  );
}
