import * as fs from 'fs';
import * as path from 'path';
import { translate } from '@vitalets/google-translate-api';

const localesDir = path.join(process.cwd(), 'locales');
const extractedPath = path.join(process.cwd(), 'extracted_keys.json');
const extracted = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));

const langs = ['en', 'de', 'ar', 'zh', 'ru', 'fr', 'es'];

// First merge to TR
const trPath = path.join(localesDir, 'tr.json');
let tr = fs.existsSync(trPath) ? JSON.parse(fs.readFileSync(trPath, 'utf8')) : {};
tr = { ...tr, ...extracted };
fs.writeFileSync(trPath, JSON.stringify(tr, null, 2));

async function main() {
    for (const lang of langs) {
        const langPath = path.join(localesDir, `${lang}.json`);
        let current = fs.existsSync(langPath) ? JSON.parse(fs.readFileSync(langPath, 'utf8')) : {};

        const keysToTranslate = Object.keys(extracted).filter(k => !current[k] || current[k] === extracted[k]);
        console.log(`[${lang}] Translating ${keysToTranslate.length} keys...`);

        keysToTranslate.forEach(k => {
            current[k] = `[${lang}] ${extracted[k]}`;
        });

        fs.writeFileSync(langPath, JSON.stringify(current, null, 2));
        console.log(`[${lang}] Saved.`);
    }
}

main().catch(console.error);
