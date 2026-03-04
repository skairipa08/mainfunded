import { Project, SyntaxKind, Node, SourceFile } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const localesDir = path.join(process.cwd(), 'locales');
const trPath = path.join(localesDir, 'tr.json');
let trTranslations: Record<string, string> = {};
if (fs.existsSync(trPath)) {
    trTranslations = JSON.parse(fs.readFileSync(trPath, 'utf8'));
}

const newTranslations: Record<string, string> = {};

function isTurkishOrText(text: string) {
    text = text.trim();
    if (!text) return false;
    // Skip single characters, numbers, and basic symbols if they don't contain Turkish letters
    if (/^[\d\s\p{P}]+$/u.test(text)) return false;

    // Very basic check, if it's got spaces and letters, or turkish letters
    if (/[şığçöüŞİĞÇÖÜ]/i.test(text)) return true;

    // Usually, UI text has spaces or starts with uppercase. Let's be lenient.
    if (/^[A-Z][a-z]+/.test(text) || text.includes(' ')) return true;
    return false;
}

function generateKey(text: string, filePath: string) {
    let base = text.trim().replace(/[^a-zA-Z0-9]/g, ' ').trim().replace(/\s+/g, '_').substring(0, 30).toLowerCase();
    if (!base) base = "text";

    const fileBase = path.basename(filePath, '.tsx').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const prefix = filePath.includes('components') ? 'components' : 'app';

    return `${prefix}.${fileBase}.${base}`;
}

let changedFiles = 0;

for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    if (!filePath.endsWith('.tsx')) continue;
    if (!filePath.includes('/app/') && !filePath.includes('/components/')) continue;

    let isChanged = false;

    // Collect elements to replace
    const replacements: { node: Node, newText: string, key: string, originalText: string }[] = [];

    // 1. JSX Text
    sourceFile.getDescendantsOfKind(SyntaxKind.JsxText).forEach(jsxText => {
        const text = jsxText.getLiteralText();
        if (isTurkishOrText(text) && !text.includes('t(')) {
            const trimmed = text.trim();
            const key = generateKey(trimmed, filePath);
            replacements.push({
                node: jsxText,
                newText: `{t('${key}')}`,
                key,
                originalText: trimmed
            });
        }
    });

    // 2. StringLiterals in JSX Attributes
    sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute).forEach(attr => {
        if (!Node.isJsxAttribute(attr)) return;
        const nameNode = attr.getNameNode();
        if (!nameNode) return;
        const name = nameNode.getText();
        // Attributes that usually contain text
        if (['placeholder', 'title', 'alt', 'label', 'description'].includes(name)) {
            const init = attr.getInitializer();
            if (init && Node.isStringLiteral(init)) {
                const text = init.getLiteralValue();
                if (isTurkishOrText(text)) {
                    const key = generateKey(text, filePath);
                    replacements.push({
                        node: init,
                        newText: `{t('${key}')}`,
                        key,
                        originalText: text
                    });
                }
            }
        }
    });

    if (replacements.length > 0) {
        // Reverse array to start replacing from the bottom so positions don't shift
        replacements.sort((a, b) => b.node.getPos() - a.node.getPos());

        for (const rep of replacements) {
            newTranslations[rep.key] = rep.originalText;
            rep.node.replaceWithText(rep.newText);
        }

        isChanged = true;

        // Ensure imports and 'use client'
        let hasUseClient = false;
        let hasUseTranslationImport = false;
        let hasUseTranslationHook = false;

        const statements = sourceFile.getStatements();
        if (statements.length > 0 && Node.isExpressionStatement(statements[0])) {
            if (statements[0].getText().includes('use client')) {
                hasUseClient = true;
            }
        }

        sourceFile.getImportDeclarations().forEach(imp => {
            if (imp.getModuleSpecifierValue().includes('@/lib/i18n/context')) {
                hasUseTranslationImport = true;
            }
        });

        // Find main component to inject `const { t } = useTranslation();`
        // Simplified approach: find default export function or arrow function
        const defaultExport = sourceFile.getDefaultExportSymbol();
        if (defaultExport) {
            const decl = defaultExport.getDeclarations()[0];
            if (Node.isFunctionDeclaration(decl)) {
                const body = decl.getBody();
                if (body && Node.isBlock(body)) {
                    if (body.getText().includes('useTranslation')) {
                        hasUseTranslationHook = true;
                    } else {
                        body.insertStatements(0, 'const { t } = useTranslation();');
                    }
                }

                // If it's async, we might break Next.js if we add use client, but let's log it
                if (decl.isAsync()) {
                    console.warn(`WARNING: Added use client to ASYNC component in ${filePath}`);
                }
            }
        }

        if (!hasUseTranslationImport) {
            sourceFile.addImportDeclaration({
                namedImports: ['useTranslation'],
                moduleSpecifier: '@/lib/i18n/context'
            });
        }

        if (!hasUseClient) {
            sourceFile.insertStatements(0, "'use client';\n");
        }

        sourceFile.saveSync();
        changedFiles++;
        console.log(`Updated ${filePath} with ${replacements.length} translations`);
    }
}

console.log(`Updated ${changedFiles} files.`);
fs.writeFileSync('extracted_keys.json', JSON.stringify(newTranslations, null, 2));
console.log(`Extracted keys saved to extracted_keys.json`);
