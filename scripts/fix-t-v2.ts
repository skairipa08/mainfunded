import { Project, SyntaxKind, Node } from 'ts-morph';

const project = new Project({ tsConfigFilePath: "tsconfig.json" });

for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    if (!filePath.endsWith('.tsx')) continue;
    if (!filePath.includes('/app/') && !filePath.includes('/components/')) continue;

    const imports = sourceFile.getImportDeclarations();
    let useTranslationImports = imports.filter(i => i.getModuleSpecifierValue().includes('useTranslation') || (i.getNamedImports().some(ni => ni.getName() === 'useTranslation')));
    if (useTranslationImports.length > 1) {
        for (let i = 1; i < useTranslationImports.length; i++) {
            useTranslationImports[i].remove();
        }
    }

    let changed = false;

    const functions = [
        ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration),
        ...sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction),
        ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionExpression)
    ];

    for (const func of functions) {
        const body = func.getBody();
        if (body && Node.isBlock(body)) {
            const text = body.getText();
            if (text.includes('t(') && !text.includes('t } = useTranslation')) {
                let isComponentOrHook = false;
                const parent = func.getParent();

                if (Node.isVariableDeclaration(parent)) {
                    const name = parent.getName();
                    if (/^[A-Z]|use/.test(name)) isComponentOrHook = true;
                } else if (Node.isFunctionDeclaration(func)) {
                    const name = func.getName() || '';
                    if (/^[A-Z]|use/.test(name)) isComponentOrHook = true;
                }

                if (!isComponentOrHook && text.includes('return') && (text.includes('<') || text.includes('React.createElement'))) {
                    isComponentOrHook = true;
                }

                if (isComponentOrHook) {
                    body.insertStatements(0, 'const { t } = useTranslation();');
                    changed = true;
                }
            }
        }
    }

    if (changed || sourceFile.getText().includes('t(')) {
        if (!sourceFile.getImportDeclaration(imp => imp.getModuleSpecifierValue().includes('@/lib/i18n/context'))) {
            sourceFile.addImportDeclaration({
                namedImports: ['useTranslation'],
                moduleSpecifier: '@/lib/i18n/context'
            });
            changed = true;
        }
    }

    if (changed) {
        sourceFile.saveSync();
        console.log('Fixed', filePath);
    }
}
