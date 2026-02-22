import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const texts = {
    impact25: {
        en: "Student's basic notebook and pen needs",
        tr: "Öğrencinin temel defter ve kalem ihtiyaçları",
        de: "Grundlegender Bedarf an Heften und Stiften für Schüler",
        ar: "الاحتياجات الأساسية للطالب من دفاتر وأقلام",
        fr: "Besoins de base de l'élève en cahiers et stylos",
        es: "Necesidades básicas de cuadernos y bolígrafos del estudiante",
        zh: "学生基本的笔记本和笔的需求",
        ru: "Основные потребности студента в тетрадях и ручках"
    },
    impact2500: {
        en: "Classroom renovation",
        tr: "Bir sınıfın yenilenmesi",
        de: "Klassenzimmer-Renovierung",
        ar: "تجديد الفصل الدراسي",
        fr: "Rénovation de salle de classe",
        es: "Renovación del aula",
        zh: "教室翻新",
        ru: "Ремонт класса"
    }
};

files.forEach(file => {
    const code = file.replace('.json', '');
    const filePath = path.join(localesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (data.donation) {
        if (texts.impact25[code]) {
            data.donation.impact25 = texts.impact25[code];
        }
        if (texts.impact2500[code]) {
            data.donation.impact2500 = texts.impact2500[code];
        }
        delete data.donation.impact5000;

        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        console.log(`Updated scripts for ${file}`);
    }
});
