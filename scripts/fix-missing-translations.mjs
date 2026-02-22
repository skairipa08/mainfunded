import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'locales');
const enPath = path.join(localesDir, 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Recursive function to merge missing keys from source (en) to target
function deepMergeMissing(target, source) {
    let changed = false;
    for (const key in source) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
            if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {};
                changed = true;
            }
            if (deepMergeMissing(target[key], source[key])) {
                changed = true;
            }
        } else {
            if (!(key in target)) {
                target[key] = source[key];
                changed = true;
            }
        }
    }
    return changed;
}

const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'en.json');

files.forEach(file => {
    const filePath = path.join(localesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (deepMergeMissing(data, enData)) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4) + '\n');
        console.log(`✅ Backfilled missing keys in ${file}`);
    } else {
        console.log(`➖ No missing keys in ${file}`);
    }
});
