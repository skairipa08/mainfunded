import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'locales');
const enPath = path.join(localesDir, 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const langsToFix = ['de', 'ar', 'fr', 'es', 'zh', 'ru'];

langsToFix.forEach(lang => {
    const langPath = path.join(localesDir, `${lang}.json`);
    if (!fs.existsSync(langPath)) {
        console.log(`Missing ${lang}.json`);
        return;
    }
    const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));

    function mergeMissing(target, source) {
        if (Array.isArray(source)) {
            if (!Array.isArray(target) || target.length === 0) {
                return source; // use source array if target missing/empty
            }
            return target; // Keep target if it has elements
        }

        if (source !== null && typeof source === 'object') {
            const result = target && typeof target === 'object' && !Array.isArray(target) ? { ...target } : {};
            for (const key in source) {
                if (result[key] === undefined) {
                    result[key] = source[key];
                } else {
                    result[key] = mergeMissing(result[key], source[key]);
                }
            }
            return result;
        }
        return target !== undefined ? target : source;
    }

    const merged = mergeMissing(langData, enData);
    fs.writeFileSync(langPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
    console.log(`Fixed ${lang}.json`);
});

console.log('All done');
