import Image from "next/image";
import { cn } from "@/lib/utils";
import logoImg from "../../../public/logo-rounded.png";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div className="relative shrink-0 w-10 h-10 drop-shadow-md transition-transform hover:scale-105">
        <Image
          src={logoImg}
          alt="شعار منصة حصادي"
          fill
          sizes="40px"
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
      {showText && (
        <span className="text-2xl font-extrabold text-ink tracking-tight font-display">
          حصادي
        </span>
      )}
    </div>
  );
}
