
import fs from 'fs';
import path from 'path';

// Define locales based on standard list
const LOCALES = ['en', 'tr', 'de', 'ar', 'zh', 'ru', 'fr', 'es'];
const BASE_LOCALE = 'en';
const LOCALES_DIR = path.join(process.cwd(), 'locales');

// Helper to iterate object deeply
function flattenKeys(obj: any, prefix = ''): string[] {
    let keys: string[] = [];
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys = keys.concat(flattenKeys(obj[key], prefix + key + '.'));
        } else {
            keys.push(prefix + key);
        }
    }
    return keys;
}

function getValue(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function runValidation() {
    console.log('🌍 Starting i18n validation...');

    // Load Base Locale
    const baseLocalePath = path.join(LOCALES_DIR, `${BASE_LOCALE}.json`);
    if (!fs.existsSync(baseLocalePath)) {
        console.error(`❌ Base locale file not found: ${baseLocalePath}`);
        process.exit(1);
    }

    const baseData = JSON.parse(fs.readFileSync(baseLocalePath, 'utf-8'));
    const baseKeys = new Set(flattenKeys(baseData));

    console.log(`✅ Loaded base locale (${BASE_LOCALE}) with ${baseKeys.size} keys.`);

    let hasError = false;

    // Check all other locales
    for (const locale of LOCALES) {
        if (locale === BASE_LOCALE) continue;

        const localePath = path.join(LOCALES_DIR, `${locale}.json`);
        if (!fs.existsSync(localePath)) {
            console.error(`❌ Missing locale file: ${locale}`);
            hasError = true;
            continue;
        }

        try {
            const localeData = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
            const localeKeys = new Set(flattenKeys(localeData));

            // Check for missing keys
            const missingKeys: string[] = [];
            baseKeys.forEach(key => {
                if (!localeKeys.has(key)) {
                    missingKeys.push(key);
                }
            });

            // Check for empty values
            const emptyKeys: string[] = [];
            localeKeys.forEach(key => {
                const val = getValue(localeData, key);
                if (typeof val === 'string' && val.trim() === '') {
                    emptyKeys.push(key);
                }
            });

            if (missingKeys.length > 0) {
                console.error(`❌ [${locale}] Missing ${missingKeys.length} keys:`);
                missingKeys.slice(0, 10).forEach(k => console.error(`   - ${k}`));
                if (missingKeys.length > 10) console.error(`   ...and ${missingKeys.length - 10} more.`);
                hasError = true;
            } else if (emptyKeys.length > 0) {
                console.error(`⚠️ [${locale}] Found ${emptyKeys.length} empty keys:`);
                emptyKeys.slice(0, 10).forEach(k => console.error(`   - ${k}`));
                hasError = true;
            } else {
                console.log(`✅ [${locale}] Complete.`);
            }

        } catch (e) {
            console.error(`❌ [${locale}] Invalid JSON: ${(e as Error).message}`);
            hasError = true;
        }
    }

    if (hasError) {
        console.error('\n💥 Validation failed. Please fix missing or invalid translation keys.');
        process.exit(1);
    } else {
        console.log('\n✨ All locales are valid and complete!');
        process.exit(0);
    }
}

runValidation();
