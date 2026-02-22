import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
    en: { intervalSelect: "Interval" },
    tr: { intervalSelect: "İşlem Sıklığı" },
    de: { intervalSelect: "Intervall" },
    ar: { intervalSelect: "الفترة" },
    fr: { intervalSelect: "Intervalle" },
    es: { intervalSelect: "Intervalo" },
    zh: { intervalSelect: "间隔" },
    ru: { intervalSelect: "Интервал" }
};

files.forEach(file => {
    const code = file.replace('.json', '');
    const filePath = path.join(localesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!data.donation) {
        data.donation = {};
    }

    const defaultKeys = translations['en'];
    const localeKeys = translations[code] || defaultKeys;

    data.donation.intervalSelect = localeKeys.intervalSelect;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    console.log(`Updated ${file}`);
});
