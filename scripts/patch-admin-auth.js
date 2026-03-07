const fs = require('fs');
const path = require('path');

const endpoints = [
    'stories/route.ts',
    'stories/[id]/route.ts',
    'mentors/route.ts',
    'mentors/[id]/route.ts'
];

for (const ep of endpoints) {
    const filePath = path.join(__dirname, '..', 'app', 'api', 'admin', ...ep.split('/'));
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace requireAdmin import
        content = content.replace(
            "import { requireAdmin } from '@/lib/authz';",
            "import { requireAdminOrOps } from '@/lib/authz';"
        );
        // There might be multiple imports in the same line or differently formatted
        if (!content.includes('requireAdminOrOps')) {
            content = content.replace("requireAdmin", "requireAdminOrOps");
        }

        // Replace function calls
        content = content.replace(/await requireAdmin\(\);/g, "await requireAdminOrOps();");

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated ${ep}`);
    } else {
        console.log(`❌ Not found: ${ep}`);
    }
}
