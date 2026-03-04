import { Project, SyntaxKind, Node } from 'ts-morph';
import * as fs from 'fs';

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const filesToFix = [
    'components/ProgressReport.tsx',
    'components/SocialShare.tsx',
    'components/StudentBlog.tsx',
    'components/ThankYouMessage.tsx',
    'components/TransparencyCard.tsx',
    'components/VerificationBadge.tsx'
];

for (const file of filesToFix) {
    const sourceFile = project.getSourceFileOrThrow(file);

    // Find all functions/arrow functions that use `t(` but don't define it
    const functions = [
        ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration),
        ...sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction)
    ];

    for (const func of functions) {
        const body = func.getBody();
        if (body && Node.isBlock(body)) {
            const text = body.getText();
            // Check if it uses `t(` but does not declare `const { t } = useTranslation()`
            if (text.includes('t(') && !text.includes('useTranslation')) {
                body.insertStatements(0, 'const { t } = useTranslation();');
            }
        }
    }

    sourceFile.saveSync();
    console.log('Fixed', file);
}
