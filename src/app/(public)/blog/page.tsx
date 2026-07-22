import Link from "next/link";
import { Button } from "@/components/ui/button";

export const sampleArticles = [
  {
    slug: "how-to-manage-daily-farm-labor",
    title: "كيف تدير يوميات العمالة ومقاول الأنفار وتخفض تكاليفك 20%؟",
    category: "إرشادات زراعية",
    categoryBadge: "إرشادات زراعية",
    date: "22 يوليو 2026",
    readTime: "4 دقائق",
    excerpt: "تعلم الأسلوب الأنسب لحساب يومية المقاول، وتوثيق عدد العمال والدفع الآجل في النوتة لضمان عدم ضياع حقوقك وتوفير المصاريف.",
  },
  {
    slug: "pre-purchasing-fertilizer-strategy",
    title: "استراتيجية الشراء المسبق للأسمدة والتقاوي قبل مواعيد الزراعة",
    category: "شروحات النظام",
    categoryBadge: "شروحات النظام",
    date: "20 يوليو 2026",
    readTime: "5 دقائق",
    excerpt: "خطوات الشراء المبكر وتخزين مستلزمات الزراعة في مخزن الغيط، وكيف يسحب منها نظام حصادي أوتوماتيكياً عند تنفيذ العملية.",
  },
  {
    slug: "hassady-v2-release-notes",
    title: "إطلاق تحديث حصادي 2.0: وضع المزارع البسيط والتكامل المحلي",
    category: "تحديثات النظام",
    categoryBadge: "تحديثات النظام",
    date: "15 يوليو 2026",
    readTime: "3 دقائق",
    excerpt: "استعراض المميزات الجديدة في التحديث الأخير: التبديل السريع بين الوضع البسيط والاحترافي، وتحديد مسار التخزين المحلي.",
  },
];

export default function BlogListPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-block px-4 py-1.5 rounded-full bg-crop-100 dark:bg-crop-900/40 text-crop-800 dark:text-crop-300 text-xs font-bold border border-crop-200 dark:border-crop-800">
          مدونة وشروحات حصادي
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-ink">
          المقالات، الشروحات، وتحديثات المنظومة
        </h1>
        <p className="text-ink-muted text-base leading-relaxed">
          مقالات خبيرة في التسميد والري وإدارة العمالة والمصروفات، إلى جانب شروحات استخدام منصة حصادي لتطوير مزرعتك.
        </p>
      </div>

      {/* Categories Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" className="rounded-xl font-bold bg-crop-600">الكل</Button>
        <Button variant="outline" className="rounded-xl font-bold">تحديثات النظام</Button>
        <Button variant="outline" className="rounded-xl font-bold">إرشادات زراعية</Button>
        <Button variant="outline" className="rounded-xl font-bold">شروحات وافية</Button>
        <Button variant="outline" className="rounded-xl font-bold">قصص النجاح</Button>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sampleArticles.map((article) => (
          <article key={article.slug} className="bg-paper rounded-3xl border border-border/80 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span className="font-bold px-3 py-1 rounded-full bg-crop-50 dark:bg-crop-900/30 text-crop-800 dark:text-crop-300 border border-crop-200 dark:border-crop-800">
                  {article.categoryBadge}
                </span>
                <span>{article.readTime} قراءة</span>
              </div>

              <h2 className="text-xl font-bold text-ink group-hover:text-crop-600 transition-colors leading-snug">
                <Link href={`/blog/${article.slug}`}>
                  {article.title}
                </Link>
              </h2>

              <p className="text-sm text-ink-muted leading-relaxed line-clamp-3">
                {article.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs text-ink-muted">
              <span>{article.date}</span>
              <Link href={`/blog/${article.slug}`} className="font-bold text-crop-600 hover:underline flex items-center gap-1">
                <span>اقرأ المزيد</span>
                <span className="rtl:rotate-180">←</span>
              </Link>
            </div>
          </article>
        ))}
      </div>

    </div>
  );
}
