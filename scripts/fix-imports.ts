import * as fs from 'fs';

const files = [
    'app/my-donations/[donation_id]/page.tsx',
    'app/my-donations/page.tsx',
    'app/sponsors/page.tsx',
    'app/student/status/page.tsx',
    'app/verify/page.tsx',
    'app/verify/status/page.tsx',
    'components/donation/FeeCalculator.tsx',
    'components/MobileHeader.tsx'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const outLines = [];
    let importCount = 0;

    for (const line of lines) {
        if (line.includes('import') && line.includes('useTranslation')) {
            importCount++;
            if (importCount > 1) continue;
        }
        outLines.push(line);
    }
    fs.writeFileSync(file, outLines.join('\n'));
    console.log('Fixed imports in', file);
}
