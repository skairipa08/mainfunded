
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../locales');
const enPath = path.join(localesDir, 'en.json');
const targets = ['de', 'ar', 'fr', 'es', 'zh', 'ru'];

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const campaignKeys = enData.campaign;

targets.forEach(lang => {
    const langPath = path.join(localesDir, `${lang}.json`);
    if (fs.existsSync(langPath)) {
        const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));

        // Ensure campaign object exists
        if (!langData.campaign) {
            langData.campaign = {};
        }

        // Add missing keys
        let addedCount = 0;

        function mergeKeys(source, target) {
            for (const key in source) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    mergeKeys(source[key], target[key]);
                } else {
                    if (!target[key]) {
                        target[key] = source[key];
                        addedCount++;
                    }
                }
            }
        }

        mergeKeys(campaignKeys, langData.campaign);

        if (addedCount > 0) {
            fs.writeFileSync(langPath, JSON.stringify(langData, null, 4));
            console.log(`Updated ${lang}.json with ${addedCount} missing keys.`);
        } else {
            console.log(`${lang}.json is up to date.`);
        }
    } else {
        console.warn(`${lang}.json not found.`);
    }
});
