const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'components', 'Navbar.tsx');
let content = fs.readFileSync(file, 'utf8');

// The file uses \r\n line endings
const searchStr = "description: 'D\u00fcnyada e\u011fitim e\u015fitli\u011fi i\u00e7in kampanyam\u0131z',\r\n    },\r\n    {\r\n      label: t('nav.menu.matchingGift'),";

const replaceStr = "description: 'D\u00fcnyada e\u011fitim e\u015fitli\u011fi i\u00e7in kampanyam\u0131z',\r\n    },\r\n    {\r\n      label: '\u00d6zel Gereksinimli \u00c7ocuklar',\r\n      href: '/special-needs',\r\n      icon: Heart,\r\n      description: '\u00d6zel gereksinimli \u00e7ocuklar i\u00e7in ba\u011f\u0131\u015f kampanyas\u0131',\r\n    },\r\n    {\r\n      label: t('nav.menu.matchingGift'),";

if (content.includes(searchStr)) {
    content = content.replace(searchStr, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log('✅ Navbar updated');
} else {
    console.log('❌ Not found');
}
