import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '..', 'locales');
const LOCALES = ['en', 'tr', 'de', 'ar', 'zh', 'ru', 'fr', 'es'];

// Helper to flatten object keys
function flattenKeys(obj, prefix = '') {
    let keys = {};
    for (const k in obj) {
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(keys, flattenKeys(obj[k], prefix ? `${prefix}.${k}` : k));
        } else {
            keys[prefix ? `${prefix}.${k}` : k] = obj[k];
        }
    }
    return keys;
}

// Helper to unflatten keys into nested object
function unflattenKeys(flatObj) {
    const result = {};
    for (const key in flatObj) {
        const parts = key.split('.');
        let cur = result;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (i === parts.length - 1) {
                cur[part] = flatObj[key];
            } else {
                cur[part] = cur[part] || {};
                cur = cur[part];
            }
        }
    }
    return result;
}

function sanitizeTr(text) {
    if (typeof text !== 'string') return text;
    return text
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U')
        .replace(/ş/g, 's').replace(/Ş/g, 'S')
        .replace(/ı/g, 'i').replace(/İ/g, 'I')
        .replace(/ö/g, 'o').replace(/Ö/g, 'O')
        .replace(/ç/g, 'c').replace(/Ç/g, 'C');
}

function run() {
    console.log('🔧 Fixing i18n files...');

    // 1. Load EN
    const enPath = path.join(LOCALES_DIR, 'en.json');
    let enObj = JSON.parse(fs.readFileSync(enPath, 'utf8'));

    // 2. Fix EN leaks (add missing keys to EN first)
    if (!enObj.verification) enObj.verification = {};

    if (!enObj.verification.submitError) {
        console.log('➕ Adding verification.submitError to en.json');
        enObj.verification.submitError = "Failed to submit verification. Please try again.";
    }
    if (!enObj.verification.selectedFiles) {
        console.log('➕ Adding verification.selectedFiles to en.json');
        enObj.verification.selectedFiles = "Selected Files";
    }

    // Save EN with new keys
    fs.writeFileSync(enPath, JSON.stringify(enObj, null, 4));

    // Reload flattened reference
    const enFlat = flattenKeys(enObj);

    // 3. Process others
    for (const locale of LOCALES) {
        if (locale === 'en') continue;

        console.log(`Processing ${locale}...`);
        const locPath = path.join(LOCALES_DIR, `${locale}.json`);
        let locObj = {};

        if (fs.existsSync(locPath)) {
            locObj = JSON.parse(fs.readFileSync(locPath, 'utf8'));
        }

        let locFlat = flattenKeys(locObj);
        let changed = false;

        // Fill missing keys
        for (const key in enFlat) {
            if (locFlat[key] === undefined) {
                // Fallback to English value
                locFlat[key] = enFlat[key];
                changed = true;
            }
        }

        // Sanitize TR
        if (locale === 'tr') {
            for (const key in locFlat) {
                const original = locFlat[key];
                const sanitized = sanitizeTr(original);
                if (original !== sanitized) {
                    locFlat[key] = sanitized;
                    changed = true;
                }
            }
        }

        if (changed) {
            console.log(`💾 Saving updates to ${locale}.json`);
            const newObj = unflattenKeys(locFlat);
            fs.writeFileSync(locPath, JSON.stringify(newObj, null, 4));
        }
    }

    console.log('✅ Done.');
}

run();
