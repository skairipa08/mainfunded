const fs = require('fs');
const content = fs.readFileSync('locales/tr.json', 'utf-8');
const data = JSON.parse(content);

const badWords = [
  [/\bBagis\b/, 'Bağış'], [/\bbagis\b/, 'bağış'],
  [/\bOgrenci\b/, 'Öğrenci'], [/\bOgretmen\b/, 'Öğretmen'],
  [/\bGiris\b/, 'Giriş'], [/\bCikis\b/, 'Çıkış'],
  [/\bSifre\b/, 'Şifre'], [/\bSeffaf/, 'Şeffaf'],
  [/\bGuvence/, 'Güvence'], [/\bDogrula\b/, 'Doğrula'],
  [/\bYonetici\b/, 'Yönetici'], [/\bIptal\b/, 'İptal'],
  [/\bIlerleme\b/, 'İlerleme'], [/\bInceleme\b/, 'İnceleme'],
  [/\bLutfen\b/, 'Lütfen'], [/\bGecersiz\b/, 'Geçersiz'],
  [/\bTurkce\b/, 'Türkçe'], [/\bBasarili\b/, 'Başarılı'],
  [/\bOlustur/, 'Oluştur'], [/\bDuzenle/, 'Düzenle'],
  [/\bGoruntule/, 'Görüntüle'], [/\bYukleniyor/, 'Yükleniyor'],
  [/\bHakkimizda\b/, 'Hakkımızda'], [/\bNasil\b/, 'Nasıl'],
  [/\bCalisir\b/, 'Çalışır'], [/\bBasla\b/, 'Başla'],
  [/\bBasvur/, 'Başvur'], [/\bbasvur/, 'başvur'],
  [/\bTumu\b/, 'Tümü'], [/\bHicbiri\b/, 'Hiçbiri'],
  [/\bNumarayi\b/, 'Numarayı'], [/\bHesabiniz\b/, 'Hesabınız'],
];

let found = 0;
function check(val, path) {
  if (typeof val === 'string') {
    if (val.includes('@') && val.includes('.')) return;
    for (const [pat, correct] of badWords) {
      if (pat.test(val)) {
        console.log(`[${path}] has "${pat.source}" -> should be "${correct}"`);
        console.log(`  Value: ${val.substring(0, 120)}`);
        found++;
      }
    }
  } else if (typeof val === 'object' && val !== null) {
    for (const [k, v] of Object.entries(val)) {
      check(v, path ? `${path}.${k}` : k);
    }
  }
}
check(data, '');
console.log(`\nTotal remaining issues: ${found}`);
