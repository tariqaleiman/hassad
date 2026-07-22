"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/ui/icons";
import { toast } from "sonner";

export function FeedbackSheet() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"suggestion" | "bug">("suggestion");
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [hasVoiceNote, setHasVoiceNote] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message && !hasVoiceNote) {
      toast.error("يرجى إدخال رسالة أو تسجيل بصمة صوتية.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setOpen(false);
      setMessage("");
      setHasVoiceNote(false);
      toast.success(
        type === "suggestion"
          ? "نشكرك على الاقتراح! تم إرساله لمالك المنظومة."
          : "تم استلام البلاغ! سيتعامل معه الفريق فوراً."
      );
    }, 1000);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast.info("جاري التسجيل الصوتي...");
      setTimeout(() => {
        setIsRecording(false);
        setHasVoiceNote(true);
        toast.success("تم تسجيل الرسالة الصوتية بنجاح");
      }, 3000);
    } else {
      setIsRecording(false);
      setHasVoiceNote(true);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-6 end-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-crop-600 hover:bg-crop-700 text-white font-bold text-sm shadow-xl shadow-crop-600/30 hover:scale-105 transition-all duration-300 border-2 border-white/20"
        title="إرسال اقتراح أو الإبلاغ عن مشكلة"
      >
        <Icons.MessageSquare className="w-5 h-5" />
        <span className="hidden sm:inline">اقتراح أو بلاغ</span>
      </button>

      {/* Modal / Sheet Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div
            className="w-full max-w-lg bg-paper p-6 sm:p-8 rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Icons.MessageSquare className="w-5 h-5 text-crop-600" />
                <h3 className="font-bold text-lg text-ink font-display">رأيك يهمنا ويطور حصادي</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-paper-sunken flex items-center justify-center text-ink-muted hover:text-ink font-bold"
              >
                <Icons.Close className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("suggestion")}
                  className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    type === "suggestion"
                      ? "border-crop-500 bg-crop-50 dark:bg-crop-900/40 text-crop-800 dark:text-crop-300 shadow-sm"
                      : "border-border text-ink-muted hover:border-crop-300"
                  }`}
                >
                  <Icons.Info className="w-4 h-4 text-crop-600" />
                  <span>اقتراح تحسين</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType("bug")}
                  className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    type === "bug"
                      ? "border-red-500 bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-300 shadow-sm"
                      : "border-border text-ink-muted hover:border-red-300"
                  }`}
                >
                  <Icons.Info className="w-4 h-4 text-red-500" />
                  <span>الإبلاغ عن مشكلة</span>
                </button>
              </div>

              {/* Message Entry */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-ink">
                  {type === "suggestion" ? "اكتب تفاصيل اقتراحك بالفكرة الجديدة:" : "اشرح المشكلة التي واجهتك:"}
                </label>
                <Textarea
                  rows={4}
                  placeholder={type === "suggestion" ? "مثال: أتمنى إضافة خاصية..." : "مثال: الشاشة لا تفتح عند الضغط على..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* Voice Note Option */}
              <div className="bg-paper-sunken/60 p-4 rounded-xl border border-border/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-ink">رسالة صوتية سريعة</p>
                  <p className="text-[11px] text-ink-muted">
                    {hasVoiceNote ? "تم تسجيل الملاحظة الصوتية (3 ثوانٍ)" : "اضغط للبدء في التحدث بالملاحظة"}
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={toggleRecording}
                  variant={hasVoiceNote ? "primary" : "outline"}
                  className={`rounded-xl text-xs gap-1.5 ${isRecording ? "animate-pulse bg-red-600 text-white" : ""}`}
                >
                  <span>{isRecording ? "جاري التسجيل..." : hasVoiceNote ? "تم التسجيل" : "تسجيل صوتي"}</span>
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="rounded-xl text-xs"
                >
                  إلغاء
                </Button>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl px-6 font-bold bg-crop-600 hover:bg-crop-700 text-white text-xs gap-2"
                >
                  {submitting ? <Icons.Spinner className="w-4 h-4 animate-spin" /> : "إرسال البلاغ فوراً"}
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
