const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'src/app/(dashboard)');
const folders = fs.readdirSync(dashboardPath);

for (const folder of folders) {
  const pagePath = path.join(dashboardPath, folder, 'page.tsx');
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // Find if it has the No Farms empty state
    if (content.includes('p-6 text-center text-ink-muted')) {
      // Need to make sure MapPin and EmptyState are imported.
      if (!content.includes('import { EmptyState }')) {
        content = content.replace(/(import.*?;?\n)(?!import)/, '$1import { EmptyState } from "@/components/ui/empty-state";\n');
      }
      if (!content.includes('MapPin')) {
        // Find lucide-react import
        if (content.includes('lucide-react')) {
          content = content.replace(/import\s+{([^}]*)}\s+from\s+["']lucide-react["']/, (match, p1) => {
            if (p1.includes('MapPin')) return match;
            return `import { ${p1.trim()}, MapPin } from "lucide-react"`;
          });
        } else {
          content = content.replace(/(import.*?;?\n)(?!import)/, '$1import { MapPin } from "lucide-react";\n');
        }
      }

      content = content.replace(
        /<div className="p-6 text-center text-ink-muted">[\s\S]*?يرجى إضافة مزرعة أولاً للوصول إلى [^\n]+[\s\S]*?<\/div>/g,
        `<EmptyState icon={MapPin} title="لا توجد مزارع" description="يرجى إضافة مزرعة أولاً للوصول إلى هذا القسم." />`
      );
      content = content.replace(
        /<div className="p-6 text-center text-ink-muted">[\s\S]*?يرجى إضافة مزرعة أولاً للوصول للعملاء.[\s\S]*?<\/div>/g,
        `<EmptyState icon={MapPin} title="لا توجد مزارع" description="يرجى إضافة مزرعة أولاً للوصول إلى هذا القسم." />`
      );
      // For any other general ones:
      content = content.replace(
        /<div className="p-6 text-center text-ink-muted">[\s\S]*?يرجى إضافة مزرعة أولاً[\s\S]*?<\/div>/g,
        `<EmptyState icon={MapPin} title="لا توجد مزارع" description="يرجى إضافة مزرعة أولاً للوصول إلى هذا القسم." />`
      );

      fs.writeFileSync(pagePath, content);
      console.log(`Updated ${folder}/page.tsx`);
    }
  }
}
