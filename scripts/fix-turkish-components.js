const fs = require('fs');
const path = require('path');

// Map of [old, new] replacements for hardcoded Turkish strings in components
// These are EXACT substring replacements within quoted strings
const replacements = [
  // ===== app/guarantee/page.tsx =====
  ["Bagis Guvencesi", "Bağış Güvencesi"],
  ["Bagisinizin dogru yere ulasacagindan", "Bağışınızın doğru yere ulaşacağından"],
  ["Bagisim nereye gidiyor?", "Bağışım nereye gidiyor?"],
  ["Bagisiniz %100 dogrudan sectiginiz ogrenciye ulasir. Platform isletme giderleri", "Bağışınız %100 doğrudan seçtiğiniz öğrenciye ulaşır. Platform işletme giderleri"],
  ["bagislarinizdan kesilmez, ayri kurumsal sponsorluklarla karsilanir.", "bağışlarınızdan kesilmez, ayrı kurumsal sponsorluklarla karşılanır."],
  ["Ogrenci dogrulama sureci nasil isler?", "Öğrenci doğrulama süreci nasıl işler?"],
  ["Tum ogrenciler kimlik belgesi, ogrenci belgesi ve transkript ile dogrulanir.", "Tüm öğrenciler kimlik belgesi, öğrenci belgesi ve transkript ile doğrulanır."],
  ["Ayrica universitelerle dogrudan iletisim kurarak bilgileri teyit ederiz.", "Ayrıca üniversitelerle doğrudan iletişim kurarak bilgileri teyit ederiz."],
  ["Ogrenci dogrulanamazsa veya kampanya iptal edilirse, bagisiniz 5-7 is gunu", "Öğrenci doğrulanamazsa veya kampanya iptal edilirse, bağışınız 5-7 iş günü"],
  ["Bu rozetleri tum kampanya ve odeme sayfalarinda gorebilirsiniz:", "Bu rozetleri tüm kampanya ve ödeme sayfalarında görebilirsiniz:"],
  ["Bagis iade sureci nasil isler?", "Bağış iade süreci nasıl işler?"],
  ["icerisinde", "içerisinde"],

  // ===== app/verify/page.tsx =====
  ["Gecersiz dosya turu. Izin verilen:", "Geçersiz dosya türü. İzin verilen:"],
  ["'Ogrenci belgesi / Kayit belgesi'", "'Öğrenci belgesi / Kayıt belgesi'"],
  ["'Ogrenci kimligi'", "'Öğrenci kimliği'"],
  ["'Belgeleri Yukle'", "'Belgeleri Yükle'"],
  ["'Belgeler sadece dogrulama icin kullanilir ve guvenli sekilde saklanir.'", "'Belgeler sadece doğrulama için kullanılır ve güvenli şekilde saklanır.'"],
  ["'Dogrulama Seviyesi Secin'", "'Doğrulama Seviyesi Seçin'"],
  ["shortTitle: 'Egitim'", "shortTitle: 'Eğitim'"],
  ["'Egitim Bilgileri'", "'Eğitim Bilgileri'"],
  ["'Belge Yukle'", "'Belge Yükle'"],
  ["shortTitle: 'Gonder'", "shortTitle: 'Gönder'"],
  ["'Incele ve Gonder'", "'İncele ve Gönder'"],
  ["'Lutfen zorunlu alanlari doldurun'", "'Lütfen zorunlu alanları doldurun'"],
  ["'Dogrulama basvurusu basariyla gonderildi!'", "'Doğrulama başvurusu başarıyla gönderildi!'"],
  ["'Basvuru gonderilemedi. Lutfen tekrar deneyin.'", "'Başvuru gönderilemedi. Lütfen tekrar deneyin.'"],
  ["'Basvuru Zaten Gonderildi'", "'Başvuru Zaten Gönderildi'"],
  ["'Dogrulama durumunuzu kontrol edin.'", "'Doğrulama durumunuzu kontrol edin.'"],
  ["'Durumu Goruntule'", "'Durumu Görüntüle'"],
  ["'Yukleniyor...'", "'Yükleniyor...'"],
  ["'Ogrenci Dogrulamasi'", "'Öğrenci Doğrulaması'"],
  ["'Bagiscilarin guvenini artirmak icin dogrulama seviyeni sec ve gerekli belgeleri yukle.'", "'Bağışçıların güvenini artırmak için doğrulama seviyeni seç ve gerekli belgeleri yükle.'"],
  ["'Belge ile Dogrulama'", "'Belge ile Doğrulama'"],
  ["'Ogrenci belgesi veya kayit belgesi yukleyerek dogrula.'", "'Öğrenci belgesi veya kayıt belgesi yükleyerek doğrula.'"],
  ["'Gerekli: Ogrenci belgesi'", "'Gerekli: Öğrenci belgesi'"],
  ["'Gerekli: Ogrenci belgesi, Portal ekran goruntusu'", "'Gerekli: Öğrenci belgesi, Portal ekran görüntüsü'"],
  ["'Okul E-postasi ile Hizli Dogrulama'", "'Okul E-postası ile Hızlı Doğrulama'"],
  ["'Okul e-postaniza bir dogrulama baglantisi gondeririz.'", "'Okul e-postanıza bir doğrulama bağlantısı göndeririz.'"],
  ["'Universite'", "'Üniversite'"],
  ["'Ogrenci No (Opsiyonel)'", "'Öğrenci No (Opsiyonel)'"],
  ["'Tam zamanli ogrenci'", "'Tam zamanlı öğrenci'"],
  ["'Aktif olarak tam zamanli egitime devam ediyorum'", "'Aktif olarak tam zamanlı eğitime devam ediyorum'"],
  ["'Gondererek, saglanan tum bilgilerin dogru oldugunu onaylayabilirsiniz", "'Göndererek, sağlanan tüm bilgilerin doğru olduğunu onaylayabilirsiniz"],
  // handle 'Gonderiliyor...' as text content
  ["Gonderiliyor...", "Gönderiliyor..."],
  ["'Incelemeye Gonder'", "'İncelemeye Gönder'"],
  ["Kisisel Bilgiler", "Kişisel Bilgiler"],

  // ===== app/transparency/page.tsx =====
  ["Seffaflik", "Şeffaflık"],
  ["Her bagis, dogrulanmis ogrencilere ulasir ve her harcama raporlanir", "Her bağış, doğrulanmış öğrencilere ulaşır ve her harcama raporlanır"],
  ["Toplam Bagis", "Toplam Bağış"],
  ["Desteklenen Ogrenci", "Desteklenen Öğrenci"],
  ["Dogrulama Orani", "Doğrulama Oranı"],
  ["Ogrenciye Ulasan", "Öğrenciye Ulaşan"],
  ["Dogrulama Sistemi", "Doğrulama Sistemi"],
  ["Universite tarafindan teyit edildi", "Üniversite tarafından teyit edildi"],
  ["Kimlik Dogrulama", "Kimlik Doğrulama"],
  ["Fon Dagilimi", "Fon Dağılımı"],
  ["Universite harc ve ucretleri", "Üniversite harç ve ücretleri"],

  // ===== app/security/page.tsx =====
  ["Odeme islemleri PCI DSS standartlarinda islem goren iyzico altyapisi ile yapilir.", "Ödeme işlemleri PCI DSS standartlarında işlem gören iyzico altyapısı ile yapılır."],
  ["Guvenlik Denetimleri", "Güvenlik Denetimleri"],
  ["Duzenli guvenlik taramalari ve penetrasyon testleri ile sistemimiz surekli izlenir.", "Düzenli güvenlik taramaları ve penetrasyon testleri ile sistemimiz sürekli izlenir."],
  ["kullanicilarimizin ve ogrencilerin verilerini en yuksek guvenlik standartlariyla koruyoruz.", "kullanıcılarımızın ve öğrencilerin verilerini en yüksek güvenlik standartlarıyla koruyoruz."],
  ["Guvenlik Onlemlerimiz", "Güvenlik Önlemlerimiz"],
  ["Uygulanan Guvenlik Basliklari", "Uygulanan Güvenlik Başlıkları"],
  ["Guclu sifre politikalari", "Güçlü şifre politikaları"],
  ["iki faktorlu dogrulama (2FA) ve oturum yonetimi ile hesabiniz guvendedir.", "iki faktörlü doğrulama (2FA) ve oturum yönetimi ile hesabınız güvendedir."],
  ["7/24 guvenlik izleme", "7/24 güvenlik izleme"],
  ["anormal aktivite tespiti, otomatik uyarilar ve", "anormal aktivite tespiti, otomatik uyarılar ve"],
  ["detayli guvenlik loglar ile sistemimiz surekli gozlem altindadir.", "detaylı güvenlik logları ile sistemimiz sürekli gözlem altındadır."],
  ["Guvenlik Acigi mi Buldunuz?", "Güvenlik Açığı mı Buldunuz?"],
  ["Platformumuzda bir guvenlik acigi bulduysaniz, lutfen bize bildirin.", "Platformumuzda bir güvenlik açığı bulduysanız, lütfen bize bildirin."],
  ["Sorumlu aciklama politikamiz kapsaminda size tesekkur edecegiz.", "Sorumlu açıklama politikamız kapsamında size teşekkür edeceğiz."],
  ["Guvenli Odeme Altyapisi", "Güvenli Ödeme Altyapısı"],
  ["FundEd olarak, platformumuzu kullanan tum", "FundEd olarak, platformumuzu kullanan tüm"],
  ["Veri Sifreleme", "Veri Şifreleme"],
  ["hassas verileriniz sifrelenir", "hassas verileriniz şifrelenir"],
  ["Izleme & Tespit", "İzleme & Tespit"],

  // ===== app/reports/page.tsx =====
  ["Demo Ogrenci A", "Demo Öğrenci A"],
  ["Demo Ogrenci B", "Demo Öğrenci B"],
  ["Tum Ilerleme Raporlari - FundEd", "Tüm İlerleme Raporları - FundEd"],
  ["FundEd Ilerleme Raporlari", "FundEd İlerleme Raporları"],
  ["Tum ogrenci raporlari", "Tüm öğrenci raporları"],
  ["Genel Ozet", "Genel Özet"],

  // ===== app/stories/page.tsx =====
  ["Bagiscilarin destegi sadece maddi degil, moral olarak da cok degerli.", "Bağışçıların desteği sadece maddi değil, moral olarak da çok değerli."],

  // ===== app/sponsors/page.tsx =====
  ["Z Egitim", "Z Eğitim"],
  ["Egitim platformu", "Eğitim platformu"],
  ["Bir hata olustu. Lutfen tekrar deneyin.", "Bir hata oluştu. Lütfen tekrar deneyin."],
  ["egitimde esitlik icin birlikte yol yuruten degerli is ortaklarimiz.", "eğitimde eşitlik için birlikte yol yürüten değerli iş ortaklarımız."],
  ["her ogrencinin esit ve daha iyi bir egitim hayati olmasi gerektigine inaniyoruz.", "her öğrencinin eşit ve daha iyi bir eğitim hayatı olması gerektiğine inanıyoruz."],
  ["egitimde firsat esitligi vizyonumuzu gercege donusturmemize yardimci oluyor.", "eğitimde fırsat eşitliği vizyonumuzu gerçeğe dönüştürmemize yardımcı oluyor."],
  ["teknolojimizi gelistirebiliyor ve egitim ekosistemini guclendiriyoruz.", "teknolojimizi geliştirebiliyor ve eğitim ekosistemini güçlendiriyoruz."],
  ["gucu buyutmek ve egitimde adaleti saglamak icin", "gücü büyütmek ve eğitimde adaleti sağlamak için"],
  ["egitimde esitlik icin birlikte calisan kurumlar", "eğitimde eşitlik için birlikte çalışan kurumlar"],
  ["Egitimde esitlik icin platformumuzu buyutmemize yardimci olun. Birlikte daha fazla ogrenciye ulasalim.", "Eğitimde eşitlik için platformumuzu büyütmemize yardımcı olun. Birlikte daha fazla öğrenciye ulaşalım."],
  ["Sponsor Basvuru Formu", "Sponsor Başvuru Formu"],
  ["Basvuru Gonder", "Başvuru Gönder"],

  // ===== app/updates/page.tsx =====
  ["'tesekkur'", "'teşekkür'"],
  ["'basari'", "'başarı'"],
  ["'universite'", "'üniversite'"],

  // ===== app/admin/sponsor-applications/page.tsx =====
  ["Henuz basvuru bulunmuyor.", "Henüz başvuru bulunmuyor."],
  ["Onceki", "Önceki"],
  ["Basvuru Detayi", "Başvuru Detayı"],
  ["Basvuru Tarihi", "Başvuru Tarihi"],
  ["Bu basvuru hakkinda notlariniz...", "Bu başvuru hakkında notlarınız..."],

  // ===== app/api/sponsor-applications/route.ts =====
  ["Basvurunuz basariyla alindi.", "Başvurunuz başarıyla alındı."],
  ["Basvuru gonderildi", "Başvuru gönderildi"],

  // ===== app/api/admin/sponsor-applications/[id]/route.ts =====
  ["Gecersiz basvuru ID.", "Geçersiz başvuru ID."],
  ["Gecersiz durum. Gecerli degerler:", "Geçersiz durum. Geçerli değerler:"],
  ["Basvuru bulunamadi.", "Başvuru bulunamadı."],
  ["Basvuru guncellendi.", "Başvuru güncellendi."],
  ["Basvuru silindi.", "Başvuru silindi."],

  // ===== app/corporate/auth/login/page.tsx =====
  ["EGITIM20", "EĞİTİM20"],

  // ===== components/ThankYouMessage.tsx =====
  ["tesekkur ediyor", "teşekkür ediyor"],
  ["Tesekkur Videosu", "Teşekkür Videosu"],
  ["icin Tesekkur Mesaji", "için Teşekkür Mesajı"],
  ["Bagisci icin tesekkur mesajinizi yazin...", "Bağışçı için teşekkür mesajınızı yazın..."],
  ["Video yuklemek icin tiklayin", "Video yüklemek için tıklayın"],
  ["Tesekkur Gonder", "Teşekkür Gönder"],
  ["Universite harcliklami rahatca odeyebildim. Cok tesekkur ederim!", "Üniversite harçlığımı rahatça ödeyebildim. Çok teşekkür ederim!"],

  // ===== components/StudentBlog.tsx =====
  ["Yeni Gonderi", "Yeni Gönderi"],
  ["Bagisclarinla paylasacagin bir guncelleme yaz...", "Bağışçılarınla paylaşacağın bir güncelleme yaz..."],
  ["Bu donem cok yogun gecti ama sonunda finalleri bitirdim", "Bu dönem çok yoğun geçti ama sonunda finalleri bitirdim"],
  ["odaklanmazdim", "odaklanamazdım"],
  ["Ozellikle", "Özellikle"],
  ["bagisi", "bağışı"],
  ["tesekkurler", "teşekkürler"],
  ["Artik", "Artık"],
  ["staji", "stajı"],
  ["icin basvurdum", "için başvurdum"],
  ["hazirlaniyor", "hazırlanıyor"],
  ["hazirlanmaya baslayabilirim", "hazırlanmaya başlayabilirim"],
  ["Google'a yaz staji icin basvurdum ve ilk mulakati gectim!", "Google'a yaz stajı için başvurdum ve ilk mülakatı geçtim!"],
  ["mulakati gecmek", "mülakatı geçmek"],
  ["calisiyorum", "çalışıyorum"],
  ["Bahar donemi icin kayit yaptirdim", "Bahar dönemi için kayıt yaptırdım"],
  ["'yenidonem'", "'yenidönem'"],
  ["aldıgım", "aldığım"],
  ["bu donem", "bu dönem"],
  ["karsilayabildim", "karşılayabildim"],
  ["odaklanamazdim", "odaklanamazdım"],
  ["Cok tesekkur", "Çok teşekkür"],
  ["Universitemizin duzenledigı hackathon yarismasinda", "Üniversitemizin düzenlediği hackathon yarışmasında"],
  ["egitimde firsat esitligi", "eğitimde fırsat eşitliği"],
  ["uzerineydi", "üzerineydi"],
  ["basariyi", "başarıyı"],
  ["paylasacak", "paylaşacak"],

  // ===== components/ProgressReport.tsx =====
  ["Ilerleme Raporu", "İlerleme Raporu"],
  ["Akademik Ilerleme", "Akademik İlerleme"],
  ["Finansal Ozet", "Finansal Özet"],
  ["Alinan Bagis", "Alınan Bağış"],
  ["Demo Guncelleme", "Demo Güncelleme"],
  ["Bu bir demo guncellemesidir.", "Bu bir demo güncellemesidir."],

  // ===== components/TransparencyCard.tsx =====
  ["Dogrulama Bekliyor", "Doğrulama Bekliyor"],
  ["icin toplanan fonlarin nasil kullanildigini gorun", "için toplanan fonların nasıl kullanıldığını görün"],
  ["Son guncelleme:", "Son güncelleme:"],
  ["Dogrulama Belgeleri", "Doğrulama Belgeleri"],

  // ===== components/CharityGuarantee.tsx =====
  ["100% Bagis Guvencesi", "100% Bağış Güvencesi"],
  ["Dogrulama Sureci", "Doğrulama Süreci"],
  ["Seffaf Raporlama", "Şeffaf Raporlama"],
  ["FundEd Guvencesi", "FundEd Güvencesi"],
  ["Bagisiniz %100 guvenli ve seffaf", "Bağışınız %100 güvenli ve şeffaf"],
  ["FundEd Bagis Guvencesi", "FundEd Bağış Güvencesi"],
  ["'Dogrulama'", "'Doğrulama'"],
  ["FundEd Guvenli", "FundEd Güvenli"],
  ["Bagis", "Bağış"],

  // ===== components/ProductDonation.tsx =====
  ["Ogrenciler icin temel bilgisayar ihtiyaci", "Öğrenciler için temel bilgisayar ihtiyacı"],
  ["Ders takibi ve notlar icin", "Ders takibi ve notlar için"],
  ["Online dersler icin kaliteli kulaklik", "Online dersler için kaliteli kulaklık"],
  ["Universite ders kitaplari", "Üniversite ders kitapları"],
  ["Urun Bagisi", "Ürün Bağışı"],
  ["ihtiyac duydugu urunleri bagisin", "ihtiyaç duyduğu ürünleri bağışın"],
  ["Bagislamak Istediginiz Urun", "Bağışlamak İstediğiniz Ürün"],
  ["Kargo ile Gonder", "Kargo ile Gönder"],
  ["Kargo/kurye icin adresiniz", "Kargo/kurye için adresiniz"],

  // ===== components/SocialShare.tsx =====
  ["EgitimeDestek", "EğitimeDestek"],
  ["Ilerleme", "İlerleme"],
  ["Egitim hayallerine destek ol!", "Eğitim hayallerine destek ol!"],

  // ===== components/MilestoneCelebration.tsx =====
  // "icin" in template strings - handled generically below

  // ===== General catch-all patterns for remaining "icin" =====
  // These are common enough to apply globally
];

// Files to process
const targetFiles = [
  'app/guarantee/page.tsx',
  'app/verify/page.tsx',
  'app/transparency/page.tsx',
  'app/security/page.tsx',
  'app/reports/page.tsx',
  'app/stories/page.tsx',
  'app/sponsors/page.tsx',
  'app/updates/page.tsx',
  'app/admin/sponsor-applications/page.tsx',
  'app/api/sponsor-applications/route.ts',
  'app/api/admin/sponsor-applications/[id]/route.ts',
  'app/corporate/auth/login/page.tsx',
  'components/ThankYouMessage.tsx',
  'components/StudentBlog.tsx',
  'components/ProgressReport.tsx',
  'components/TransparencyCard.tsx',
  'components/CharityGuarantee.tsx',
  'components/ProductDonation.tsx',
  'components/SocialShare.tsx',
  'components/MilestoneCelebration.tsx',
];

const rootDir = path.join(__dirname, '..');
let totalChanged = 0;
let filesChanged = 0;

for (const relPath of targetFiles) {
  const filePath = path.join(rootDir, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${relPath}`);
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
    filesChanged++;
  } else {
    console.log(`NO CHANGES: ${relPath}`);
  }
}

console.log(`\nTotal: ${totalChanged} replacements in ${filesChanged} files`);
