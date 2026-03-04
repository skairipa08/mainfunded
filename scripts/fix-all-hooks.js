const { execSync } = require('child_process');
const fs = require('fs');

console.log('Running ESLint to find hook errors...');
try {
    execSync('npx eslint --format json "app/**/*.tsx" "components/**/*.tsx" > eslint-errors.json', { stdio: 'pipe' });
} catch (e) {
    // eslint exits with 1 if there are errors, which is expected
}

const errors = JSON.parse(fs.readFileSync('eslint-errors.json', 'utf-8'));
let totalFixed = 0;

for (const fileResult of errors) {
    const linesToDelete = [];
    for (const msg of fileResult.messages) {
        if (msg.ruleId === 'react-hooks/rules-of-hooks' && msg.message.includes('useTranslation')) {
            linesToDelete.push(msg.line);
        }
    }

    // Deduplicate lines in case of multiple errors on same line
    const uniqueLines = [...new Set(linesToDelete)];

    if (uniqueLines.length > 0) {
        let contentLines = fs.readFileSync(fileResult.filePath, 'utf-8').split('\n');
        uniqueLines.sort((a, b) => b - a).forEach(l => contentLines.splice(l - 1, 1));
        fs.writeFileSync(fileResult.filePath, contentLines.join('\n'));
        console.log(`Fixed ${uniqueLines.length} hooks in`, fileResult.filePath);
        totalFixed += uniqueLines.length;
    }
}

console.log(`Successfully removed ${totalFixed} invalid hooks.`);
