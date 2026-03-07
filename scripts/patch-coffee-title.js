const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, '..', 'locales');

const updates = {
    tr: { title: "Bir Çocuğun Geleceğini Güçlendirin", subtitle: "Anlamlı katkınız, çocukların gelişmesi için ihtiyaç duyduğu temel eğitim ve uzman terapileri sağlar." },
    en: { title: "Empower a Child's Future", subtitle: "Your meaningful contribution provides the essential education and specialized therapies children need to thrive." },
    de: { title: "Stärken Sie die Zukunft eines Kindes", subtitle: "Ihr bedeutungsvoller Beitrag ermöglicht die grundlegende Bildung und spezialisierte Therapien, die Kinder zum Gedeihen brauchen." },
    es: { title: "Fortalece el Futuro de un Niño", subtitle: "Tu contribución significativa proporciona la educación esencial y las terapias especializadas que los niños necesitan para prosperar." },
    fr: { title: "Renforcez l'Avenir d'un Enfant", subtitle: "Votre contribution significative fournit l'éducation essentielle et les thérapies spécialisées dont les enfants ont besoin pour s'épanouir." },
    ar: { title: "مكّن مستقبل طفل", subtitle: "مساهمتك القيّمة توفر التعليم الأساسي والعلاجات المتخصصة التي يحتاجها الأطفال للازدهار." },
    ru: { title: "Укрепите будущее ребёнка", subtitle: "Ваш значимый вклад обеспечивает базовое образование и специализированную терапию, необходимые детям для развития." },
    zh: { title: "赋能孩子的未来", subtitle: "您有意义的贡献为孩子们提供了成长所需的基础教育和专业治疗。" },
};

for (const [locale, texts] of Object.entries(updates)) {
    const fp = path.join(localesDir, `${locale}.json`);
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (data.specialNeeds?.coffee) {
        data.specialNeeds.coffee.title = texts.title;
        data.specialNeeds.coffee.subtitle = texts.subtitle;
        data.specialNeeds.coffee.badge = locale === 'tr' ? 'Gerçek Etki' : 'Real Impact';
    }
    fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`✅ ${locale}.json`);
}
console.log('Done!');
