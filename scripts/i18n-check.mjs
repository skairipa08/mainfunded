import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
// List of required locales
const REQUIRED_LOCALES = ['tr', 'en', 'de', 'ar', 'fr', 'es', 'zh', 'ru'];

// Helper to flatten object keys
function flattenKeys(obj, prefix = '') {
    let keys = [];
    for (const k in obj) {
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            keys = keys.concat(flattenKeys(obj[k], prefix ? `${prefix}.${k}` : k));
        } else {
            keys.push(prefix ? `${prefix}.${k}` : k);
        }
    }
    return keys;
}

// Find all missing keys
function checkLocales() {
    console.log('🔍 Checking translations...');

    if (!fs.existsSync(LOCALES_DIR)) {
        console.error(`❌ Locales directory not found at ${LOCALES_DIR}`);
        process.exit(1);
    }

    // Load English as the source of truth
    const enPath = path.join(LOCALES_DIR, 'en.json');
    if (!fs.existsSync(enPath)) {
        console.error('❌ Base locale (en.json) not found!');
        process.exit(1);
    }

    let enObj;
    try {
        enObj = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    } catch (e) {
        console.error('❌ Failed to parse en.json');
        process.exit(1);
    }

    const allKeys = new Set(flattenKeys(enObj));
    console.log(`✅ Base locale (en) loaded with ${allKeys.size} keys.`);

    let hasError = false;

    REQUIRED_LOCALES.forEach(locale => {
        if (locale === 'en') return; // Skip base

        const filePath = path.join(LOCALES_DIR, `${locale}.json`);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ Missing locale file: ${locale}.json`);
            hasError = true;
            return;
        }

        try {
            const locObj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const locKeys = new Set(flattenKeys(locObj));

            const missing = [...allKeys].filter(k => !locKeys.has(k));
            const extra = [...locKeys].filter(k => !allKeys.has(k));

            if (missing.length > 0) {
                console.error(`❌ [${locale}] Missing ${missing.length} keys:`);
                missing.slice(0, 10).forEach(k => console.error(`   - ${k}`));
                if (missing.length > 10) console.error(`   ...and ${missing.length - 10} more.`);
                hasError = true;
            } else {
                console.log(`✅ [${locale}] Complete.`);
            }

            if (extra.length > 0) {
                console.warn(`⚠️ [${locale}] Has ${extra.length} extra keys (not in en).`);
            }

        } catch (e) {
            console.error(`❌ [${locale}] Invalid JSON: ${e.message}`);
            hasError = true;
        }
    });

    if (hasError) {
        console.error('\n❌ Translation check failed. Please fix missing keys.');
        process.exit(1);
    } else {
        console.log('\n✨ All translations are valid.');
    }
}

checkLocales();
