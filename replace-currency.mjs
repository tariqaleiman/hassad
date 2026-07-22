import fs from 'fs/promises';
import path from 'path';

async function walk(dir) {
  let results = [];
  const list = await fs.readdir(dir);
  for (let file of list) {
    file = path.resolve(dir, file);
    const stat = await fs.stat(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(await walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  }
  return results;
}

async function processFile(file) {
  let content = await fs.readFile(file, 'utf8');
  if (!content.includes('ج.م')) return;

  console.log('Processing:', file);

  // Exclude utils, store, locales
  if (file.includes('lib\\utils') || file.includes('lib\\store') || file.includes('lib\\hooks') || file.includes('i18n') || file.includes('setup')) {
    return;
  }

  // Check if we need to add import
  let needsImport = !content.includes('useCurrency');
  
  // Try to find the main component declaration to inject the hook
  const componentMatch = content.match(/export\s+(?:default\s+)?(?:function|const)\s+([A-Z][a-zA-Z0-9_]*)/);
  let injectedHook = false;

  if (componentMatch && !content.includes('const { formatMoney') && !content.includes('const { currency }')) {
    const componentName = componentMatch[1];
    const funcRegex = new RegExp(`(export\\s+(?:default\\s+)?(?:function|const)\\s+${componentName}\\s*\\([^)]*\\)\\s*(?::\\s*[A-Za-z<>]+)?\\s*(?:=>\\s*)?\\{\n)`);
    if (funcRegex.test(content)) {
      content = content.replace(funcRegex, `$1  const { formatMoney, currency } = useCurrency();\n`);
      injectedHook = true;
    }
  }

  // Replace {something.toLocaleString()} ج.م with {formatMoney(something)}
  content = content.replace(/\{([^}]+)\.toLocaleString\(\)\}\s*ج\.م/g, '{formatMoney($1)}');
  content = content.replace(/\{([^}]+)\?.toLocaleString\(\)\}\s*ج\.م/g, '{formatMoney($1)}');
  content = content.replace(/\{([^}]+)\.toLocaleString\(\)\}\s*<span[^>]*>ج\.م<\/span>/g, '{formatMoney($1)}');

  // Replace string combinations like `${...} ج.م` with `${...} ${currency}`
  content = content.replace(/\}\s*ج\.م/g, '} ${currency}');

  // Replace JSX text like (ج.م) with ({currency})
  content = content.replace(/\(ج\.م\)/g, '({currency})');
  
  // Replace raw 'ج.م' string with currency variable where safe
  // Like `>100 ج.م<` -> `>100 {currency}<`
  content = content.replace(/>([^<]*[0-9]+[^<]*)\s*ج\.م\s*</g, '>$1 {currency}<');
  
  // If we changed anything and need import
  if (injectedHook && needsImport) {
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLine + 1) + 'import { useCurrency } from "@/lib/hooks/use-currency";\n' + content.slice(endOfLine + 1);
    } else {
      content = 'import { useCurrency } from "@/lib/hooks/use-currency";\n' + content;
    }
  }

  await fs.writeFile(file, content, 'utf8');
}

async function run() {
  const files = await walk('d:/WebApps/HassadApp/src');
  for (const file of files) {
    try {
      await processFile(file);
    } catch (e) {
      console.error('Error in', file, e.message);
    }
  }
}

run();
