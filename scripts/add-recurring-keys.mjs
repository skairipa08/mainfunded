import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
    en: {
        monthlyScholarship: "Monthly Student Scholarship",
        recurringPrompt: "Would you like to touch more lives by continuing your donation automatically at regular intervals?",
        intervalOneTime: "One-time",
        intervalMonthly: "Monthly",
        intervalWeekly: "Weekly",
        emotionalYes: "Yes, I want to be a regular supporter",
        emotionalNo: "No, maybe later"
    },
    tr: {
        monthlyScholarship: "Aylık Öğrenci Bursu",
        recurringPrompt: "Bağışınıza düzenli periyotlarla otomatik olarak devam ederek daha fazla hayata dokunmak ister misiniz?",
        intervalOneTime: "Tek Seferlik",
        intervalMonthly: "Aylık",
        intervalWeekly: "Haftalık",
        emotionalYes: "Evet, düzenli destekçi olmak istiyorum",
        emotionalNo: "Hayır, tek seferlik yapmak istiyorum"
    },
    de: {
        monthlyScholarship: "Monatliches Studenten-Stipendium",
        recurringPrompt: "Möchten Sie mehr Leben berühren, indem Sie Ihre Spende automatisch in regelmäßigen Abständen fortsetzen?",
        intervalOneTime: "Einmalig",
        intervalMonthly: "Monatlich",
        intervalWeekly: "Wöchentlich",
        emotionalYes: "Ja, ich möchte regelmäßiger Unterstützer werden",
        emotionalNo: "Nein, vielleicht später"
    },
    ar: {
        monthlyScholarship: "منحة الطالب الشهرية",
        recurringPrompt: "هل ترغب في لمس المزيد من الأرواح من خلال مواصلة تبرعك تلقائيًا على فترات منتظمة؟",
        intervalOneTime: "لمرة واحدة",
        intervalMonthly: "شهريا",
        intervalWeekly: "أسبوعيا",
        emotionalYes: "نعم ، أريد أن أكون داعمًا منتظمًا",
        emotionalNo: "لا ، ربما في وقت لاحق"
    },
    fr: {
        monthlyScholarship: "Bourse d'Études Mensuelle",
        recurringPrompt: "Souhaitez-vous toucher plus de vies en poursuivant automatiquement votre don à des intervalles réguliers?",
        intervalOneTime: "Une fois",
        intervalMonthly: "Mensuel",
        intervalWeekly: "Hebdomadaire",
        emotionalYes: "Oui, je veux être un supporter régulier",
        emotionalNo: "Non, peut-être plus tard"
    },
    es: {
        monthlyScholarship: "Beca Estudiantil Mensual",
        recurringPrompt: "¿Le gustaría tocar más vidas continuando su donación automáticamente a intervalos regulares?",
        intervalOneTime: "Una vez",
        intervalMonthly: "Mensual",
        intervalWeekly: "Semanal",
        emotionalYes: "Sí, quiero ser un donante regular",
        emotionalNo: "No, tal vez más tarde"
    },
    zh: {
        monthlyScholarship: "每月学生奖学金",
        recurringPrompt: "您希望通过定期自动继续捐款来影响更多人的生活吗？",
        intervalOneTime: "一次性",
        intervalMonthly: "每月",
        intervalWeekly: "每周",
        emotionalYes: "是的，我想成为定期的支持者",
        emotionalNo: "不，也许以后"
    },
    ru: {
        monthlyScholarship: "Ежемесячная студенческая стипендия",
        recurringPrompt: "Хотели бы вы коснуться большего количества жизней, автоматически продолжая свои пожертвования через регулярные промежутки времени?",
        intervalOneTime: "Разовый",
        intervalMonthly: "Ежемесячный",
        intervalWeekly: "Еженедельный",
        emotionalYes: "Да, я хочу быть регулярным сторонником",
        emotionalNo: "Нет, возможно позже"
    }
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

    data.donation.monthlyScholarship = localeKeys.monthlyScholarship;
    data.donation.recurringPrompt = localeKeys.recurringPrompt;
    data.donation.intervalOneTime = localeKeys.intervalOneTime;
    data.donation.intervalMonthly = localeKeys.intervalMonthly;
    data.donation.intervalWeekly = localeKeys.intervalWeekly;
    data.donation.emotionalYes = localeKeys.emotionalYes;
    data.donation.emotionalNo = localeKeys.emotionalNo;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    console.log(`Updated ${file}`);
});
