import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
// List of required locales
const REQUIRED_LOCALES = ['tr', 'en', 'de', 'ar', 'fr', 'es', 'zh', 'ru'];

// Helper to set a value in a nested object by dot notation path
function set(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;
}

// Helper to get a value from a nested object by dot notation path
function get(obj, path) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length; i++) {
        if (current === undefined || current === null) return undefined;
        current = current[keys[i]];
    }
    return current;
}

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

function fixLocales() {
    console.log('🔧 Fixing translations...');

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

    const allKeys = flattenKeys(enObj);

    REQUIRED_LOCALES.forEach(locale => {
        if (locale === 'en') return;

        console.log(`Processing ${locale}...`);
        const filePath = path.join(LOCALES_DIR, `${locale}.json`);
        let locObj = {};

        if (fs.existsSync(filePath)) {
            try {
                locObj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (e) {
                console.error(`❌ Failed to parse ${locale}.json, starting with empty object.`);
            }
        }

        let addedCount = 0;
        allKeys.forEach(key => {
            const val = get(locObj, key);
            if (val === undefined) {
                const enVal = get(enObj, key);
                // Use English value for missing keys
                set(locObj, key, enVal);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            fs.writeFileSync(filePath, JSON.stringify(locObj, null, 4), 'utf8');
            console.log(`✅ [${locale}] Added ${addedCount} missing keys.`);
        } else {
            console.log(`✨ [${locale}] No missing keys.`);
        }
    });

    console.log('🎉 Done fixing locales.');
}

fixLocales();
