const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, '..', 'locales');

const applyTranslations = {
    tr: {
        sectionTitle: 'Çocuğunuz İçin Kampanya Başlatın',
        sectionDesc: 'Özel gereksinimli çocuğunuz veya yakınlarınız için bağış kampanyası başlatabilirsiniz. Engel durumu, ihtiyaçları ve gerekli belgeleri paylaşarak destek talebinde bulunun.',
        startApplication: 'Kampanya Başvurusu Yap',
        privacyNote: '🔒 Tüm kişisel bilgiler ve engel raporları gizli tutulur.',
    },
    en: {
        sectionTitle: 'Start a Campaign for Your Child',
        sectionDesc: 'You can start a donation campaign for your special needs child or loved ones. Share the disability status, needs, and required documentation to request support.',
        startApplication: 'Apply for Campaign',
        privacyNote: '🔒 All personal information and disability reports are kept confidential.',
    },
    de: {
        sectionTitle: 'Starten Sie eine Kampagne für Ihr Kind',
        sectionDesc: 'Sie können eine Spendenkampagne für Ihr Kind mit besonderen Bedürfnissen starten.',
        startApplication: 'Kampagne beantragen',
        privacyNote: '🔒 Alle Informationen werden vertraulich behandelt.',
    },
    es: {
        sectionTitle: 'Inicie una Campaña para su Hijo',
        sectionDesc: 'Puede iniciar una campaña de donación para su hijo con necesidades especiales.',
        startApplication: 'Solicitar Campaña',
        privacyNote: '🔒 Toda la información se mantiene confidencial.',
    },
    fr: {
        sectionTitle: "Lancez une Campagne pour Votre Enfant",
        sectionDesc: "Vous pouvez lancer une campagne de dons pour votre enfant à besoins spéciaux.",
        startApplication: 'Demander une Campagne',
        privacyNote: '🔒 Toutes les informations sont confidentielles.',
    },
    ar: {
        sectionTitle: 'ابدأ حملة لطفلك',
        sectionDesc: 'يمكنك بدء حملة تبرع لطفلك من ذوي الاحتياجات الخاصة.',
        startApplication: 'تقديم طلب حملة',
        privacyNote: '🔒 جميع المعلومات الشخصية سرية.',
    },
    ru: {
        sectionTitle: 'Начните кампанию для вашего ребёнка',
        sectionDesc: 'Вы можете начать кампанию пожертвований для вашего ребёнка с особыми потребностями.',
        startApplication: 'Подать заявку',
        privacyNote: '🔒 Все данные конфиденциальны.',
    },
    zh: {
        sectionTitle: '为您的孩子发起活动',
        sectionDesc: '您可以为您的特殊需求孩子发起捐赠活动。',
        startApplication: '申请活动',
        privacyNote: '🔒 所有个人信息均保密。',
    },
};

for (const [locale, data] of Object.entries(applyTranslations)) {
    const fp = path.join(localesDir, `${locale}.json`);
    let raw = fs.readFileSync(fp, 'utf8');
    if (raw.charCodeAt(0) === 0xFEFF) {
        raw = raw.slice(1);
    }
    const content = JSON.parse(raw);
    if (content.specialNeeds) {
        content.specialNeeds.apply = data;
    }
    fs.writeFileSync(fp, JSON.stringify(content, null, 2) + '\n', 'utf8');
    console.log(`✅ ${locale}.json`);
}
console.log('Done!');
