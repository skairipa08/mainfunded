const fs = require('fs');
const path = require('path');

// 1. Add special-needs to APPLICANT_TYPES in constants
const constPath = path.join(__dirname, '..', 'lib', 'constants.ts');
let constants = fs.readFileSync(constPath, 'utf8');
const oldApplicants = `{ value: 'school', label: 'School / Institution', labelTr: 'Okul / Kurum', icon: 'Building' },\r\n] as const;`;
const newApplicants = `{ value: 'school', label: 'School / Institution', labelTr: 'Okul / Kurum', icon: 'Building' },\r\n  { value: 'special-needs', label: 'Special Needs', labelTr: 'Özel Gereksinimli', icon: 'Heart' },\r\n] as const;`;
if (constants.includes(oldApplicants)) {
    constants = constants.replace(oldApplicants, newApplicants);
    fs.writeFileSync(constPath, constants, 'utf8');
    console.log('✅ constants.ts updated');
} else {
    console.log('❌ APPLICANT_TYPES marker not found');
}

// 2. Update admin panel type filter to include special-needs
const adminPath = path.join(__dirname, '..', 'app', 'ops', 'applications', 'page.tsx');
let admin = fs.readFileSync(adminPath, 'utf8');

// Update TypeFilter type
admin = admin.replace(
    "type TypeFilter = 'all' | 'student' | 'teacher' | 'parent';",
    "type TypeFilter = 'all' | 'student' | 'teacher' | 'parent' | 'special-needs';"
);

// Update StudentApplication type to include special-needs
admin = admin.replace(
    "type?: 'student' | 'teacher' | 'parent';",
    "type?: 'student' | 'teacher' | 'parent' | 'special-needs';"
);

// Update typeLabel function
admin = admin.replace(
    "const typeLabel = (t?: string) => {\r\n    if (t === 'teacher') return 'Öğretmen';\r\n    if (t === 'parent') return 'Veli';\r\n    return 'Öğrenci';\r\n  };",
    "const typeLabel = (t?: string) => {\r\n    if (t === 'teacher') return 'Öğretmen';\r\n    if (t === 'parent') return 'Veli';\r\n    if (t === 'special-needs') return 'Özel Gereksinimli';\r\n    return 'Öğrenci';\r\n  };"
);

// Update typeBadgeClass function
admin = admin.replace(
    "const typeBadgeClass = (t?: string) => {\r\n    if (t === 'teacher') return 'bg-blue-100 text-blue-800 border-blue-200';\r\n    if (t === 'parent') return 'bg-purple-100 text-purple-800 border-purple-200';\r\n    return 'bg-emerald-100 text-emerald-800 border-emerald-200';\r\n  };",
    "const typeBadgeClass = (t?: string) => {\r\n    if (t === 'teacher') return 'bg-blue-100 text-blue-800 border-blue-200';\r\n    if (t === 'parent') return 'bg-purple-100 text-purple-800 border-purple-200';\r\n    if (t === 'special-needs') return 'bg-pink-100 text-pink-800 border-pink-200';\r\n    return 'bg-emerald-100 text-emerald-800 border-emerald-200';\r\n  };"
);

// Add special-needs filter button to type filter array
const oldFilterButtons = `{ key: 'parent', label: 'Veli', icon: <Heart className="h-3.5 w-3.5" /> },`;
const newFilterButtons = `{ key: 'parent', label: 'Veli', icon: <Heart className="h-3.5 w-3.5" /> },\r\n                    { key: 'special-needs', label: 'Özel Ger.', icon: <Heart className="h-3.5 w-3.5" /> },`;
admin = admin.replace(oldFilterButtons, newFilterButtons);

fs.writeFileSync(adminPath, admin, 'utf8');
console.log('✅ Admin panel updated');

// 3. Add "Kampanya Başvurusu" button to special-needs page
const pagePath = path.join(__dirname, '..', 'app', 'special-needs', 'page.tsx');
let page = fs.readFileSync(pagePath, 'utf8');

// Find the donate now button in the hero and add apply button
const oldDonate = `onClick={() => router.push('/donate?campaign=special-needs')}\r\n                                    className="bg-gradient-to-r from-pink-500 to-purple-600`;
const newDonate = `onClick={() => router.push('/donate?campaign=special-needs')}\r\n                                    className="bg-gradient-to-r from-pink-500 to-purple-600`;

// Add CTA near the bottom of the page (before the final CTA section)
// Let's try to find a good spot — e.g. before the parent letter section or after stories
const searchStr = `{/* Final emotional CTA */}`;
if (page.includes(searchStr)) {
    const applySection = `{/* Apply Section */}
                <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <div className="bg-white rounded-3xl border-2 border-purple-100 shadow-xl shadow-purple-100/50 p-8 sm:p-12">
                            <div className="text-5xl mb-4">✨</div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                {t('specialNeeds.apply.sectionTitle')}
                            </h2>
                            <p className="text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                                {t('specialNeeds.apply.sectionDesc')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={() => router.push('/special-needs/apply')}
                                    size="lg"
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white h-14 px-10 rounded-2xl text-lg font-semibold shadow-xl shadow-purple-500/20 transition-all duration-300 hover:scale-105"
                                >
                                    <Heart className="mr-2 h-5 w-5" />
                                    {t('specialNeeds.apply.startApplication')}
                                </Button>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">
                                {t('specialNeeds.apply.privacyNote')}
                            </p>
                        </div>
                    </div>
                </section>

                ` + searchStr;
    page = page.replace(searchStr, applySection);
    fs.writeFileSync(pagePath, page, 'utf8');
    console.log('✅ Apply CTA section added to special-needs page');
} else {
    // Try without \r\n
    const searchLF = '{/* Final emotional CTA */}';
    if (page.includes(searchLF)) {
        console.log('Found with LF, adding...');
    } else {
        console.log('❌ Final CTA marker not found in page.tsx');
        // Search for closest marker
        const idx = page.indexOf('Final emotional');
        if (idx >= 0) console.log('Found "Final emotional" at index', idx, JSON.stringify(page.substring(idx, idx + 50)));
        else console.log('Not found at all');
    }
}

console.log('\n🎉 Done!');
