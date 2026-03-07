const fs = require('fs');
const path = require('path');

// 1. Update special-needs/page.tsx
const pagePath = path.join(__dirname, '..', 'app', 'special-needs', 'page.tsx');
let page = fs.readFileSync(pagePath, 'utf8');

// Update coffee card prices: $5->$75, $15->$700, $30->$500, $60->$2000
// TRY equivalents (approx 36.5x): 100->2750, 250->25550, 500->18250, 1000->73000
page = page.replace(
    /amount: currency === 'TRY' \? 100 : 5,\s*\n\s*impact: t\('specialNeeds\.coffee\.impact1'\)/,
    "amount: currency === 'TRY' ? 2750 : 75,\n            impact: t('specialNeeds.coffee.impact1')"
);
page = page.replace(
    /amount: currency === 'TRY' \? 250 : 15,\s*\n\s*impact: t\('specialNeeds\.coffee\.impact2'\)/,
    "amount: currency === 'TRY' ? 25550 : 700,\n            impact: t('specialNeeds.coffee.impact2')"
);
page = page.replace(
    /amount: currency === 'TRY' \? 500 : 30,\s*\n\s*impact: t\('specialNeeds\.coffee\.impact3'\)/,
    "amount: currency === 'TRY' ? 18250 : 500,\n            impact: t('specialNeeds.coffee.impact3')"
);
page = page.replace(
    /amount: currency === 'TRY' \? 1000 : 60,\s*\n\s*impact: t\('specialNeeds\.coffee\.impact4'\)/,
    "amount: currency === 'TRY' ? 73000 : 2000,\n            impact: t('specialNeeds.coffee.impact4')"
);

// Replace teacher training with trips/excursions
page = page.replace(
    /icon: GraduationCap,\s*\n\s*title: t\('specialNeeds\.impact\.teacherTraining'\),\s*\n\s*description: t\('specialNeeds\.impact\.teacherTrainingDesc'\),/,
    "icon: GraduationCap,\n            title: t('specialNeeds.impact.joyTrips'),\n            description: t('specialNeeds.impact.joyTripsDesc'),"
);

fs.writeFileSync(pagePath, page, 'utf8');
console.log('✅ page.tsx updated (prices + teacher training -> joy trips)');

// 2. Add special-needs CTA card to donate page sidebar
const donatePath = path.join(__dirname, '..', 'app', 'donate', 'page.tsx');
let donate = fs.readFileSync(donatePath, 'utf8');

const educEqualityCTA = `              {/* Education Equality CTA */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 sm:p-7 text-white shadow-lg shadow-orange-500/20">
                <Globe className="h-8 w-8 text-white/80 mb-3" />
                <h3 className="text-lg font-bold mb-2">{t('donation.equalityCampaign')}</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-5">
                  {t('donation.equalityDesc')}
                </p>
                <Button
                  onClick={() => router.push('/education-equality')}
                  className="w-full bg-white text-orange-600 hover:bg-white/90 font-semibold rounded-xl h-11"
                >
                  {t('donation.viewCampaign')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>`;

const specialNeedsCTA = `              {/* Education Equality CTA */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 sm:p-7 text-white shadow-lg shadow-orange-500/20">
                <Globe className="h-8 w-8 text-white/80 mb-3" />
                <h3 className="text-lg font-bold mb-2">{t('donation.equalityCampaign')}</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-5">
                  {t('donation.equalityDesc')}
                </p>
                <Button
                  onClick={() => router.push('/education-equality')}
                  className="w-full bg-white text-orange-600 hover:bg-white/90 font-semibold rounded-xl h-11"
                >
                  {t('donation.viewCampaign')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Special Needs CTA */}
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-6 sm:p-7 text-white shadow-lg shadow-purple-500/20">
                <Heart className="h-8 w-8 text-white/80 mb-3" />
                <h3 className="text-lg font-bold mb-2">{t('specialNeeds.navLabel') !== 'specialNeeds.navLabel' ? t('specialNeeds.navLabel') : 'Özel Gereksinimli Çocuklar'}</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-5">
                  {t('specialNeeds.navDesc') !== 'specialNeeds.navDesc' ? t('specialNeeds.navDesc') : 'Özel gereksinimli çocuklar için bağış kampanyası'}
                </p>
                <Button
                  onClick={() => router.push('/special-needs')}
                  className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold rounded-xl h-11"
                >
                  {t('donation.viewCampaign')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>`;

if (donate.includes(educEqualityCTA)) {
    donate = donate.replace(educEqualityCTA, specialNeedsCTA);
    fs.writeFileSync(donatePath, donate, 'utf8');
    console.log('✅ donate/page.tsx updated with special-needs CTA card');
} else {
    // Try with \r\n
    const searchCRLF = educEqualityCTA.replace(/\n/g, '\r\n');
    const replaceCRLF = specialNeedsCTA.replace(/\n/g, '\r\n');
    if (donate.includes(searchCRLF)) {
        donate = donate.replace(searchCRLF, replaceCRLF);
        fs.writeFileSync(donatePath, donate, 'utf8');
        console.log('✅ donate/page.tsx updated with special-needs CTA card (CRLF)');
    } else {
        console.log('❌ Education equality CTA not found in donate/page.tsx');
    }
}
