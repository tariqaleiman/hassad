import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { sampleArticles } from "../page";

export async function generateStaticParams() {
  return sampleArticles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function SingleArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = sampleArticles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 font-sans">
      
      {/* Back Button & Category */}
      <div className="flex items-center justify-between">
        <Link href="/blog">
          <Button variant="ghost" className="gap-2 rounded-xl text-ink-muted">
            <span className="rtl:rotate-180">←</span>
            <span>العودة للمدونة</span>
          </Button>
        </Link>

        <span className="font-bold text-xs px-3.5 py-1.5 rounded-full bg-crop-100 dark:bg-crop-900/40 text-crop-800 dark:text-crop-300 border border-crop-200">
          {article.categoryBadge}
        </span>
      </div>

      {/* Article Header */}
      <div className="space-y-4 border-b border-border/50 pb-8 text-start">
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-ink leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 text-xs text-ink-muted pt-2">
          <span>نُشر في: {article.date}</span>
          <span>•</span>
          <span>زمن القراءة: {article.readTime}</span>
          <span>•</span>
          <span>بقلم: خبير حصادي الزراعي</span>
        </div>
      </div>

      {/* Article Content Body */}
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-ink-muted leading-relaxed text-base">
        <p className="text-xl font-medium text-ink leading-relaxed">
          {article.excerpt}
        </p>

        <h2 className="text-2xl font-bold text-ink pt-4 font-display">
          1. تنظيم نموذج يوميات العمالة والمقاولين
        </h2>
        <p>
          العملية الزراعية تعتمد كثيراً على التوفير والتنظيم المسبق. حين تحضر مقاولاً ومعه مجموعة عمال، لا تترك الحسابات بدون توثيق دقيق بنفس اليوم.
        </p>

        <div className="bg-paper-sunken p-6 rounded-2xl border border-border/80 my-6 space-y-2">
          <h3 className="font-bold text-ink text-lg flex items-center gap-2">
            <Icons.Info className="w-5 h-5 text-crop-600" />
            <span>نصيحة حصادي العملية:</span>
          </h3>
          <p className="text-sm">
            استخدم نموذج "يومية المقاول المجمعة" في تطبيق حصادي بفتح شاشة واحدة تدخل فيها: (عدد العمال × يومية العامل + يومية المقاول)، وحدد إن كان المبلغ كاش أو آجل نوتة.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-ink pt-4 font-display">
          2. توثيق الديون في دفتر النوتة
        </h2>
        <p>
          تأجيل الدفع حتى موسم الحصاد هو سلوك شائع في السوق العربي. ولكن عدم تسجيل الآجل يخلق خلافات مالية عند التصفية. تسجيل الحركة فوراً يحفظ حقوقك وحقوق التجار والعمال.
        </p>
      </div>

      {/* Share & Footer CTA */}
      <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm font-bold text-ink">هل أعجبك المقال؟ شاركه مع إخوانك المزارعين:</p>
        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(article.title)}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-2"
          >
            <Icons.MessageSquare className="w-4 h-4" />
            <span>مشاركة عبر الواتساب</span>
          </a>
        </div>
      </div>

    </article>
  );
}
