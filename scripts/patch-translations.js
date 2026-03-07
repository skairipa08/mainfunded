const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');
const locales = ['tr', 'en', 'de', 'es', 'fr', 'ar', 'ru', 'zh'];

const newKeys = {
    tr: {
        navLabel: 'Özel Gereksinimli Çocuklar',
        navDesc: 'Özel gereksinimli çocuklar için bağış kampanyası',
        'impact.joyTrips': 'Mutluluk Gezileri',
        'impact.joyTripsDesc': 'Özel gereksinimli çocuklara hayvanat bahçesi, müze, piknik ve doğa gezileri düzenleyerek onları mutlu ediyoruz.',
        'coffee.badge': 'Gerçekçi Fiyatlandırma',
        'coffee.title': 'Her Bağış Bir Hayat Değiştirir',
        'coffee.subtitle': 'Bağışlarınızın gerçek dünyada yaratabileceği etkiyi görün.',
    },
    en: {
        navLabel: 'Special Needs Children',
        navDesc: 'Donation campaign for special needs children',
        'impact.joyTrips': 'Joy Trips & Excursions',
        'impact.joyTripsDesc': 'We organize trips to zoos, museums, picnics, and nature outings to bring joy and happiness to children with special needs.',
        'coffee.badge': 'Realistic Pricing',
        'coffee.title': 'Every Donation Changes a Life',
        'coffee.subtitle': 'See the real-world impact your donations can create.',
    },
    de: {
        navLabel: 'Kinder mit besonderen Bedürfnissen',
        navDesc: 'Spendenkampagne für Kinder mit besonderen Bedürfnissen',
        'impact.joyTrips': 'Freudenausflüge',
        'impact.joyTripsDesc': 'Wir organisieren Ausflüge in Zoos, Museen, Picknicks und Naturausflüge, um Kindern mit besonderen Bedürfnissen Freude zu bereiten.',
    },
    es: {
        navLabel: 'Niños con Necesidades Especiales',
        navDesc: 'Campaña de donación para niños con necesidades especiales',
        'impact.joyTrips': 'Excursiones de Alegría',
        'impact.joyTripsDesc': 'Organizamos excursiones a zoológicos, museos, picnics y salidas a la naturaleza para llevar alegría a niños con necesidades especiales.',
    },
    fr: {
        navLabel: 'Enfants à Besoins Spéciaux',
        navDesc: 'Campagne de dons pour enfants à besoins spéciaux',
        'impact.joyTrips': 'Excursions de Joie',
        'impact.joyTripsDesc': 'Nous organisons des sorties au zoo, au musée, des pique-niques et des excursions nature pour apporter de la joie aux enfants à besoins spéciaux.',
    },
    ar: {
        navLabel: 'أطفال ذوي الاحتياجات الخاصة',
        navDesc: 'حملة تبرع للأطفال ذوي الاحتياجات الخاصة',
        'impact.joyTrips': 'رحلات السعادة',
        'impact.joyTripsDesc': 'ننظم رحلات إلى حدائق الحيوان والمتاحف والنزهات والرحلات الطبيعية لإسعاد الأطفال ذوي الاحتياجات الخاصة.',
    },
    ru: {
        navLabel: 'Дети с особыми потребностями',
        navDesc: 'Кампания пожертвований для детей с особыми потребностями',
        'impact.joyTrips': 'Экскурсии Радости',
        'impact.joyTripsDesc': 'Мы организуем поездки в зоопарки, музеи, пикники и прогулки на природе, чтобы подарить радость детям с особыми потребностями.',
    },
    zh: {
        navLabel: '特殊需求儿童',
        navDesc: '特殊需求儿童捐赠活动',
        'impact.joyTrips': '快乐之旅',
        'impact.joyTripsDesc': '我们组织动物园、博物馆、野餐和户外郊游，为有特殊需求的孩子带来欢乐。',
    }
};

for (const locale of locales) {
    const filePath = path.join(localesDir, `${locale}.json`);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (content.specialNeeds) {
        const keys = newKeys[locale] || newKeys.en;

        // Add nav keys
        content.specialNeeds.navLabel = keys.navLabel;
        content.specialNeeds.navDesc = keys.navDesc;

        // Add joy trips keys to impact
        if (content.specialNeeds.impact) {
            content.specialNeeds.impact.joyTrips = keys['impact.joyTrips'];
            content.specialNeeds.impact.joyTripsDesc = keys['impact.joyTripsDesc'];
            // Remove old teacher training keys
            delete content.specialNeeds.impact.teacherTraining;
            delete content.specialNeeds.impact.teacherTrainingDesc;
        }

        // Update coffee section title/badge
        if (content.specialNeeds.coffee && keys['coffee.badge']) {
            content.specialNeeds.coffee.badge = keys['coffee.badge'];
            content.specialNeeds.coffee.title = keys['coffee.title'];
            content.specialNeeds.coffee.subtitle = keys['coffee.subtitle'];
        }

        fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
        console.log(`✅ ${locale}.json updated`);
    }
}

console.log('\n🎉 All translations updated!');
