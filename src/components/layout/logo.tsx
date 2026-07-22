import Image from "next/image";
import { cn } from "@/lib/utils";
import logoImg from "../../../public/logo-trans.png";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex items-center justify-center h-8 w-8 shrink-0">
        <Image
          src={logoImg}
          alt="شعار نظام حصادي"
          fill
          sizes="32px"
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
      {showText && (
        <span
          className="text-2xl font-bold text-ink tracking-tight font-display"
        >
          حصادي
        </span>
      )}
    </div>
  );
}
