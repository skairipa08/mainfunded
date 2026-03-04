import * as fs from 'fs';
import * as path from 'path';

function walkDir(dir: string, callback: (filepath: string) => void) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
            callback(dirPath);
        }
    });
}

['app', 'components'].forEach(dir => {
    walkDir(path.join(process.cwd(), dir), (filePath) => {
        let content = fs.readFileSync(filePath, 'utf8');

        let changed = false;

        // Sometimes useTranslation is imported from 'next-i18next' or '@/lib/i18n' while also imported from '@/lib/i18n/context'
        const matches = content.match(/useTranslation/g);
        if (matches && content.split('import').filter(x => x.includes('useTranslation') && x.includes('from')).length > 1) {
            // Clean up `useTranslation` from the middle of other imports
            content = content.replace(/useTranslation,\s*/g, '');
            content = content.replace(/,\s*useTranslation/g, '');

            // Now add exactly one raw import at the top
            content = content.replace(/import\s+{\s*useTranslation\s*}\s+from\s+['"][^'"]+['"];?\s*\n/g, '');

            // Remove empty imports that were left behind
            content = content.replace(/import\s+{\s*}\s+from\s+['"][^'"]+['"];?\s*\n/g, '');

            // Inject the correct one under the first import
            content = content.replace(/^(import.*)$/m, `$1\nimport { useTranslation } from "@/lib/i18n/context";`);
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(filePath, content);
            console.log('Fixed duplicate import in', filePath);
        }
    });
});
