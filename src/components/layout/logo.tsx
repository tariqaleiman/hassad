import Image from "next/image";
import { cn } from "@/lib/utils";
import logoImg from "../../../public/logo-rounded.png";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex items-center justify-center h-10 w-10 shrink-0 rounded-2xl bg-gradient-to-br from-crop-600 to-crop-700 p-2 shadow-md shadow-crop-900/20 border border-crop-400/30 dark:border-crop-500/30 overflow-hidden">
        <Image
          src={logoImg}
          alt="شعار منصة حصادي"
          fill
          sizes="40px"
          style={{ objectFit: "contain" }}
          className="p-0.5"
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
