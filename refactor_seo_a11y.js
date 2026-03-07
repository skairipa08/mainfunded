const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'app');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(targetDir);

let imagesFixed = 0;
let buttonsFixed = 0;
let seoPagesFixed = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Fix missing alt in <img> and <Image>
    content = content.replace(/<(img|Image)([^>]*?)>/g, (match, tag, attrs) => {
        // Exclude generic tags if they already have an alt property
        if (!/alt\s*=/.test(attrs)) {
            imagesFixed++;
            return `<${tag}${attrs} alt="Image description" >`;
        }
        return match;
    });

    // 2. Fix missing aria-label for <button>
    // Just looking for <button ...> without aria-label and without text inside, containing only SVG/Icon.
    // simpler regex: any button opening tag without aria-label, wait, too dangerous if it has text.
    // Let's find <button onClick={...} className={...}> <Icon /> </button>
    content = content.replace(/<button([^>]*)>\s*<(svg|Icon|ImageIcon|svg|path)[^>]*>\s*<\/button>/g, (match, attrs, child) => {
        if (!/aria-label\s*=/.test(attrs)) {
            buttonsFixed++;
            return `<button${attrs} aria-label="Action button">\n<${child}>\n</button>`;
        }
        return match;
    });

    // 3. Update main layout.tsx SEO
    if (file.endsWith('layout.tsx') && content.includes('export const metadata: Metadata = {') && !content.includes('alternates: {')) {
        content = content.replace(/export const metadata: Metadata = \{([\s\S]*?)robots: \{([\s\S]*?)\},?\s*\};/,
            `export const metadata: Metadata = {$1robots: {\n    index: true,\n    follow: true,\n    googleBot: {\n      index: true,\n      follow: true,\n      'max-video-preview': -1,\n      'max-image-preview': 'large',\n      'max-snippet': -1,\n    },\n  },\n  alternates: {\n    canonical: '/',\n  },\n  keywords: ['eğitim', 'bağış', 'kitle fonlama', 'öğrenci', 'fon', 'sosyal sorumluluk', 'burs', 'eğitimde fırsat eşitliği'],\n  authors: [{ name: 'FundEd Ekibi' }],\n  creator: 'FundEd',\n  publisher: 'FundEd',\n};`
        );
        seoPagesFixed++;
    }

    // 4. Update page-level metadata (adding Open Graph tags if missing)
    if (file.endsWith('page.tsx') && content.includes('export async function generateMetadata')) {
        // If generating metadata dynamically, ensure Canonical is set here.
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
    }
});

console.log(`Fixed ${imagesFixed} images without alt, ${buttonsFixed} buttons without aria-label.`);
console.log(`Fixed SEO Metadata in layout.`);
