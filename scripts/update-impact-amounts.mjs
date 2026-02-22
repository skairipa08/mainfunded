import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const newImpact5000 = {
    en: "Full laboratory & technology infrastructure for a school",
    tr: "Bir okulun tam donanımlı laboratuvar ve teknoloji altyapısı",
    de: "Vollständiges Labor und Technologie-Infrastruktur für eine Schule",
    ar: "مختبر كامل وبنية تحتية تكنولوجية لمدرسة",
    fr: "Laboratoire complet et infrastructure technologique pour une école",
    es: "Laboratorio completo e infraestructura tecnológica para una escuela",
    zh: "一所学校的完整实验室和技术基础设施",
    ru: "Полная лаборатория и технологическая инфраструктура для школы"
};

files.forEach(file => {
    const code = file.replace('.json', '');
    const filePath = path.join(localesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (data.donation && data.donation.impact10) {
        const old10 = data.donation.impact10;
        const old25 = data.donation.impact25;
        const old50 = data.donation.impact50;
        const old100 = data.donation.impact100;
        const old250 = data.donation.impact250;
        const old500 = data.donation.impact500;

        data.donation.impact25 = old10;
        data.donation.impact50 = old25;
        data.donation.impact100 = old50;
        data.donation.impact250 = old100;
        data.donation.impact750 = old250;
        data.donation.impact2500 = old500;
        data.donation.impact5000 = newImpact5000[code] || newImpact5000['en'];

        delete data.donation.impact10;
        delete data.donation.impact500;

        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        console.log(`Updated impact keys for ${file}`);
    }
});
