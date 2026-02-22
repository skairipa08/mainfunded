import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
    en: {
        saasFeeNote: "95% of your donations are transferred directly to the student. A 5% platform fee is applied.",
        recurringNote: "This campaign is supported by regular (monthly/weekly) donors."
    },
    tr: {
        saasFeeNote: "Bağışlarınızın %95'i doğrudan öğrenciye aktarılır. %5 platform kesintisi uygulanır.",
        recurringNote: "Bu kampanyaya düzenli (aylık/haftalık) destekçiler katkı sağlamaktadır."
    },
    de: {
        saasFeeNote: "95 % Ihrer Spenden gehen direkt an den Studenten. Es wird eine Plattformgebühr von 5 % erhoben.",
        recurringNote: "Diese Kampagne wird von regelmäßigen Spendern unterstützt."
    },
    ar: {
        saasFeeNote: "يتم تحويل 95% من تبرعاتك مباشرة إلى الطالب. يتم تطبيق رسوم منصة بنسبة 5%.",
        recurringNote: "يتم دعم هذه الحملة من قبل متبرعين منتظمين (شهريًا/أسبوعيًا)."
    },
    fr: {
        saasFeeNote: "95 % de vos dons sont transférés directement à l'étudiant. Des frais de plateforme de 5 % sont appliqués.",
        recurringNote: "Cette campagne est soutenue par des donateurs réguliers."
    },
    es: {
        saasFeeNote: "El 95% de sus donaciones se transfieren directamente al estudiante. Se aplica una tarifa de plataforma del 5%.",
        recurringNote: "Esta campaña cuenta con el apoyo de donantes habituales."
    },
    zh: {
        saasFeeNote: "您的捐款的95％直接转给学生。收取5％的平台费。",
        recurringNote: "这项活动得到了定期捐助者的支持。"
    },
    ru: {
        saasFeeNote: "95% ваших пожертвований переводятся непосредственно студенту. Взимается комиссия платформы в размере 5%.",
        recurringNote: "Эту кампанию поддерживают регулярные доноры."
    }
};

files.forEach(file => {
    const code = file.replace('.json', '');
    const filePath = path.join(localesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!data.campaign) {
        data.campaign = {};
    }

    const defaultKeys = translations['en'];
    const localeKeys = translations[code] || defaultKeys;

    data.campaign.saasFeeNote = localeKeys.saasFeeNote;
    data.campaign.recurringNote = localeKeys.recurringNote;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    console.log(`Updated ${file}`);
});
