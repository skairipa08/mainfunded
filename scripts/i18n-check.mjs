
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define locales based on standard list
const LOCALES = ['en', 'tr', 'de', 'ar', 'zh', 'ru', 'fr', 'es'];
const BASE_LOCALE = 'en';
// Go up one level from scripts/ to root, then into locales/
const LOCALES_DIR = path.join(__dirname, '..', 'locales');

// Helper to iterate object deeply and return array of dot-notation keys
function flattenKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys = keys.concat(flattenKeys(obj[key], prefix + key + '.'));
        } else {
            keys.push(prefix + key);
        }
    }
    return keys;
}

function getValue(obj, path) {
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

    let baseData;
    try {
        baseData = JSON.parse(fs.readFileSync(baseLocalePath, 'utf-8'));
    } catch (e) {
        console.error(`❌ API Error: Failed to parse base locale (${BASE_LOCALE}): ${e.message}`);
        process.exit(1);
    }

    // Check if baseData is empty
    if (!baseData || Object.keys(baseData).length === 0) {
        console.error(`❌ Base locale (${BASE_LOCALE}) is empty!`);
        process.exit(1);
    }

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
            const localeKeyList = flattenKeys(localeData);
            const localeKeys = new Set(localeKeyList);

            // Check for missing keys
            const missingKeys = [];
            baseKeys.forEach(key => {
                if (!localeKeys.has(key)) {
                    missingKeys.push(key);
                }
            });

            // Check for empty values
            const emptyKeys = [];
            localeKeyList.forEach(key => {
                const val = getValue(localeData, key);
                // Check strictly for empty string, not just falsy (though undefined shouldn't be here)
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
                // Treating empty keys as error based on strict requirements ("no empty")
                emptyKeys.slice(0, 10).forEach(k => console.error(`   - ${k}`));
                hasError = true;
            } else {
                console.log(`✅ [${locale}] Complete.`);
            }

        } catch (e) {
            console.error(`❌ [${locale}] Invalid JSON: ${e.message}`);
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
