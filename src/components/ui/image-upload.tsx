"use client";

import { useState, useRef } from "react";
import { Camera, Image as ImageIcon, Loader2, X } from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/providers/auth-provider";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  type?: "avatar" | "logo";
  className?: string;
}

export function ImageUpload({ value, onChange, type = "avatar", className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user) {
      toast.error("يجب تسجيل الدخول لرفع الصور.");
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً. الحد الأقصى هو 2 ميجابايت.");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const ext = file.name.split('.').pop();
      const path = `${type}s/${user.uid}_${Date.now()}.${ext}`;
      const storageRef = ref(storage, path);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (error) => {
          console.error("Upload error:", error);
          toast.error("حدث خطأ أثناء رفع الصورة.");
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onChange(downloadURL);
          setIsUploading(false);
          toast.success("تم رفع الصورة بنجاح");
        }
      );
    } catch (error) {
      console.error(error);
      setIsUploading(false);
      toast.error("حدث خطأ غير متوقع.");
    }
  };

  // User requested Company Logo to be circular as well
  const roundedClass = "rounded-full";
  const isLogo = type === "logo";

  return (
    <div className={cn("relative group", className)}>
      <div 
        className={cn(
          "relative overflow-hidden flex items-center justify-center border-2 border-dashed border-border/60 bg-paper-sunken cursor-pointer transition-colors hover:border-crop-600",
          roundedClass,
          value ? "border-solid border-border/30 bg-paper" : "",
          isUploading ? "opacity-70 pointer-events-none" : ""
        )}
        onClick={() => fileInputRef.current?.click()}
        style={{ width: "100%", height: "100%" }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={value} 
            alt="Upload" 
            className={cn("w-full h-full", isLogo ? "object-contain p-3 bg-white dark:bg-transparent" : "object-cover")} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-ink-muted p-4">
            {type === "avatar" ? <Camera className="h-8 w-8 mb-2 opacity-50" /> : <ImageIcon className="h-8 w-8 mb-2 opacity-50" />}
            <span className="text-[10px] font-bold uppercase tracking-wider text-center">اختر صورة</span>
          </div>
        )}

        {/* Hover overlay */}
        {!isUploading && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 mb-1" />
            <span className="text-xs font-bold">{value ? "تغيير الصورة" : "رفع صورة"}</span>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="absolute inset-0 bg-paper/80 flex flex-col items-center justify-center backdrop-blur-sm z-10">
            <Loader2 className="h-6 w-6 text-crop-600 animate-spin mb-2" />
            <span className="text-xs font-bold text-crop-700">{Math.round(progress)}%</span>
          </div>
        )}
      </div>

      {value && !isUploading && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
          }}
          className="absolute -top-2 -end-2 h-6 w-6 rounded-full bg-danger text-white flex items-center justify-center shadow-sm hover:bg-danger/90 transition-colors z-20 border-2 border-paper"
          aria-label="إزالة الصورة"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />
    </div>
  );
}
