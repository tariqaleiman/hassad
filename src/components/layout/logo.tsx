import Image from "next/image";
import { cn } from "@/lib/utils";
import logoImg from "../../../public/logo-trans.png";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="relative flex items-center justify-center h-6 w-6 shrink-0">
        <Image
          src={logoImg}
          alt="شعار نظام حصاد"
          fill
          sizes="16px"
          style={{ objectFit: "contain" }}
          className="dark:invert dark:hue-rotate-180 dark:brightness-110"
          priority
        />
      </div>
      {showText && (
        <span
          className="text-[1.7rem] font-bold text-ink tracking-tight"
          style={{ fontFamily: "var(--font-cairo, sans-serif)" }}
        >
          حصاد
        </span>
      )}
    </div>
  );
}
