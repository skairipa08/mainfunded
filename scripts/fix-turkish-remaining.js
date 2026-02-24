const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

const replacements = [
  // Specific to remaining files
  ["Bagis ID", "Bağış ID"],
  ["Bagisci Adi", "Bağışçı Adı"],
  ["'Yuksek Guven'", "'Yüksek Güven'"],
  ["'Belge + okul portali ekran goruntusu ile dogrula.'", "'Belge + okul portalı ekran görüntüsü ile doğrula.'"],
  ["Bağışiniz dogrudan ogrenciye ulasmazsa, tam iade yapilir.", "Bağışınız doğrudan öğrenciye ulaşmazsa, tam iade yapılır."],
  ["Tum ogrenciler kimlik ve ogrencilik belgesi ile dogrulanir.", "Tüm öğrenciler kimlik ve öğrencilik belgesi ile doğrulanır."],
  ["Her ceyrek, bağışınizin nasil kullanildigini gorursunuz.", "Her çeyrek, bağışınızın nasıl kullanıldığını görürsünüz."],
  ["Iade Politikasi", "İade Politikası"],
  ["yaptiginiz ogrenci dogrulanamazsa", "yaptığınız öğrenci doğrulanamazsa"],
  ["bağışınizin", "bağışınızın"],
  ["is gunu icinde", "iş günü içinde"],
  ["ogrenci bekliyor", "öğrenci bekliyor"],
  ["'Demo Ogrenci'", "'Demo Öğrenci'"],
  ["Dogrulanmis", "Doğrulanmış"],
  ["Ogrenci Dogrulanmis", "Öğrenci Doğrulanmış"],
  ["Kimlik ve ogrencilik durumu tam dogrulandi", "Kimlik ve öğrencilik durumu tam doğrulandı"],
  ["Ogrenci belgesi incelendi ve onaylandi", "Öğrenci belgesi incelendi ve onaylandı"],
  ["Ornek Harcama Dokumu", "Örnek Harcama Dökümü"],
  ["Ornek Ogrenci", "Örnek Öğrenci"],
  ["'Ogrenci Belgesi'", "'Öğrenci Belgesi'"],
  ["Detayli Raporlar", "Detaylı Raporlar"],
  ["Gecerli", "Geçerli"],
  ["Ogrenci", "Öğrenci"],
  ["ogrenci", "öğrenci"],
  ["harcama raporu incelendi", "harcama raporu incelendi"],
];

const targetFiles = [
  'app/api/donations/my/export/route.ts',
  'app/verify/page.tsx',
  'components/CharityGuarantee.tsx',
  'components/ProductDonation.tsx',
  'components/ProgressReport.tsx',
  'components/TransparencyCard.tsx',
  'app/reports/page.tsx',
  'app/transparency/page.tsx',
];

let totalChanged = 0;
for (const relPath of targetFiles) {
  const filePath = path.join(rootDir, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${relPath}`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf-8');
  let fileChanges = 0;
  for (const [oldStr, newStr] of replacements) {
    if (oldStr === newStr) continue;
    while (content.includes(oldStr)) {
      content = content.replace(oldStr, newStr);
      fileChanges++;
    }
  }
  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`FIXED ${relPath}: ${fileChanges} replacements`);
    totalChanged += fileChanges;
  }
}
console.log(`\nTotal: ${totalChanged} additional replacements`);
