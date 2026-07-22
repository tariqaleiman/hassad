"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/ui/icons";
import { toast } from "sonner";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    governorate: "",
    requestType: "sales",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("تم إرسال رسالتك بنجاح! سيتواصل معك فريق الدعم الفني فوراً.");
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Page Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-crop-100 dark:bg-crop-900/40 text-crop-800 dark:text-crop-300 text-xs font-bold border border-crop-200">
          <Icons.Phone className="w-4 h-4 text-crop-600" />
          <span>تواصل معنا والدعم الفني</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-ink">
          نحن هنا لمساعدتك في كل خطوة
        </h1>
        <p className="text-ink-muted text-base leading-relaxed">
          سواء كان لديك استفسار عن النظام، تريد تجربة العرض التوضيحي، أو تحتاج مساعدة في إعداد مزرعتك، فريقنا جاهز للرد الفوري.
        </p>
      </div>

      {/* Main Grid: Form + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Contact Form Card */}
        <div className="bg-paper p-8 rounded-3xl border border-border/80 shadow-xl space-y-6">
          <h2 className="text-2xl font-bold font-display text-ink">أرسل استفسارك مباشرة</h2>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-crop-50 dark:bg-crop-900/30 border border-crop-200 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-crop-500 text-white rounded-full flex items-center justify-center mx-auto">
                <Icons.CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-crop-900 dark:text-crop-200">شغلك في أمان وتم الاستلام!</h3>
              <p className="text-sm text-crop-800 dark:text-crop-300">
                شكراً لتواصلك يا حاج. سيتصل بك مهندس متخصص من فريق حصادي على رقم هاتفك في أقرب وقت.
              </p>
              <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-xl mt-2">
                إرسال استفسار آخر
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-1.5">الاسم بالكامل <span className="text-danger">*</span></label>
                <Input
                  required
                  placeholder="مثال: الحاج أحمد محمود"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-xl py-5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5">رقم الهاتف / الواتساب <span className="text-danger">*</span></label>
                  <Input
                    required
                    type="tel"
                    dir="ltr"
                    placeholder="+20 1xxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-xl py-5 text-end"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5">المحافظة / المركز</label>
                  <Input
                    placeholder="مثال: المنيا / البحيرة"
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                    className="rounded-xl py-5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-1.5">نوع الاستفسار</label>
                <select
                  value={formData.requestType}
                  onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                  className="w-full rounded-xl border border-border bg-paper p-3 text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-crop-500"
                >
                  <option value="sales">طلب عرض توضيحي وتجربة النظام</option>
                  <option value="support">دعم فني وتدريب على النظام</option>
                  <option value="company">باقة شركات وتعدد مزارع</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-1.5">تفاصيل الاستفسار أو الملاحظة</label>
                <Textarea
                  rows={4}
                  placeholder="اكتب استفسارك هنا..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl py-6 text-base font-bold bg-crop-600 hover:bg-crop-700 text-white shadow-lg shadow-crop-600/30"
              >
                {loading ? <Icons.Spinner className="w-5 h-5 animate-spin" /> : "إرسال الاستفسار فوراً"}
              </Button>
            </form>
          )}
        </div>

        {/* Support Channels & Hotline Info */}
        <div className="space-y-8">
          
          {/* Direct WhatsApp Channel */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Icons.MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">تواصل فوري عبر الواتساب</h3>
                <p className="text-xs text-emerald-100">استجابة فورية خلال دقائق مع مهندس متخصص</p>
              </div>
            </div>

            <p className="text-sm text-emerald-100 leading-relaxed">
              إذا كنت تفضل المحادثة المباشرة دون ملء نماذج، يمكنك مراسلتنا فوراً عبر حساب الواتساب الرسمي المخصص لدعم المزارعين.
            </p>

            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-emerald-900 font-extrabold text-sm shadow-md hover:bg-emerald-50 transition-all"
            >
              <span>افتح محادثة الواتساب الآن</span>
              <span className="rtl:rotate-180">←</span>
            </a>
          </div>

          {/* Hotline & Response SLA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-paper border border-border/80 shadow-sm space-y-2">
              <p className="text-xs font-bold text-ink-muted flex items-center gap-1.5">
                <Icons.Phone className="w-4 h-4 text-crop-600" />
                <span>الخط الساخن والهاتف</span>
              </p>
              <p className="text-lg font-bold text-ink" dir="ltr">+20 100 000 0000</p>
              <p className="text-xs text-ink-muted">طوال أيام الأسبوع من 8 صباحاً حتى 10 مساءً</p>
            </div>

            <div className="p-6 rounded-2xl bg-paper border border-border/80 shadow-sm space-y-2">
              <p className="text-xs font-bold text-ink-muted flex items-center gap-1.5">
                <Icons.Clock className="w-4 h-4 text-crop-600" />
                <span>معدل زمن الاستجابة</span>
              </p>
              <p className="text-lg font-bold text-crop-600">أقل من 15 دقيقة</p>
              <p className="text-xs text-ink-muted">فريق الدعم الفني متفرغ لخدمتك</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
