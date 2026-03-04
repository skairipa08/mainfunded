const fs = require('fs');
const path = require('path');

const errors = `
./components/BadgeDisplay.tsx:90
./components/calendar/CampaignCountdown.tsx:31
./components/calendar/DonationCalendar.tsx:198
./components/DonationForm.tsx:74
./components/ProgressReport.tsx:57
./components/ProgressReport.tsx:185
./components/ProgressReport.tsx:400
./components/SocialShare.tsx:74
./components/StudentBlog.tsx:100
./components/StudentBlog.tsx:121
./components/StudentBlog.tsx:438
./components/TransparencyCard.tsx:109
./components/TransparencyCard.tsx:114
`;

const linesToDelete = errors.trim().split('\n').filter(l => l.trim().length > 0).map(line => {
    const [file, lineNo] = line.split(':');
    return { file: file.trim(), lineNo: parseInt(lineNo.trim()) };
});

const fileModifications = {};
for (const { file, lineNo } of linesToDelete) {
    if (!fileModifications[file]) fileModifications[file] = [];
    fileModifications[file].push(lineNo);
}

for (const [file, lines] of Object.entries(fileModifications)) {
    const filePath = path.join(process.cwd(), file);
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const contentLines = content.split('\n');
        // Delete lines starting from the bottom so indices don't shift
        lines.sort((a, b) => b - a).forEach(lineNo => {
            contentLines.splice(lineNo - 1, 1);
        });
        fs.writeFileSync(filePath, contentLines.join('\n'));
        console.log('Fixed', file);
    } catch (e) {
        console.error('Failed on', file, e.message);
    }
}
