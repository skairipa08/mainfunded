// ═══════════════════════════════════════════════════════════════
// FundEd AI Assistant — Knowledge Base
// Sitedeki tüm bilgilerden derlenen kapsamlı bilgi tabanı
// ═══════════════════════════════════════════════════════════════

export interface KnowledgeEntry {
  id: string;
  category: KnowledgeCategory;
  keywords: string[];
  question: string;
  answer: string;
  followUp?: string;
  priority: number; // 1-10, yüksek = daha önemli
}

export type KnowledgeCategory =
  | 'about'
  | 'how_it_works'
  | 'donation'
  | 'payment'
  | 'security'
  | 'student'
  | 'donor'
  | 'account'
  | 'campaign'
  | 'impact'
  | 'badges'
  | 'calendar'
  | 'technical'
  | 'legal'
  | 'emotional'
  | 'verification'
  | 'mentor'
  | 'corporate'
  | 'alumni'
  | 'product_donation'
  | 'sponsor';

// ═══════════════════════════════════════════════════════════════
// ANA BİLGİ TABANI
// ═══════════════════════════════════════════════════════════════

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ─── HAKKINDA ────────────────────────────────────────────────
  {
    id: 'about-1',
    category: 'about',
    keywords: ['funded', 'nedir', 'ne', 'platform', 'site', 'hakkında', 'tanıt', 'kimsiniz', 'siz'],
    question: 'FundEd nedir?',
    answer: 'FundEd, maddi desteğe ihtiyacı olan üniversite öğrencilerini bağışçılarla buluşturan bir eğitim kitlesel fonlama platformudur. Öğrenciler kampanya oluşturur, bağışçılar ise bu kampanyalara destek olarak öğrencilerin eğitim hayallerini gerçekleştirmelerine yardımcı olur.',
    followUp: 'Bir öğrenciye bağış yapmak ister misiniz?',
    priority: 10,
  },
  {
    id: 'about-2',
    category: 'about',
    keywords: ['misyon', 'amaç', 'vizyon', 'hedef', 'neden', 'kuruldu'],
    question: 'FundEd\'in amacı nedir?',
    answer: 'FundEd\'in misyonu eğitimde fırsat eşitliği sağlamaktır. Türkiye\'de birçok yetenekli öğrenci maddi imkânsızlıklar yüzünden eğitimini yarıda bırakmak zorunda kalıyor. Biz, bağışçılarla öğrencileri bir araya getirerek bu sorunu çözmeyi hedefliyoruz. Her bağış bir hayatı değiştirebilir!',
    priority: 9,
  },
  {
    id: 'about-3',
    category: 'about',
    keywords: ['fark', 'diğer', 'farklı', 'özel', 'benzersiz', 'avantaj', 'neden funded'],
    question: 'FundEd\'i diğer platformlardan ayıran ne?',
    answer: 'FundEd\'i özel kılan birkaç şey var:\n\n🎯 Doğrudan Etki: Bağışınız direkt olarak seçtiğiniz öğrenciye ulaşır.\n🏅 Rozet Sistemi: Bağışlarınızla rozetler kazanır, seviyenizi yükseltirsiniz.\n📊 Şeffaflık: Kampanya ilerlemesini gerçek zamanlı takip edebilirsiniz.\n📅 Etki Takvimi: Bağış geçmişinizi ve özel günleri takip edebilirsiniz.\n🔥 Bağış Serisi: Aylık düzenli bağışlarla streak oluşturabilirsiniz.\n🤖 Akıllı Eşleştirme: Size en uygun öğrenciyi bulmanıza yardımcı oluyoruz.',
    priority: 8,
  },

  // ─── NASIL ÇALIŞIR ──────────────────────────────────────────
  {
    id: 'how-1',
    category: 'how_it_works',
    keywords: ['nasıl', 'çalışır', 'işliyor', 'süreç', 'adım', 'başla', 'kullan'],
    question: 'FundEd nasıl çalışır?',
    answer: 'FundEd 3 basit adımda çalışır:\n\n1️⃣ Öğrenci Kampanya Oluşturur: Öğrenci, eğitim ihtiyaçlarını anlatan bir kampanya sayfası oluşturur (okul masrafları, kitap, barınma vb.)\n\n2️⃣ Bağışçı Keşfeder: Siz kampanyaları inceler, size en yakın hissettiren öğrenciyi seçersiniz.\n\n3️⃣ Bağış Yapılır: Dilediğiniz miktarda bağış yapar, öğrencinin eğitim yolculuğuna ortak olursunuz.\n\nKampanya hedefine ulaştığında öğrenci fonlara erişir! 🎓',
    followUp: 'Hemen bir kampanya incelemek ister misiniz?',
    priority: 10,
  },
  {
    id: 'how-2',
    category: 'how_it_works',
    keywords: ['kayıt', 'üye', 'hesap aç', 'kaydol', 'register', 'signup'],
    question: 'Nasıl kayıt olabilirim?',
    answer: 'Kayıt olmak çok kolay!\n\n👤 Sağ üst köşedeki "Kayıt Ol" butonuna tıklayın.\n📧 E-posta adresinizi girin ve bir şifre belirleyin.\n✅ Hesabınız anında aktif olur!\n\nBağışçı olarak kayıt olabilir veya öğrenciyseniz kampanya oluşturmak için başvurabilirsiniz.',
    priority: 9,
  },
  {
    id: 'how-3',
    category: 'how_it_works',
    keywords: ['öğrenci nasıl', 'kampanya oluştur', 'kampanya aç', 'başvur', 'öğrenci başvuru'],
    question: 'Öğrenci olarak nasıl kampanya oluşturabilirim?',
    answer: 'Öğrenci olarak kampanya oluşturmak için:\n\n1. Kayıt olun ve öğrenci hesabı açın.\n2. "Kampanya Oluştur" sayfasına gidin.\n3. Bilgilerinizi doldurun: Üniversite, bölüm, sınıf, ihtiyaç tutarı.\n4. Hikayenizi anlatın: Neden desteğe ihtiyacınız olduğunu açıklayın.\n5. Fotoğraf ekleyin ve kampanyanızı gönderin.\n\nKampanyanız onaylandıktan sonra bağış almaya başlarsınız!',
    priority: 8,
  },

  // ─── BAĞIŞ SÜRECİ ──────────────────────────────────────────
  {
    id: 'donation-1',
    category: 'donation',
    keywords: ['bağış', 'nasıl bağış', 'bağış yap', 'destek', 'yardım', 'donate'],
    question: 'Nasıl bağış yapabilirim?',
    answer: 'Bağış yapmak çok kolay!\n\n1. Kampanyalar sayfasından bir öğrenci seçin (veya ben size önerebilirim! 😊)\n2. Kampanya detay sayfasında "Bağış Yap" butonuna tıklayın.\n3. Bağış miktarınızı girin.\n4. Ödeme bilgilerinizi girin.\n5. Bağışınız anında öğrencinin kampanyasına eklenir! ✅\n\nİsterseniz anonim bağış da yapabilirsiniz.',
    followUp: 'Size uygun bir öğrenci bulmamı ister misiniz?',
    priority: 10,
  },
  {
    id: 'donation-2',
    category: 'donation',
    keywords: ['minimum', 'en az', 'alt limit', 'kaç tl', 'ne kadar', 'miktar', 'tutar', 'maksimum', 'en fazla'],
    question: 'En az ne kadar bağış yapabilirim?',
    answer: 'Minimum bağış miktarları:\n\n🇹🇷 Türk Lirası: En az ₺100\n🇺🇸 Dolar: En az $10\n💰 Maksimum: $1.000.000\n\nHızlı bağış miktarları: $25, $50, $100, $250, $500, $1.000\n\nÖrnek etkiler:\n- $25 → Öğrencinin temel defter ve kalem ihtiyaçları\n- $50 → Bir öğrencinin okul çantası ihtiyacı\n- $100 → Bir çocuğun 1 yıllık okul malzemesi\n- $250 → Bir sınıfa dijital eğitim materyali\n- $750 → Bir öğrencinin 1 dönemlik bursu\n- $2.500 → Bir sınıfın yenilenmesi',
    priority: 9,
  },
  {
    id: 'donation-3',
    category: 'donation',
    keywords: ['anonim', 'gizli', 'isim', 'görünme', 'kimse bilmesin', 'adım görünmesin'],
    question: 'Anonim bağış yapabilir miyim?',
    answer: 'Evet! Bağış yaparken "Anonim bağış yap" seçeneğini işaretleyebilirsiniz. Bu durumda:\n\n🔒 İsminiz kampanya sayfasında görünmez.\n🔒 Öğrenci bağışçı adını göremez.\n🔒 Sadece bağış miktarı kampanya toplamına eklenir.\n\nAncak isterseniz isminizle de bağış yapabilir, öğrencinin size teşekkür etmesini sağlayabilirsiniz. 😊',
    priority: 7,
  },
  {
    id: 'donation-4',
    category: 'donation',
    keywords: ['düzenli', 'aylık', 'otomatik', 'tekrar', 'abonelik', 'sürekli', 'periyodik', 'haftalık', 'yıllık'],
    question: 'Düzenli/aylık bağış yapabilir miyim?',
    answer: 'Evet! FundEd\'de düzenli bağış yapabilirsiniz: 📅\n\n🔄 Bağış Sıklığı Seçenekleri:\n- Tek Seferlik\n- Haftalık\n- Aylık (önerilen)\n- 3 Ayda Bir\n- Yıllık\n\n🔥 Ayrıca bağış serisi (streak) sistemimiz var — art arda her ay bağış yaparak streak\'inizi uzatabilir ve özel rozetler kazanabilirsiniz!\n\n💡 "Evet, düzenli destekçi olmak istiyorum" seçeneğiyle kaydolabilirsiniz.',
    priority: 7,
  },
  {
    id: 'donation-5',
    category: 'donation',
    keywords: ['iade', 'geri', 'iptal', 'vazgeç', 'geri al', 'para iade', 'refund', 'cancel'],
    question: 'Bağışımı geri alabilir miyim?',
    answer: 'FundEd bağış güvencesi kapsamında:\n\n✅ Bağış yaptığınız öğrenci doğrulanamazsa veya kampanya iptal edilirse, bağışınızın %100\'ü 5-7 iş günü içinde iade edilir.\n\n⚠️ Normal koşullarda bağışlar geri alınamaz çünkü doğrudan öğrenciye aktarılır.\n📧 Yanlışlıkla yapılan bağışlar için info@funded.com adresine yazabilirsiniz.\n\n🔒 Bağışınız %100 doğrudan seçtiğiniz öğrenciye ulaşır — platform işletme giderleri bağışlarınızdan kesilmez, ayrı kurumsal sponsorluklarla karşılanır.',
    priority: 7,
  },
  {
    id: 'donation-6',
    category: 'donation',
    keywords: ['kampanya bitti', 'hedef aşıldı', 'fazla', 'hedef', 'bitti', 'kapandı', 'tamamlandı', 'ulaşamaz', 'başarısız', 'süre', 'dol', 'fail', 'goal'],
    question: 'Kampanya hedefe ulaşırsa/ulaşamazsa ne olur?',
    answer: 'Kampanya hedefine ulaştığında:\n\n✅ Kampanya otomatik olarak kapanır ve toplanan fonlar öğrenciye aktarılır.\n🎉 Tüm bağışçılara teşekkür bildirimi gönderilir.\n\nHedefe ulaşamazsa bile:\n\n💰 Kampanya süresi dolduğunda toplanan miktar yine öğrenciye aktarılır.\n🌟 Böylece her bağış anlamlıdır — kısmi destek de çok değerli!',
    priority: 7,
  },

  // ─── ÖDEME ──────────────────────────────────────────────────
  {
    id: 'payment-1',
    category: 'payment',
    keywords: ['ödeme', 'nasıl öde', 'kredi kartı', 'kart', 'havale', 'eft', 'banka', 'ödeme yöntemi', 'visa', 'mastercard'],
    question: 'Hangi ödeme yöntemlerini kullanabilirim?',
    answer: 'FundEd\'de güvenli ödeme seçenekleri sunuyoruz:\n\n💳 Kredi Kartı / Banka Kartı: Visa, Mastercard, Troy\n🏦 Havale/EFT: Banka bilgileri kampanya sayfasında yer alır\n\nTüm kart ödemeleri SSL şifreleme ile korunmaktadır. Kart bilgileriniz sunucularımızda saklanmaz.',
    priority: 9,
  },
  {
    id: 'payment-2',
    category: 'payment',
    keywords: ['vergi', 'vergi indirimi', 'makbuz', 'fatura', 'vergi avantajı', 'tax', 'receipt'],
    question: 'Vergi indirimi alabilir miyim?',
    answer: 'FundEd bir kitlesel fonlama platformu olarak hizmet vermektedir. Vergi indirimi konusunda kesin bilgi için mali müşavirinize danışmanızı öneririz.\n\n📄 Bağış makbuzunuzu profil sayfanızdan indirebilirsiniz.\n📧 Detaylı bilgi için: info@funded.com',
    priority: 6,
  },
  {
    id: 'payment-3',
    category: 'payment',
    keywords: ['komisyon', 'kesinti', 'ücret', 'fee', 'commission', 'cut', 'charge', 'yüzde', 'platform ücreti', 'saas'],
    question: 'FundEd komisyon alıyor mu?',
    answer: 'FundEd şeffaf bir ücretlendirme uygular:\n\n💰 Bağışlarınızın %95\'i doğrudan öğrenciye aktarılır.\n🏢 %5 platform kesintisi uygulanır (sürdürülebilirlik için).\n💡 Ayrıca bağış sırasında isteğe bağlı platform tip\'i (min %2) ekleyebilirsiniz.\n\n📌 Not: Platform işletme giderleri ayrıca kurumsal sponsorluklarla da karşılanmaktadır. Detaylar için şeffaflık sayfamızı ziyaret edebilirsiniz.',
    priority: 7,
  },

  // ─── GÜVENLİK & GÜVEN ──────────────────────────────────────
  {
    id: 'security-1',
    category: 'security',
    keywords: ['güvenilir', 'güven', 'dolandırıcı', 'sahte', 'gerçek', 'meşru', 'emin', 'güvenebilir', 'scam', 'fraud', 'trust', 'safe'],
    question: 'FundEd güvenilir mi?',
    answer: 'FundEd %100 güvenilir bir platformdur:\n\n✅ Doğrulanmış Öğrenciler: Her kampanya oluşturan öğrenci kimlik ve öğrenci belgesi doğrulamasından geçer.\n✅ Şeffaf Süreç: Tüm bağışlar ve kampanya ilerlemeleri açıkça gösterilir.\n✅ Güvenli Ödeme: SSL şifreli, PCI uyumlu ödeme sistemi.\n✅ Gerçek Zamanlı Takip: Bağışınızın nereye gittiğini her zaman görebilirsiniz.\n✅ Admin Denetimi: Tüm kampanyalar admin ekibi tarafından incelenir.',
    priority: 10,
  },
  {
    id: 'security-2',
    category: 'security',
    keywords: ['doğrulama', 'onay', 'kontrol', 'sahte kampanya', 'gerçek mi', 'doğru mu', 'verification', 'verify', 'belge'],
    question: 'Öğrenciler gerçekten doğrulanıyor mu?',
    answer: 'Evet! Kampanya onay sürecimiz şöyle işler:\n\n1. 📋 Öğrenci belgesi kontrolü (e-Devlet veya üniversite onayı)\n2. 🪪 Kimlik doğrulaması\n3. 🔍 Admin ekibi tarafından kampanya içeriği incelemesi\n4. ✅ Onay sonrası kampanya yayına alınır\n\nSahte veya yanıltıcı kampanyalar anında kaldırılır.',
    priority: 9,
  },
  {
    id: 'security-3',
    category: 'security',
    keywords: ['güvende', 'güvenli', 'ödeme', 'kart', 'bilgi', 'sakla', 'ssl', 'secure', 'payment', 'hack', 'çalınma', '3d'],
    question: 'Ödeme bilgilerim güvende mi?',
    answer: 'Kesinlikle! Ödeme güvenliği bizim için en önemli önceliktir:\n\n🔒 256-bit SSL şifreleme ile korumalı bağlantı\n🔒 Kart bilgileriniz sunucularımızda saklanmaz\n🔒 PCI DSS uyumlu ödeme altyapısı (iyzico/Stripe)\n🔒 3D Secure doğrulama desteği\n\nBağışınızı gönül rahatlığıyla yapabilirsiniz!',
    priority: 10,
  },
  {
    id: 'security-4',
    category: 'security',
    keywords: ['para nere', 'para gidiyor', 'nereye gidiyor', 'ulaşıyor mu', 'öğrenciye', 'kullanım'],
    question: 'Param gerçekten öğrenciye ulaşıyor mu?',
    answer: 'Evet, bağışınız doğrudan öğrenciye ulaşır! 💯\n\n📊 Kampanya sayfasında toplanan miktarı gerçek zamanlı görebilirsiniz.\n📧 Bağış sonrası onay e-postası alırsınız.\n🔔 Kampanya tamamlandığında bildirim alırsınız.\n\nAyrıca öğrenciler bağışçılarına teşekkür mesajı gönderebilir. Şeffaflık bizim temel değerimizdir!',
    priority: 10,
  },

  // ─── ÖĞRENCİ / KAMPANYA ────────────────────────────────────
  {
    id: 'student-1',
    category: 'student',
    keywords: ['hangi öğrenci', 'seçim', 'seç', 'hangisi', 'öğrenci bul', 'uygun', 'karar', 'kararsız', 'seçemiyorum'],
    question: 'Hangi öğrenciye bağış yapacağıma karar veremiyorum',
    answer: 'Karar vermek zor olabilir, çünkü hepsi desteği hak ediyor! 💙 Size yardımcı olabilirim:\n\n🎯 Akıllı Eşleştirme: Birkaç basit soruyla size en uygun öğrenciyi bulabilirim.\n🔥 Acil İhtiyaç: En acil desteğe ihtiyacı olan kampanyaları gösterebilirim.\n📊 Az Kaldı: Hedefe en yakın kampanyaları gösterebilirim — son dokunuş sizin olsun!\n\n"Öğrenci bul" demeniz yeterli! 😊',
    followUp: 'Size birkaç soru sorup en uygun öğrenciyi bulayım mı?',
    priority: 10,
  },
  {
    id: 'student-2',
    category: 'student',
    keywords: ['iletişim', 'öğrenciyle', 'konuş', 'mesaj', 'yazış', 'teşekkür', 'contact', 'ulaş'],
    question: 'Öğrenciyle iletişime geçebilir miyim?',
    answer: 'Bağış yaptığınız öğrenci size platform üzerinden teşekkür mesajı gönderebilir. 💌\n\nAncak gizlilik nedeniyle doğrudan kişisel iletişim bilgileri paylaşılmaz. Bu hem öğrencinin hem bağışçının güvenliği içindir.\n\nKampanya sayfasında öğrencinin hikayesini, eğitim hedeflerini ve gelişmelerini takip edebilirsiniz.',
    priority: 7,
  },
  {
    id: 'student-3',
    category: 'student',
    keywords: ['kampanya türü', 'ne için', 'ihtiyaç', 'harcama', 'ne', 'kullanıyor', 'masraf', 'nereye'],
    question: 'Öğrenciler ne için kampanya açıyor?',
    answer: 'Öğrenciler çeşitli eğitim ihtiyaçları için kampanya oluşturabilir:\n\n📚 Okul Harçları & Kayıt Ücretleri\n📖 Ders Kitapları & Malzemeler\n🏠 Barınma & Yurt Ücretleri\n🚌 Ulaşım Masrafları\n💻 Bilgisayar & Teknoloji İhtiyaçları\n🍽️ Beslenme Giderleri\n🎓 Sertifika & Kurs Ücretleri\n\nHer kampanyada öğrenci ihtiyacını detaylıca açıklar.',
    priority: 8,
  },
  {
    id: 'student-4',
    category: 'student',
    keywords: ['bölüm', 'üniversite', 'alan', 'mühendislik', 'tıp', 'hukuk', 'filtre', 'kategori', 'ara'],
    question: 'Belirli bir bölümdeki öğrencileri bulabilir miyim?',
    answer: 'Evet! Kampanyalar sayfasında filtreleme yapabilirsiniz:\n\n🔍 Bölüme göre: Mühendislik, Tıp, Hukuk, İşletme, Sanat vb.\n🏫 Üniversiteye göre: İstediğiniz üniversiteyi seçebilirsiniz.\n🌍 Ülkeye göre: Türkiye veya diğer ülkeler.\n\nYa da bana söyleyin — size tam uygun öğrenciyi eşleştirebilirim! 🤖',
    followUp: 'Hangi alanla ilgileniyorsunuz?',
    priority: 8,
  },

  // ─── BAĞIŞÇI ────────────────────────────────────────────────
  {
    id: 'donor-1',
    category: 'donor',
    keywords: ['bağışçı', 'profil', 'hesab', 'dashboard', 'panel', 'sayfam', 'bağışlarım'],
    question: 'Bağışçı panelimde neler var?',
    answer: 'Bağışçı paneliniz tam donanımlı:\n\n📊 Bağış Özeti: Toplam bağış miktarı, desteklenen öğrenci sayısı\n📅 Bağış Takvimi: Tüm bağışlarınızın takvim görünümü\n🏅 Rozetlerim: Kazandığınız rozetler ve ilerlemeniz\n🔥 Bağış Serisi: Aylık streak takibi\n🔔 Bildirimler: Kampanya güncellemeleri ve hatırlatmalar\n📈 Etki Raporu: Bağışlarınızın yarattığı fark',
    priority: 8,
  },
  {
    id: 'donor-2',
    category: 'donor',
    keywords: ['birden fazla', 'çoklu', 'birkaç', 'farklı öğrenci', 'birden çok', 'çok kişi'],
    question: 'Birden fazla öğrenciye bağış yapabilir miyim?',
    answer: 'Elbette! Dilediğiniz kadar öğrenciye bağış yapabilirsiniz. 🌟\n\nAslında birden fazla öğrenciye bağış yapmak rozet kazanmanın en hızlı yollarından biri!\n\n🏅 3 farklı öğrenciye bağış → Özel rozet\n🏅 5 farklı bölümdeki öğrencilere bağış → Çeşitlilik rozeti\n\nHer bağış, başka bir hayata dokunmak demektir. 💙',
    priority: 7,
  },

  // ─── ROZETLER & GAMİFİCATION ───────────────────────────────
  {
    id: 'badges-1',
    category: 'badges',
    keywords: ['rozet', 'badge', 'madalya', 'başarı', 'ödül', 'seviye', 'level', 'gamification'],
    question: 'Rozet sistemi nasıl çalışır?',
    answer: 'FundEd\'de bağışlarınızla rozetler kazanırsınız! 🏅\n\nRozet Türleri:\n🌱 İlk Adım: İlk bağışınızı yaptığınızda\n💎 Cömert Kalp: Belirli bir toplam bağış miktarına ulaştığınızda\n🔥 Sadık Destekçi: Art arda aylık bağış streak\'i\n🌍 Çeşitlilik Şampiyonu: Farklı bölümlerdeki öğrencilere bağış\n⭐ Mega Bağışçı: Yüksek miktarda toplam bağış\n🎓 Hayat Değiştiren: Bir kampanyayı tamamlatan son bağış\n\nRozetlerinizi profilinizde sergileyebilirsiniz!',
    priority: 7,
  },
  {
    id: 'badges-2',
    category: 'badges',
    keywords: ['streak', 'seri', 'ardışık', 'her ay', 'arka arkaya', 'kaçırmak'],
    question: 'Bağış serisi (streak) nedir?',
    answer: 'Bağış serisi, art arda her ay bağış yapma sürenizi takip eder! 🔥\n\n📅 Her ay en az 1 bağış yaparsanız streak\'iniz devam eder.\n❌ Bir ay bağış yapmazsanız streak sıfırlanır.\n🏆 En uzun streak\'iniz de kayıt altına alınır.\n\nStreak Ödülleri:\n- 3 ay → 🔥 Bronz Streak rozeti\n- 6 ay → 🔥🔥 Gümüş Streak rozeti\n- 12 ay → 🔥🔥🔥 Altın Streak rozeti\n\nBildirim tercihlerinizden aylık hatırlatma alabilirsiniz!',
    priority: 6,
  },

  // ─── TAKVİM & ÖZEL GÜNLER ──────────────────────────────────
  {
    id: 'calendar-1',
    category: 'calendar',
    keywords: ['takvim', 'özel gün', 'etkinlik', 'tarih', 'dünya günü', 'calendar'],
    question: 'Bağış takvimi nedir?',
    answer: 'Bağış takvimi, FundEd\'e özel bir özelliktir! 📅\n\nTakviminizde şunları görebilirsiniz:\n\n💝 Geçmiş Bağışlarınız: Hangi gün, kime, ne kadar bağış yaptığınız\n🎈 Özel Günler: 23 Nisan, Öğretmenler Günü gibi eğitimle ilgili 50+ özel gün\n🌍 Dünya Günleri: Eğitim Günü, Çocuk Hakları Günü, Engelliler Günü vb.\n📝 Hatırlatmalar: Kendi belirlediğiniz bağış hatırlatmaları\n🎓 Kampanya Bitiş Tarihleri: Desteklediğiniz kampanyaların bitiş tarihleri\n\nÖzel günlerde bağış yapmak ekstra anlamlı oluyor!',
    priority: 7,
  },
  {
    id: 'calendar-2',
    category: 'calendar',
    keywords: ['24 ocak', 'eğitim günü', 'uluslararası eğitim'],
    question: 'Uluslararası Eğitim Günü ne zaman?',
    answer: '📖 Uluslararası Eğitim Günü 24 Ocak\'tır!\n\nBu gün UNESCO tarafından eğitimin barış ve kalkınmadaki rolünü vurgulamak için ilan edilmiştir. FundEd olarak bu günde özel kampanyalar düzenliyoruz.\n\nBu özel günde bir öğrenciye bağış yapmak ister misiniz?',
    priority: 5,
  },
  {
    id: 'calendar-3',
    category: 'calendar',
    keywords: ['3 aralık', 'engelliler', 'engelli', 'engelliler günü'],
    question: 'Dünya Engelliler Günü ne zaman?',
    answer: '♿ Dünya Engelliler Günü 3 Aralık\'tır!\n\nEngelli öğrencilerin eğitime erişimi herkesin hakkıdır. Bu özel günde engelli öğrencilerin kampanyalarına destek olabilirsiniz.',
    priority: 5,
  },
  {
    id: 'calendar-4',
    category: 'calendar',
    keywords: ['11 ekim', 'kız çocuk', 'kız çocukları günü'],
    question: 'Uluslararası Kız Çocukları Günü ne zaman?',
    answer: '👧 Uluslararası Kız Çocukları Günü 11 Ekim\'dir!\n\nKız çocuklarının eğitimi toplumun geleceğidir. STEM alanında, tıpta, hukukta — her alanda kız öğrencilere destek olabilirsiniz.',
    priority: 5,
  },

  // ─── ETKİ & ŞEFFAFLIK ──────────────────────────────────────
  {
    id: 'impact-1',
    category: 'impact',
    keywords: ['etki', 'fark', 'değiştir', 'sonuç', 'ne oldu', 'rapor', 'impact'],
    question: 'Bağışım ne gibi bir etki yaratıyor?',
    answer: 'Bağışınız gerçek hayatları değiştiriyor! 🌟\n\nProfil sayfanızda toplam etkinizi görebilirsiniz:\n- Kaç öğrenciye destek oldunuz\n- Toplam bağış miktarınız\n- Tamamlanan kampanya sayınız\n\nGerçek Etki Örnekleri:\n- ₺100 → Bir öğrencinin bir haftalık ulaşım masrafı\n- ₺500 → Bir dönemlik ders kitapları\n- ₺2,000 → Bir dönemlik yurt ücreti\n- ₺5,000+ → Bir yıllık burs desteği\n\nHer kuruş önemli. ❤️',
    priority: 9,
  },
  {
    id: 'impact-2',
    category: 'impact',
    keywords: ['şeffaf', 'şeffaflık', 'nereye harcandı', 'denetim', 'takip', 'izle', 'transparency'],
    question: 'Bağışlarım şeffaf mı takip ediliyor?',
    answer: 'Evet! Şeffaflık bizim temel değerimiz:\n\n📊 Kampanya İlerleme Çubuğu: Her kampanyada ne kadar toplandığını görebilirsiniz\n👥 Bağışçı Sayısı: Kaç kişinin destek olduğu gösterilir\n📅 Bağış Geçmişi: Tüm bağışlarınız takvimde kayıtlı\n🔔 Gerçek Zamanlı Bildirimler: Kampanya güncellemelerini anında alın\n✅ Kampanya Durumu: Aktif, tamamlanmış veya süresi dolmuş',
    priority: 8,
  },

  // ─── HESAP İŞLEMLERİ ───────────────────────────────────────
  {
    id: 'account-1',
    category: 'account',
    keywords: ['şifre', 'parola', 'unuttum', 'değiştir', 'şifre sıfırla', 'password'],
    question: 'Şifremi unuttum, ne yapmalıyım?',
    answer: 'Şifrenizi sıfırlamak çok kolay:\n\n1. Giriş sayfasında "Şifremi Unuttum" linkine tıklayın.\n2. Kayıtlı e-posta adresinizi girin.\n3. Size bir şifre sıfırlama maili gönderilecek.\n4. Maildeki linke tıklayıp yeni şifrenizi belirleyin.\n\n📧 Mail gelmezse spam/junk klasörünü kontrol edin.',
    priority: 7,
  },
  {
    id: 'account-2',
    category: 'account',
    keywords: ['bildirim', 'notification', 'ayar', 'tercih', 'mail', 'e-posta', 'hatırlatma'],
    question: 'Bildirim tercihlerimi nasıl ayarlarım?',
    answer: 'Bildirim tercihlerinizi profil sayfanızdan ayarlayabilirsiniz:\n\n⚙️ Profil → Bildirim Tercihleri\n\nAyarlayabileceğiniz seçenekler:\n📧 E-posta bildirimleri (açık/kapalı)\n🔔 Push bildirimleri\n💝 Bağış hatırlatıcıları\n📊 Kampanya güncellemeleri\n🏅 Milestone uyarıları\n📈 Etki raporları\n📅 Takvim hatırlatmaları\n📌 Aylık hatırlatma günü (1-28 arası)',
    priority: 6,
  },

  // ─── YASAL ──────────────────────────────────────────────────
  {
    id: 'legal-1',
    category: 'legal',
    keywords: ['kvkk', 'gizlilik', 'kişisel veri', 'veri', 'privacy', 'bilgi güvenliği'],
    question: 'Kişisel verilerim korunuyor mu?',
    answer: 'Evet! KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında tüm verileriniz güvendedir:\n\n🔒 Kişisel bilgileriniz şifreli olarak saklanır\n🔒 Üçüncü taraflarla paylaşılmaz\n🔒 İstediğiniz zaman verilerinizin silinmesini talep edebilirsiniz\n🔒 Ödeme bilgileri sunucularımızda saklanmaz\n\nGizlilik politikamız hakkında detaylı bilgi footer\'daki "Gizlilik Politikası" linkinden ulaşılabilir.',
    priority: 7,
  },

  // ─── DUYGUSAL / MOTİVASYON ─────────────────────────────────
  {
    id: 'emotional-1',
    category: 'emotional',
    keywords: ['neden bağış', 'neden yapayım', 'ne anlamı var', 'işe yarıyor mu', 'fayda'],
    question: 'Bağış yapmanın gerçekten bir anlamı var mı?',
    answer: 'Kesinlikle! Bağışınız bir hayatı değiştirmekle kalmaz, bir geleceği şekillendirir. 🌟\n\n💭 Şöyle düşünün:\n- Bugün ₺50 bağışladığınız öğrenci, yarın bir doktor olabilir.\n- Desteklediğiniz mühendislik öğrencisi, gelecekte köprüler, binalar inşa edebilir.\n- Yardım ettiğiniz öğretmen adayı, yüzlerce çocuğu eğitebilir.\n\n🦋 Kelebek etkisi: Bir bağış → bir mezuniyet → bir kariyer → yüzlerce hayata dokunuş.\n\nSiz sadece para bağışlamıyorsunuz, umut bağışlıyorsunuz. ❤️',
    followUp: 'Hayatını değiştirebileceğiniz bir öğrenci göstereyim mi?',
    priority: 10,
  },
  {
    id: 'emotional-2',
    category: 'emotional',
    keywords: ['az', 'yetmez', 'küçük', 'benim param', 'yetmiyor', 'yetersiz', 'az para'],
    question: 'Benim bağışım çok az, bir işe yarar mı?',
    answer: 'Lütfen böyle düşünmeyin! 💙 Her kuruş değerlidir.\n\n🧮 Matematik yapalım:\n- Siz ₺10 bağışlarsınız\n- Sizin gibi 100 kişi ₺10 bağışlarsa → ₺1,000\n- Bu, bir öğrencinin bir aylık yurt parasıdır!\n\n🌊 Damla damla göl olur. Büyük değişimler küçük adımlarla başlar.\n\nÜstelik bağışınız öğrenciye sadece maddi değil, manevi destek de verir. Birinin ona inandığını bilmek, dünyaları değiştirir. ✨',
    followUp: 'Küçük bağışlarla bile büyük fark yaratabileceğiniz bir kampanya göstereyim mi?',
    priority: 10,
  },
  {
    id: 'emotional-3',
    category: 'emotional',
    keywords: ['teşekkür', 'sağol', 'sağ ol', 'harika', 'süper', 'güzel', 'iyi', 'mutlu', 'bravo'],
    question: 'Teşekkürler / güzel platform',
    answer: 'Çok teşekkür ederiz! 🥰 Sizin gibi duyarlı insanlar sayesinde öğrencilerimizin hayatları değişiyor.\n\n💙 FundEd ailesine hoş geldiniz! Herhangi bir sorunuz olursa her zaman buradayım.\n\nBirlikte eğitimde fırsat eşitliği sağlayabiliriz! 🎓✨',
    priority: 5,
  },
  {
    id: 'emotional-4',
    category: 'emotional',
    keywords: ['hikaye', 'başarı', 'mezun', 'tamamlanan', 'sonuç', 'örnek'],
    question: 'Başarı hikayeleri var mı?',
    answer: 'Evet! FundEd\'de birçok başarı hikayesi var: 🌟\n\n📚 Kampanyalar sayfasında "Tamamlanmış" filtresini seçerek hedefe ulaşmış kampanyaları görebilirsiniz.\n\nHer tamamlanan kampanya, bir öğrencinin eğitim hayalinin gerçekleşmesi demektir!\n\n🎓 Bağışçılarımız sayesinde birçok öğrenci eğitimine devam edebilmiştir. Siz de bu hikayenin bir parçası olmak ister misiniz?',
    followUp: 'Size hedefe en yakın bir kampanya göstereyim — son dokunuş sizin olsun! 🎯',
    priority: 8,
  },
  {
    id: 'emotional-5',
    category: 'emotional',
    keywords: ['ilham', 'motive', 'motivasyon', 'söz', 'quote', 'alıntı'],
    question: 'İlham verici bir şey söyle',
    answer: '✨ İşte size birkaç ilham verici söz:\n\n📖 "Eğitim, dünyayı değiştirebileceğiniz en güçlü silahtır."\n— Nelson Mandela\n\n📖 "Hayatta en hakiki mürşit ilimdir."\n— Mustafa Kemal Atatürk\n\n📖 "Bir çocuğa balık verirseniz bir gün doyurursunuz. Eğitirseniz bir ömür boyu doyar."\n— Çin Atasözü\n\n📖 "Eğitim pahalıdır diyorsanız, bir de cehaletin maliyetine bakın."\n— Derek Bok\n\n💙 Bir bağışla bu sözleri gerçeğe dönüştürebilirsiniz!',
    priority: 5,
  },

  // ─── TEKNİK ─────────────────────────────────────────────────
  {
    id: 'technical-1',
    category: 'technical',
    keywords: ['mobil', 'telefon', 'uygulama', 'app', 'android', 'ios'],
    question: 'Mobil uygulama var mı?',
    answer: 'FundEd şu an bir web uygulamasıdır ve mobil tarayıcınızdan sorunsuz kullanabilirsiniz! 📱\n\nSitemiz tamamen responsive (mobil uyumlu) tasarlanmıştır. Chrome, Safari veya herhangi bir tarayıcıdan erişebilirsiniz.\n\n💡 İpucu: Tarayıcınızda "Ana ekrana ekle" seçeneğiyle FundEd\'i uygulama gibi kullanabilirsiniz!',
    priority: 6,
  },
  {
    id: 'technical-2',
    category: 'technical',
    keywords: ['hata', 'sorun', 'çalışmıyor', 'bug', 'problem', 'yardım', 'destek ekibi'],
    question: 'Bir sorun yaşıyorum, nasıl destek alabilirim?',
    answer: 'Size yardımcı olmak istiyoruz! 🛠️\n\n📧 E-posta: info@funded.com\n🤖 AI Asistan: Bana sorabilirsiniz!\n\nSık yaşanan sorunlar:\n- Sayfa yüklenmiyorsa → Tarayıcı önbelleğini temizleyin\n- Ödeme hatası → Kart bilgilerinizi kontrol edin\n- Giriş sorunu → Şifre sıfırlama yapın\n\nSorunuzu detaylıca anlatırsanız yardımcı olmaya çalışırım!',
    priority: 8,
  },
  {
    id: 'technical-3',
    category: 'technical',
    keywords: ['dil', 'ingilizce', 'türkçe', 'language', 'çeviri', 'almanca', 'fransızca', 'arapça', 'çince', 'rusça', 'ispanyolca'],
    question: 'Site hangi dillerde kullanılabilir?',
    answer: 'FundEd 8 dilde hizmet vermektedir! 🌍\n\n🇹🇷 Türkçe\n🇬🇧 English (İngilizce)\n🇩🇪 Deutsch (Almanca)\n🇫🇷 Français (Fransızca)\n🇪🇸 Español (İspanyolca)\n🇨🇳 中文 (Çince)\n🇷🇺 Русский (Rusça)\n🇸🇦 العربية (Arapça)\n\nDil değiştirmek için sağ üst köşedeki dil seçicisini (🌐) kullanabilirsiniz.',
    priority: 6,
  },

  // ─── GENEL SOHBET ───────────────────────────────────────────
  {
    id: 'general-1',
    category: 'about',
    keywords: ['merhaba', 'selam', 'hey', 'hi', 'hello', 'naber', 'iyi günler', 'günaydın'],
    question: 'Merhaba',
    answer: 'Merhaba! 👋 Ben FundEd AI Asistanı. Size nasıl yardımcı olabilirim?\n\n🎯 Öğrenci önerisi isteyebilirsiniz\n❓ Platform hakkında soru sorabilirsiniz\n💝 Bağış süreci hakkında bilgi alabilirsiniz\n\nNe yapmak istersiniz?',
    priority: 10,
  },
  {
    id: 'general-2',
    category: 'about',
    keywords: ['sen kimsin', 'ne yapabilirsin', 'help', 'ne biliyorsun', 'asistan', 'bot', 'yapay zeka'],
    question: 'Sen kimsin? Ne yapabilirsin?',
    answer: 'Ben FundEd AI Asistanıyım! 🤖 İşte yapabileceklerim:\n\n🎯 Öğrenci Eşleştirme: Birkaç soru sorarak size en uygun öğrenciyi bulabilirim.\n❓ Sorularınızı Yanıtlama: Platform, bağış süreci, güvenlik vb. hakkında her sorunuza cevap verebilirim.\n📅 Özel Günler: Eğitimle ilgili özel günleri hatırlatırım.\n💡 Motivasyon: Bağışın etkisi hakkında bilgi veririm.\n\nBana istediğinizi sorabilirsiniz! 😊',
    priority: 10,
  },
  {
    id: 'general-3',
    category: 'about',
    keywords: ['görüşürüz', 'bye', 'hoşçakal', 'hoşça kal', 'güle güle', 'bb'],
    question: 'Görüşürüz',
    answer: 'Görüşmek üzere! 👋 FundEd\'i tercih ettiğiniz için teşekkürler.\n\n💙 Unutmayın: Bir bağış, bir hayatı değiştirebilir.\n\nHerhangi bir sorunuz olursa her zaman buradayım! 🤖✨',
    priority: 5,
  },

  // ═══════════════════════════════════════════════════════════
  // GENİŞLETİLMİŞ BİLGİ TABANI — Sitedeki gerçek verilerden
  // ═══════════════════════════════════════════════════════════

  // ─── MİSYON, VİZYON & DEĞERLER ─────────────────────────────
  {
    id: 'about-4',
    category: 'about',
    keywords: ['misyon', 'görev', 'amaç', 'mission'],
    question: 'FundEd\'in misyonu nedir?',
    answer: 'FundEd\'in misyonu: "Eğitime erişimde yaşanan eşitsizliği ortadan kaldırmak için, doğrulanmış öğrencileri güvenilir bağışçılarla buluşturan şeffaf bir platform oluşturmak." 🎯\n\nDünya genelinde 244 milyon+ çocuk okula gidemiyor. Biz bu sayıyı azaltmak için çalışıyoruz.',
    priority: 9,
  },
  {
    id: 'about-5',
    category: 'about',
    keywords: ['vizyon', 'gelecek', 'hayal', 'vision', 'hedef'],
    question: 'FundEd\'in vizyonu nedir?',
    answer: 'FundEd\'in vizyonu: "Dünyada hiçbir öğrencinin maddi imkânsızlık nedeniyle eğitimden mahrum kalmadığı, eğitimin evrensel bir hak olarak yaşandığı bir gelecek." 🌍✨\n\n📖 "Bir çocuğa eğitim vermek, bir yaşamı değiştirmek değildir. Bir nesli dönüştürmektir."',
    priority: 9,
  },
  {
    id: 'about-6',
    category: 'about',
    keywords: ['değer', 'ilke', 'prensip', 'temel', 'values', 'principles'],
    question: 'FundEd\'in temel değerleri nelerdir?',
    answer: 'FundEd 6 temel değer üzerine kurulmuştur:\n\n🔍 Şeffaflık — Her işlem ve bağış açıkça gösterilir\n💜 Empati — Her öğrencinin hikayesine saygı\n⚖️ Eşitlik — Eğitime erişimde fırsat eşitliği\n💡 İnovasyon — Teknoloji ile sosyal etki\n🤝 Topluluk — Bağışçılar, öğrenciler ve kurumlar birlikte\n🎯 Etki Odaklılık — Ölçülebilir sonuçlar, gerçek değişim',
    priority: 8,
  },
  {
    id: 'about-7',
    category: 'about',
    keywords: ['yol haritası', 'roadmap', 'plan', 'hedef', '2026', '2027', '2028', '2030', 'gelecek'],
    question: 'FundEd\'in yol haritası nedir?',
    answer: 'FundEd Yol Haritası:\n\n📌 2025 Q4 — Konsept geliştirme & planlama\n🚀 2026 Q1 — Prototip & lansman\n🎯 2026 — 10.000 öğrenciye ulaşma\n🌍 2027 — 25+ ülkede faaliyet, küresel erişim\n🏢 2028 — 500+ kurumsal partner\n⭐ 2030 — Eğitimde ölçülebilir eşitlik sağlama\n\nBirlikte daha büyük hedeflere ulaşıyoruz!',
    priority: 7,
  },
  {
    id: 'about-8',
    category: 'about',
    keywords: ['yaklaşım', 'istatistik', 'güven skoru', 'doğrulama oranı', 'inceleme', 'gizli maliyet'],
    question: 'FundEd\'in yaklaşımı nasıl?',
    answer: 'FundEd\'in yaklaşım istatistikleri:\n\n✅ %100 Doğrulama — Her öğrenci doğrulanır\n✅ %100 İzlenebilirlik — Her bağışın akıbeti takip edilir\n✅ 0 Gizli Maliyet — Sürpriz kesinti yok\n⏱️ 48 Saat İnceleme Süresi — Başvurular hızla değerlendirilir\n⭐ 4.9/5.0 Güven Skoru — Kullanıcı memnuniyeti\n\nŞeffaflık bizim temel değerimizdir!',
    priority: 8,
  },
  {
    id: 'about-9',
    category: 'about',
    keywords: ['ekip', 'kurucu', 'ceo', 'coo', 'kim', 'yönetim', 'founder', 'team'],
    question: 'FundEd\'in ekibi kimdir?',
    answer: 'FundEd Liderlik Ekibi:\n\n👤 Baran Deniz — CEO & Kurucu\n👤 Özge Karabaş — COO\n\nEkibimiz eğitimde eşitlik tutkusuyla çalışan, teknoloji ve sosyal etki alanında deneyimli bir ekiptir.',
    priority: 7,
  },

  // ─── BAĞIŞ GÜVENCESİ & İADE ────────────────────────────────
  {
    id: 'guarantee-1',
    category: 'security',
    keywords: ['güvence', 'garanti', 'bağış güvencesi', '%100', 'korunma', 'charity guarantee'],
    question: 'Bağış güvencesi nedir?',
    answer: 'FundEd %100 Bağış Güvencesi sunar! 🛡️\n\n✅ Bağışınız %100 doğrudan seçtiğiniz öğrenciye ulaşır.\n✅ Platform işletme giderleri bağışlarınızdan kesilmez — ayrı kurumsal sponsorluklarla karşılanır.\n✅ Öğrenci doğrulanamazsa veya kampanya iptal edilirse, bağışınızın %100\'ü 5-7 iş günü içinde iade edilir.\n\nGüvence Süreci:\n1️⃣ Bağış Yap → 2️⃣ Doğrulama → 3️⃣ Öğrenciye Ulaşım → 4️⃣ Rapor Al',
    followUp: 'Güvenle bağış yapmak ister misiniz?',
    priority: 10,
  },
  {
    id: 'guarantee-2',
    category: 'security',
    keywords: ['iade süresi', 'geri ödeme', 'kaç gün', '5 gün', '7 gün', 'iade politikası'],
    question: 'İade süresi ne kadar?',
    answer: 'FundEd iade politikası:\n\n⏱️ İade Süresi: 5-7 iş günü\n\nİade durumları:\n- Bağış yaptığınız öğrenci doğrulanamazsa\n- Kampanya iptal edilirse\n- Yanlışlıkla yapılan bağışlar (info@funded.com\'a yazın)\n\n💡 Normal şartlarda bağışlar geri alınamaz çünkü doğrudan öğrenciye aktarılır.',
    priority: 7,
  },
  {
    id: 'guarantee-3',
    category: 'security',
    keywords: ['şeffaf raporlama', 'rapor', 'harcama', 'nereye harcandı', 'raporlama'],
    question: 'Bağışımın nasıl kullanıldığını görebilir miyim?',
    answer: 'Evet! FundEd şeffaf raporlama sunar:\n\n📊 Kampanya İlerleme Çubuğu — Gerçek zamanlı toplanan miktar\n📸 Fotoğraflı Raporlar — Öğrencilerden görsel güncellemeler\n📈 Etki Metrikleri — Bağışınızın yarattığı fark\n📋 Kişisel Dashboard — Tüm bağışlarınızın özeti\n📥 CSV/Excel/PDF — Bağış raporlarınızı indirin\n\nŞeffaflık sayfamızda doğrulama oranları ve toplam etki istatistiklerini görebilirsiniz.',
    priority: 8,
  },

  // ─── DOĞRULAMA SİSTEMİ DETAYLARI ──────────────────────────
  {
    id: 'verification-1',
    category: 'verification',
    keywords: ['doğrulama seviye', 'tier', 'seviye', 'kademe', 'doğrulama türü', 'tip'],
    question: 'Doğrulama seviyeleri nelerdir?',
    answer: 'FundEd 4 kademeli doğrulama sistemi uygular:\n\n📧 Seviye 0 — Okul E-postası ile Doğrulama\n→ Okul e-postanıza bir doğrulama bağlantısı gönderilir.\n\n📋 Seviye 1 — Belge ile Doğrulama\n→ Öğrenci belgesi veya kayıt belgesi yüklenir. Rozet: "Doğrulanmış Öğrenci"\n\n🏆 Seviye 2 — Yüksek Güven\n→ Belge + okul portalı ekran görüntüsü (veya QR/barkod kanıtı). Rozet: "Yüksek Güven"\n\n🤝 Seviye 3 — Partner Doğrulandı\n→ Resmi üniversite onayı ile doğrulanmıştır. Rozet: "Partner Doğrulandı"\n\nDaha yüksek seviye = daha yüksek güven! 🔒',
    priority: 9,
  },
  {
    id: 'verification-2',
    category: 'verification',
    keywords: ['belge', 'döküman', 'gerekli belge', 'hangi belge', 'doğrulama belgesi', 'yükle', 'upload'],
    question: 'Doğrulama için hangi belgeler gerekli?',
    answer: 'Doğrulama için kabul edilen belgeler:\n\n📄 Öğrenci Kimliği\n📄 Öğrenci Belgesi / Kayıt Belgesi\n📄 Transkript\n📄 Devlet Kimliği\n📄 Kimlikle Selfie\n📄 Adres Kanıtı\n📄 Okul Portalı Ekran Görüntüsü\n\n📌 Dosya formatları: PDF, JPG, PNG (max 10MB)\n📌 Belgeler okunaklı, tam kadraj ve güncel olmalı.\n💡 TC kimlik no, adres gibi gerekli olmayan hassas bilgileri kapatabilirsiniz.',
    priority: 8,
  },
  {
    id: 'verification-3',
    category: 'verification',
    keywords: ['doğrulama süreci', 'onay süresi', 'ne kadar sürer', 'inceleme', 'başvuru süresi', 'kaç gün'],
    question: 'Doğrulama süreci ne kadar sürer?',
    answer: 'Doğrulama süreci:\n\n1️⃣ Kişisel Bilgiler — Ad, soyad, doğum tarihi, telefon\n2️⃣ Eğitim Bilgileri — Kurum, bölüm, kayıt yılı, tahmini mezuniyet\n3️⃣ Belge Yükleme — Öğrenci belgesi, transkript vb.\n4️⃣ İncele ve Gönder\n\n⏱️ İnceleme Süresi: 1-3 iş günü\n\nDoğrulama Durumları:\n- ⏳ İnceleme Bekliyor\n- ✅ Onaylandı\n- ❌ Reddedildi\n- ℹ️ Ek Bilgi Gerekli\n- 🔍 İnceleme Altında',
    priority: 8,
  },
  {
    id: 'verification-4',
    category: 'verification',
    keywords: ['kurum türü', 'üniversite', 'lise', 'yüksekokul', 'meslek', 'okul türü'],
    question: 'Hangi kurum türleri destekleniyor?',
    answer: 'FundEd şu kurum türlerini destekler:\n\n🏫 Üniversite\n🎓 Yüksekokul\n🔧 Meslek Yüksekokulu\n📚 Lise\n\nDerece Seviyeleri:\n- Ön Lisans\n- Lisans\n- Yüksek Lisans\n- Doktora\n- Sertifika Programları\n\nSınıf seçenekleri: Hazırlık, 1-6. sınıf, Yüksek Lisans, Doktora',
    priority: 6,
  },
  {
    id: 'verification-5',
    category: 'verification',
    keywords: ['doğrulama kontrol', 'kimlik doğrulama', 'e-devlet', 'üniversite onay', 'sahte belge'],
    question: 'Doğrulama nasıl yapılır?',
    answer: 'FundEd doğrulama kontrolleri:\n\n🔍 Kimlik Doğrulaması — Devlet kimliği ve kimlikle selfie karşılaştırılır\n📧 Okul E-postası — Kurumsal e-posta üzerinden doğrulama bağlantısı\n📋 Kayıt Belgesi — Öğrenci belgesi/transkript incelenmesi\n🖥️ Okul Portalı — Portal ekran görüntüsü doğrulaması\n🤝 Üniversite Onayı — Resmi kurum doğrulaması (Tier 3)\n\n⚠️ Sahte veya yanıltıcı bilgi tespit edilirse hesap askıya alınır veya yasaklanır.',
    priority: 8,
  },

  // ─── ROZET SİSTEMİ DETAYLARI ──────────────────────────────
  {
    id: 'badges-3',
    category: 'badges',
    keywords: ['rozet listesi', 'tüm rozetler', 'hangi rozet', 'rozet çeşit', 'rozet tür', 'kaç rozet'],
    question: 'Tüm rozetler ve gereksinimleri nelerdir?',
    answer: 'FundEd\'de 12 rozet bulunur! 🏅\n\n📊 Bağış Sayısına Göre:\n🌱 İlk Adım — 1 bağış\n💪 Sürekli Destekçi — 5 bağış\n🏆 Şampiyon — 25 bağış\n👑 Efsane — 100 bağış\n\n💰 Toplam Tutara Göre:\n🥉 Cömert Kalp — $1.000 toplam\n🥈 Hayırsever — $10.000 toplam\n🥇 Patron — $50.000 toplam\n\n🎓 Öğrenci Bazlı:\n⭐ Öğrenci Şampiyonu — 10 farklı öğrenci\n\n🔥 Streak:\n🔥 Streak Master — 12 ay art arda bağış\n\n🌟 Özel Rozetler:\n🏅 Early Bird — Platform lansman üyesi\n🤝 Matching Hero — Eşleşen bağış katılımı\n🧑‍🏫 Mentor — Bir öğrenciye mentorluk',
    priority: 8,
  },
  {
    id: 'badges-4',
    category: 'badges',
    keywords: ['seviye', 'level', 'puan', 'point', 'xp', 'deneyim', 'puan sistemi', 'nasıl puan'],
    question: 'Seviye ve puan sistemi nasıl çalışır?',
    answer: 'FundEd Seviye Sistemi (6 seviye):\n\n🌱 Yeni Başlayan — 0 puan\n💙 Destekçi — 500 puan\n💜 Kahraman — 2.000 puan\n🏆 Şampiyon — 5.000 puan\n👑 Efsane — 10.000 puan\n💎 Patron — 25.000 puan\n\nPuan Kazanma:\n💰 Her $10 bağış → 1 puan\n🎁 Her bağış işlemi → 10 puan\n🎓 Her farklı öğrenci → 50 puan\n🔥 Her streak ayı → 100 puan\n\nSeviyenizi yükselttikçe liderlik tablosunda daha üst sıralara çıkarsınız!',
    priority: 8,
  },
  {
    id: 'badges-5',
    category: 'badges',
    keywords: ['liderlik', 'sıralama', 'leaderboard', 'tablosu', 'en iyi', 'birinci'],
    question: 'Liderlik tablosu nasıl çalışır?',
    answer: 'FundEd Liderlik Tablosu:\n\n📊 Filtreler:\n- Tüm zamanlar / Bu ay\n- Bireysel / Kurumsal\n\n🏆 Sıralama toplam puana göre yapılır.\n\n📈 Aktivite Akışı: Son bağışlar, kazanılan rozetler ve milestone\'lar gerçek zamanlı gösterilir.\n\nHerkes liderlik tablosunda yer alabilir — ilk bağışınızla başlayın! 🚀',
    priority: 6,
  },

  // ─── KAMPANYA DETAYLARI ─────────────────────────────────────
  {
    id: 'campaign-1',
    category: 'campaign',
    keywords: ['kampanya', 'detay', 'sayfa', 'kampanya sayfası', 'ne var', 'bilgi'],
    question: 'Kampanya sayfasında neler var?',
    answer: 'Her kampanya sayfasında şunları bulursunuz:\n\n📊 İlerleme Çubuğu — Toplanan miktar ve hedef\n👤 Öğrenci Profili — Üniversite, bölüm, hikaye\n✅ Doğrulama Rozeti — Öğrenci doğrulama seviyesi\n💝 Bağış Butonu — Güvenli bağış yapma\n📢 Paylaş — Sosyal medyada kampanyayı paylaşma\n📋 Güncellemeler — Öğrenciden ilerleme haberleri\n🎥 Videolar — Öğrenci video hikayeleri\n👥 Bağışçılar — Bağış yapanların listesi\n🏆 En Çok Bağışlayanlar\n\n💬 "Her bağış bir umut yeşertir — birlikte değişimi yaratıyoruz."',
    priority: 8,
  },
  {
    id: 'campaign-2',
    category: 'campaign',
    keywords: ['kampanya durum', 'aktif', 'tamamlanmış', 'kampanya durumu', 'bitti mi'],
    question: 'Kampanya durumları nelerdir?',
    answer: 'Kampanya Durumları:\n\n🟢 Aktif — Bağış kabul ediyor\n✅ Tamamlanmış — Hedefe ulaştı veya süre doldu\n⏸️ Duraklatıldı — Geçici olarak durduruldu\n\nBaşvuru Durumları:\n- 📩 Alındı\n- 🔍 İnceleniyor\n- ✅ Onaylandı\n- ❌ Reddedildi\n\n📌 Tüm kampanyalar admin ekibi tarafından incelenir ve onaylanır.',
    priority: 7,
  },
  {
    id: 'campaign-3',
    category: 'campaign',
    keywords: ['paylaş', 'sosyal medya', 'share', 'link', 'bağlantı', 'twitter', 'facebook', 'instagram'],
    question: 'Kampanyayı nasıl paylaşabilirim?',
    answer: 'Kampanyaları kolayca paylaşabilirsiniz:\n\n🔗 Bağlantıyı Kopyala — Tek tıkla kampanya linkini kopyalayın\n🐦 Twitter — Doğrudan tweet paylaşın\n📘 Facebook — Facebook\'ta paylaşın\n📸 Instagram — Hikayenizde paylaşın\n\n📢 Paylaşmak bağış yapmak kadar değerli! Bir paylaşımınız yüzlerce kişiye ulaşabilir.\n\nTüm sosyal medya hesaplarımız: Twitter, Facebook, Instagram',
    priority: 6,
  },
  {
    id: 'campaign-4',
    category: 'campaign',
    keywords: ['kampanya oluştur', 'kampanya aç', 'yeni kampanya', 'nasıl kampanya', 'öğrenci başvur'],
    question: 'Öğrenci başvuru süreci nasıl işliyor?',
    answer: 'Öğrenci Başvuru Süreci:\n\n📝 Gerekli Bilgiler:\n- Ad Soyad, E-posta, Ülke\n- Eğitim Seviyesi (Lise → Doktora)\n- Fakülte & Bölüm, Sınıf\n- Hedef Tutar (min $1 USD)\n- Kampanya Açıklaması (detaylı)\n\n📎 Opsiyonel:\n- Belgeler (öğrenci belgesi, transkript — PDF/JPG/PNG, max 10MB)\n- Fotoğraflar\n\n✅ Başvuru gönderilir → Admin inceleme → Onay → Kampanya yayında!\n\n💡 Hem öğrenci hem öğretmen başvurabilir.',
    priority: 8,
  },

  // ─── EĞİTİMDE EŞİTLİK KAMPANYASI ─────────────────────────
  {
    id: 'campaign-5',
    category: 'campaign',
    keywords: ['eşitlik kampanyası', 'eğitimde eşitlik', 'global kampanya', 'dünya kampanya', '$500.000'],
    question: 'Eğitimde Eşitlik Kampanyası nedir?',
    answer: 'FundEd\'in küresel kampanyası "Eğitimde Eşitlik":\n\n🎯 Hedef: $500.000\n\nEtki Alanları:\n📚 Okul Malzemeleri — $80.000 hedef\n⚽ Spor Ekipmanları — $70.000 hedef\n🏗️ Okul İnşaatı — $150.000 hedef\n💻 Dijital Erişim — $100.000 hedef\n🍎 Beslenme Programı\n\n🌍 Dünya genelinde eğitime erişemeyen çocuklara destek olmak için bu özel kampanyayı inceleyebilirsiniz.',
    followUp: 'Eğitimde Eşitlik Kampanyasına bağış yapmak ister misiniz?',
    priority: 7,
  },

  // ─── BAĞIŞ DETAYLARI (EK) ──────────────────────────────────
  {
    id: 'donation-7',
    category: 'donation',
    keywords: ['ödeme yöntemi', 'iyzico', 'stripe', 'nasıl ödeme', 'ödeme altyapısı', 'ödeme sistemi'],
    question: 'Ödeme altyapısı nedir?',
    answer: 'FundEd güvenli ödeme altyapısı:\n\n💳 İşlemci: iyzico (Türkiye\'nin lider ödeme altyapısı)\n🔒 256-bit SSL şifrelenmiş güvenli ödeme\n🛡️ PCI DSS uyumlu\n🔐 3D Secure doğrulama desteği\n\n📌 Kart bilgileriniz FundEd sunucularında saklanmaz.\n📌 Ödeme sorunları için iyzico veya bankanıza başvurabilirsiniz.\n\nAlternatif: Stripe desteği de mevcuttur.',
    priority: 7,
  },
  {
    id: 'donation-8',
    category: 'donation',
    keywords: ['matching', 'eşleşen bağış', 'eşleştirme', 'çarpan', 'multiplier', 'matching gift'],
    question: 'Eşleşen bağış (matching gift) nedir?',
    answer: 'Eşleşen Bağış Programı:\n\n🤝 Kurumsal partnerler bağışınızı katlayabilir!\n\n📊 Nasıl çalışır:\n- Bir kurumsal partner "matching" programı başlatır\n- Siz $100 bağış yaparsınız\n- Partner bunu 2x veya 3x katlayabilir\n- Toplam etki: $200 veya $300!\n\n🏅 Matching programına katılarak "Matching Hero" rozetini kazanabilirsiniz.\n\n💡 Bağış formunda "Eşleşen Bağış" seçeneğini görebilirsiniz.',
    priority: 7,
  },
  {
    id: 'donation-9',
    category: 'donation',
    keywords: ['bağış türü', 'bağış kategorisi', 'genel fon', 'burs', 'scholarship', 'fund'],
    question: 'Bağış kategorileri nelerdir?',
    answer: 'FundEd Bağış Kategorileri:\n\n🎓 Doğrulanmış Öğrenci Desteği — Belirli bir öğrenciye doğrudan bağış\n🌍 Genel Eğitim Fonu — En çok ihtiyaç duyan öğrencilere dağıtılır\n📅 Aylık Öğrenci Bursu — Düzenli burs desteği\n\n💡 İpucu: "Genel Eğitim Fonu" seçeneğiyle hangi öğrenciye bağış yapacağınızı bilmiyorsanız bile destek olabilirsiniz!',
    priority: 7,
  },
  {
    id: 'donation-10',
    category: 'donation',
    keywords: ['mesaj', 'not', 'destek notu', 'öğrenciye yaz', 'bağışçı mesajı'],
    question: 'Öğrenciye mesaj bırakabilir miyim?',
    answer: 'Evet! Bağış sırasında ve sonrasında öğrenciye mesaj bırakabilirsiniz:\n\n💌 Bağış Sırasında: "Mesaj Bırakın (İsteğe Bağlı)" alanına yazın\n📝 Bağış Sonrası: Bağış detay sayfasından "Öğrenciye Mesaj Gönder" butonuyla\n\n📌 Mesajlar max 1.000 karakter\n📌 Sadece desteklediğiniz öğrenciye gönderilir\n\nBir destek notu öğrenci için çok değerli! 💙',
    priority: 6,
  },
  {
    id: 'donation-11',
    category: 'donation',
    keywords: ['makbuz', 'fatura', 'receipt', 'pdf', 'belge', 'bağış belgesi', 'indir'],
    question: 'Bağış makbuzu alabilir miyim?',
    answer: 'Evet! Bağış makbuzunuzu kolayca indirebilirsiniz:\n\n📥 Bağışlarım → Bağış Detayı → "Makbuz İndir (PDF)"\n\nMakbuz İçeriği:\n📄 Makbuz No\n📄 Bağışçı bilgileri\n📄 Bağış tutarı ve tarihi\n📄 Kampanya bilgisi\n\n💡 "Bu belge FundEd platformu tarafından otomatik olarak oluşturulmuştur. Vergi indirimi için resmi makbuz olarak kullanılabilir."\n\nAyrıca CSV ve Excel formatında da indirebilirsiniz.',
    priority: 6,
  },
  {
    id: 'donation-12',
    category: 'donation',
    keywords: ['bağışlarım', 'geçmiş bağış', 'takip', 'bağış listesi', 'arama', 'filtre'],
    question: 'Geçmiş bağışlarımı nasıl takip ederim?',
    answer: 'Bağışlarım sayfasında tüm bağış geçmişinizi görebilirsiniz:\n\n📊 Özet Bilgiler:\n- Toplam Bağış miktarı\n- Bağış Sayısı\n- Desteklenen Öğrenci sayısı\n- Son Bağış tarihi\n\n🔍 Filtreleme:\n- Kampanya veya öğrenci adıyla arama\n- Tarih aralığına göre\n- Min/Max tutara göre\n\n📥 Dışa Aktarma: CSV, Excel veya PDF olarak indirin.',
    priority: 6,
  },

  // ─── ÜRÜN BAĞIŞI ────────────────────────────────────────────
  {
    id: 'product-1',
    category: 'product_donation',
    keywords: ['ürün bağış', 'ürün', 'laptop', 'tablet', 'malzeme', 'fiziksel', 'product', 'eşya'],
    question: 'Ürün bağışı yapabilir miyim?',
    answer: 'Evet! FundEd\'de para bağışının yanı sıra ürün bağışı da yapabilirsiniz! 📦\n\nİhtiyaç Duyulan Ürünler:\n💻 Laptop — $800 (15 adet gerekli)\n📱 Tablet — $300 (8 adet gerekli)\n🎧 Kulaklık — $50 (25 adet gerekli)\n📚 Ders Kitapları — $150 (40 adet gerekli)\n✏️ Kırtasiye Seti — $30 (50 adet gerekli)\n\nÜrün Kategorileri: Elektronik, Kitaplar, Kırtasiye, Diğer\nÜrün Durumu: Yeni, Az Kullanılmış, İyi Durumda',
    followUp: 'Ürün bağışı yapmak ister misiniz?',
    priority: 8,
  },
  {
    id: 'product-2',
    category: 'product_donation',
    keywords: ['ürün kategori', 'elektronik', 'kitap', 'kırtasiye', 'ne bağışlayabilirim', 'ürün listesi'],
    question: 'Hangi ürünleri bağışlayabilirim?',
    answer: 'Bağışlanabilecek ürün kategorileri:\n\n💻 Elektronik: Laptop, tablet, kulaklık, şarj cihazı\n📚 Kitaplar: Ders kitapları, referans kitaplar\n✏️ Kırtasiye: Defter, kalem, çanta, hesap makinesi\n📦 Diğer: Öğrencinin ihtiyacına özel ürünler\n\n📌 Ürünlerin durumu belirtilmelidir:\n- 🆕 Yeni\n- ✨ Az Kullanılmış\n- 👍 İyi Durumda\n\nFiziksel ürünlerle de bir öğrencinin hayatını değiştirebilirsiniz!',
    priority: 6,
  },

  // ─── MENTOR PROGRAMI ────────────────────────────────────────
  {
    id: 'mentor-1',
    category: 'mentor',
    keywords: ['mentor', 'mentörlük', 'mentorluk', 'rehberlik', 'koçluk', 'danışman'],
    question: 'Mentor programı nedir?',
    answer: 'FundEd Mentor Programı:\n\n🧑‍🏫 Deneyimli profesyoneller öğrencilere rehberlik eder.\n\nMentor Kategorileri:\n💻 Yazılım & Teknoloji\n💰 Finans & Bankacılık\n📈 Pazarlama & İletişim\n📋 Ürün Yönetimi\n🎯 Kariyer Koçluğu\n\nDeneyim Seviyeleri: 1-5 yıl | 6-10 yıl | 10+ yıl\nRating Filtresi: 4.0+ | 4.5+ | 4.8+\n\nNasıl Çalışır:\n1️⃣ Mentor Keşfet → 2️⃣ Başvurunu Yap → 3️⃣ Eşleş ve Görüş → 4️⃣ Gelişimi Takip Et',
    followUp: 'Mentor olmak veya mentor bulmak ister misiniz?',
    priority: 8,
  },
  {
    id: 'mentor-2',
    category: 'mentor',
    keywords: ['mentor ol', 'nasıl mentor', 'mentor başvuru', 'rehber ol', 'gönüllü'],
    question: 'Nasıl mentor olabilirim?',
    answer: 'Mentor olmak çok kolay! 🌟\n\n1. Mentorlar sayfasını ziyaret edin\n2. "Mentor Ol" / "Hemen Başvur" butonuna tıklayın\n3. Uzmanlık alanınızı ve deneyiminizi belirtin\n4. Müsaitlik programınızı ayarlayın\n\n📌 Mentorluk yaparak:\n- Öğrencilerin kariyerlerine yön verirsiniz\n- 🏅 "Mentor" özel rozetini kazanırsınız\n- Topluluk puanları kazanırsınız\n\n💙 "Rehberliğe ihtiyaç duyan öğrencilerle bilginizi paylaşın."',
    priority: 7,
  },
  {
    id: 'mentor-3',
    category: 'mentor',
    keywords: ['mentor başarı', 'mentorluk sonuç', 'kariyer', 'başarı hikayesi'],
    question: 'Mentorluk başarı hikayeleri var mı?',
    answer: 'Mentorluk programımızın gerçek etkileri:\n\n💼 Örnek Kariyer Geçişleri:\n- Jr. Developer → Sr. Developer @ Google\n- Stajyer → Tam Zamanlı Mühendis @ Büyük Teknoloji Şirketi\n\n📊 Mentorluk programı öğrencilerin kariyer hedeflerine ulaşmalarını hızlandırıyor.\n\n🎓 Deneyimli mentorlardan bire bir rehberlik alarak hem teknik hem kişisel gelişim sağlanıyor.',
    priority: 6,
  },

  // ─── MEZUNİYET & GERİ VER PROGRAMI ─────────────────────────
  {
    id: 'alumni-1',
    category: 'alumni',
    keywords: ['mezun', 'alumni', 'mezuniyet', 'eski öğrenci', 'geri ver', 'give back'],
    question: 'Mezun (Alumni) programı nedir?',
    answer: 'FundEd Geri Ver (Give Back) Programı:\n\n🎓 FundEd ile eğitimini tamamlayan öğrenciler, artık kendileri yeni öğrencilere destek oluyor!\n\n📊 Mezunların %27\'si aktif olarak yeni öğrencilere destek sağlıyor.\n\n🌟 Örnek Mezunlar:\n- Ayşe Yılmaz — Bilgisayar Müh. (Boğaziçi) → Google\'da Yazılımcı\n- Mehmet Kaya — Elektrik-Elektronik Müh. (ODTÜ) → Apple\'da Mühendis\n- Zeynep Demir — Mimarlık (İTÜ) → Foster+Partners\'da Mimar\n- Ali Özkan — Tıp (Hacettepe) → Hastanede Doktor\n- Elif Şahin — Uluslararası İlişkiler (Ankara Üniv.) → UNICEF\'te Uzman\n\n💙 Bağışınız bugün bir öğrenci, yarın bir profesyonel yaratıyor!',
    followUp: 'Bu başarı hikayeleri sizi inspire ediyor mu? Siz de katkıda bulunmak ister misiniz?',
    priority: 8,
  },
  {
    id: 'alumni-2',
    category: 'alumni',
    keywords: ['geri ver', 'give back', 'eski öğrenci bağış', 'mezun destek', 'alumni bağış'],
    question: 'Eski öğrenciler nasıl destek oluyor?',
    answer: 'FundEd mezunlarının destek yolları:\n\n💝 Bağış Yapma — Aktif kampanyalara maddi destek\n🧑‍🏫 Mentorluk — Yeni öğrencilere kariyer rehberliği\n📢 Hikaye Paylaşma — İlham verici başarı hikayelerini anlatma\n🤝 Topluluk Desteği — Networking ve fırsat paylaşımı\n\n📊 Geri Ver programını başlattığımızdan beri, mezunların %27\'si aktif destekçi konumunda.\n\n"Bir nesle yatırım yapmak, bir ülkeyi dönüştürmektir." — Nelson Mandela',
    priority: 7,
  },

  // ─── KURUMSAL BAĞIŞ ────────────────────────────────────────
  {
    id: 'corporate-1',
    category: 'corporate',
    keywords: ['kurumsal', 'şirket', 'corporate', 'firma', 'kurum bağış', 'şirket bağış'],
    question: 'Kurumsal bağış nasıl yapılır?',
    answer: 'FundEd Kurumsal Bağış Programı:\n\n📊 Kurumsal Dashboard İçerikleri:\n- Toplam Bağış miktarı\n- Desteklenen Öğrenci sayısı\n- Ortalama Bağış tutarı\n- Aktif Kampanyalar\n- Bağış Eğilim Grafikleri\n- Fakülte Dağılımı\n\n🏢 Kurumsal Hesap Türleri:\n- 📗 Basic — Temel özellikler\n- 📘 Pro — Gelişmiş özellikler\n- 📙 Enterprise — Tam kapsamlı\n\n👥 Roller: Görüntüleyici, Editör, Ödeme Yöneticisi',
    followUp: 'Kurumsal bağış programımız hakkında detaylı bilgi almak ister misiniz?',
    priority: 8,
  },
  {
    id: 'corporate-2',
    category: 'corporate',
    keywords: ['esg', 'sosyal sorumluluk', 'rapor', 'kurumsal rapor', 'vergi makbuzu', 'aylık rapor'],
    question: 'Kurumsal raporlama nasıl çalışır?',
    answer: 'Kurumsal Raporlama Özellikleri:\n\n📊 Dashboard\'da Anlık:\n- Bağış eğilim grafikleri (aylık)\n- Fakülte dağılımı (pasta grafik)\n- Son desteklenen öğrenciler\n\n📥 İndirilebilir Raporlar:\n- PDF (Vergi Makbuzu)\n- Excel/CSV ile filtreleme\n- Ülke, fakülte, durum bazlı filtreler\n\n🔄 Otomatik Aylık Rapor: Her ayın 1\'inde e-posta ile otomatik rapor gönderilir.\n\n📌 ESG & sosyal sorumluluk raporlarınız için hazır veri!',
    priority: 7,
  },
  {
    id: 'corporate-3',
    category: 'corporate',
    keywords: ['kurumsal neden', 'şirket avantaj', 'neden sponsor', 'kazanım', 'kurumsal avantaj'],
    question: 'Şirketler neden FundEd\'i desteklemeli?',
    answer: 'Kurumsal avantajlar:\n\n📈 Marka Değeri — Eğitim yatırımı ile toplumsal farkındalık\n📊 ESG Raporu — Sosyal sorumluluk metrikleriniz hazır\n🎯 Hedefli Destek — Belirli fakülte/bölümlere odaklanma\n👥 Çalışan Bağlılığı — Matching gift programıyla çalışan motivasyonu\n📋 Detaylı Raporlama — Vergi makbuzu ve etki analizi\n🏆 Liderlik Tablosu — Kurumsal sıralamada üst sıralar\n\n💡 500+ kurumsal partner hedefimiz var (2028 yol haritası).',
    priority: 7,
  },

  // ─── SPONSOR PROGRAMI ──────────────────────────────────────
  {
    id: 'sponsor-1',
    category: 'sponsor',
    keywords: ['sponsor', 'sponsorluk', 'sponsor ol', 'sponsor başvuru', 'destekçi'],
    question: 'Sponsor programı nedir?',
    answer: 'FundEd Sponsor Programı:\n\n🏢 Sponsor Kategorileri:\n- 💻 Teknoloji Şirketleri\n- 🏢 Holdingleri\n- 📚 Eğitim Kuruluşları\n- 🏥 Sağlık Kuruluşları\n\n📝 Sponsor Başvurusu:\n- Şirket Adı, İletişim Kişisi, E-posta, Telefon\n- Destek mesajınız\n\n✅ Platform işletme giderleri sponsorlar tarafından karşılanır — böylece bağışların %100\'ü öğrenciye ulaşır!\n\nBaşvuru: /sponsors sayfasından veya /api/sponsor-applications endpointinden',
    priority: 7,
  },

  // ─── BAŞARI HİKAYELERİ ─────────────────────────────────────
  {
    id: 'impact-3',
    category: 'impact',
    keywords: ['hikaye gönder', 'başarı paylaş', 'hikaye yaz', 'kendi hikayen', 'story', 'success'],
    question: 'Başarı hikayemi nasıl paylaşabilirim?',
    answer: 'Başarı Hikayenizi Paylaşın! 🌟\n\nFundEd\'den destek aldıysanız, hikayenizi anlatabilirsiniz:\n\n📝 Hikaye Formu:\n- Başlık\n- İlham verici alıntı (min 10 karakter)\n- Üniversiteniz\n- Alanınız\n- Aldığınız destek miktarı\n\n✅ Hikayeniz admin onayından sonra yayınlanır.\n\n💙 Hikayeniz binlerce bağışçıya ilham verir ve daha fazla öğrencinin destek bulmasına yardımcı olur!',
    priority: 6,
  },

  // ─── ONBOARDING / İLK ADIMLAR ──────────────────────────────
  {
    id: 'how-4',
    category: 'how_it_works',
    keywords: ['onboarding', 'ilk adım', 'başlangıç', 'nereden başla', 'yeni', 'sıfırdan'],
    question: 'FundEd\'e nereden başlamalıyım?',
    answer: 'FundEd\'e başlamak 3 adımda! 🚀\n\n1️⃣ Doğrulan — Kimliğinizi ve öğrenci belgenizi doğrulayın\n2️⃣ Kampanya Oluştur — Eğitim ihtiyaçlarınızı ve hikayenizi paylaşın\n3️⃣ Destek Al — Bağışçılar kampanyanızı keşfetsin ve destek olsun\n\n💡 Bağışçı olarak başlamak istiyorsanız:\n→ Kampanyalar sayfasına göz atın\n→ Beğendiğiniz bir öğrenciye bağış yapın\n→ Etkilerinizi dashboard\'dan takip edin!',
    priority: 9,
  },

  // ─── HESAP TÜRLERİ ─────────────────────────────────────────
  {
    id: 'account-3',
    category: 'account',
    keywords: ['hesap türü', 'rol', 'kim olabilirim', 'kayıt türü', 'öğrenci mi', 'bağışçı mı', 'mentor mu'],
    question: 'Hangi hesap türleri var?',
    answer: 'FundEd\'de 6 hesap türü bulunur:\n\n🎓 Öğrenci — Kampanya oluştur, destek al\n💝 Bağışçı — Öğrencilere bağış yap\n🧑‍🏫 Mentor — Öğrencilere rehberlik et\n👨‍👩‍👧 Veli — Çocuğunuzun kampanyasını yönetin\n📚 Öğretmen — Öğrencileriniz adına başvurun\n🏫 Okul — Kurumsal düzeyde başvuru\n\nKayıt sırasında "Ben bir..." seçeneğinden hesap türünüzü belirleyin.',
    priority: 8,
  },
  {
    id: 'account-4',
    category: 'account',
    keywords: ['giriş', 'login', 'giriş yap', 'oturum', 'google', 'e-posta giriş', 'telefon giriş'],
    question: 'Giriş yapma yöntemleri nelerdir?',
    answer: 'FundEd\'e giriş yöntemleri:\n\n📧 E-posta ile Giriş — E-posta ve şifre ile\n📱 Telefon ile Giriş — SMS doğrulama kodu ile\n🔵 Google ile Giriş — Google hesabınızla hızlı giriş\n\n📌 İpuçları:\n- "Şifremi Unuttum" ile şifrenizi sıfırlayabilirsiniz\n- Doğrulama kodu 60 saniye içinde gelir\n- Aynı e-posta farklı yöntemlerle kullanılamaz\n\n💡 Devam ederek Kullanım Şartları\'nı kabul etmiş olursunuz.',
    priority: 7,
  },

  // ─── YASAL & GİZLİLİK (EK) ─────────────────────────────────
  {
    id: 'legal-2',
    category: 'legal',
    keywords: ['kullanım şartları', 'terms', 'koşul', 'şart', 'kural', 'yasak'],
    question: 'Kullanım şartları nelerdir?',
    answer: 'FundEd Kullanım Şartları Özeti:\n\n📋 Öğrenci Sorumlulukları:\n- Doğru ve gerçek bilgi sağlamak\n- Meşru doğrulama belgeleri sunmak\n- Fonları belirtilen eğitim amaçları için kullanmak\n\n📋 Bağışçı Sorumlulukları:\n- Bağışlar gönüllü ve (yasal zorunluluk dışında) iade edilemez\n- Vergi yükümlülükleri bağışçıya aittir\n\n⛔ Yasaklanan Faaliyetler:\n- Yanlış/yanıltıcı bilgi verme\n- Platformu yasadışı amaçlarla kullanma\n- Başkasının kimliğine bürünme\n\n⚠️ İhlal durumunda hesap askıya alınır.',
    priority: 6,
  },
  {
    id: 'legal-3',
    category: 'legal',
    keywords: ['gizlilik politikası', 'privacy policy', 'veri toplama', 'bilgi paylaşım', 'cookie'],
    question: 'Gizlilik politikası nedir?',
    answer: 'FundEd Gizlilik Politikası Özeti:\n\n📥 Toplanan Veriler:\n- Hesap bilgileri (ad, e-posta)\n- Öğrenci profil bilgileri\n- Kampanya bilgileri\n- Ödeme bilgileri (iyzico üzerinden)\n- Doğrulama belgeleri\n\n🔒 Kişisel bilgiler satılmaz!\n\n📤 Bilgi Paylaşımı (sadece):\n- iyzico (ödeme işleme)\n- Cloudinary (dosya depolama)\n- Google OAuth (kimlik doğrulama)\n- Yasal zorunluluklar\n\n✅ Haklarınız: Bilgilerinize erişim, düzeltme, silme talep edebilirsiniz.',
    priority: 6,
  },
  {
    id: 'legal-4',
    category: 'legal',
    keywords: ['disclaimer', 'sorumluluk', 'reddi beyan', 'garanti yok', 'risk'],
    question: 'FundEd\'in sorumluluk sınırları nelerdir?',
    answer: 'FundEd Sorumluluk Beyanı:\n\n📌 FundEd bir teknoloji platformudur — finansal kuruluş, hayır kurumu veya eğitim kurumu değildir.\n\n⚠️ FundEd garanti etmez:\n- Kampanyaların fonlama hedefine ulaşacağını\n- Öğrencilerin fonları belirtildiği şekilde kullanacağını\n- Kampanyaların başarılı olacağını\n\n📌 Doğrulama, öğrencinin kampanyasının onayı anlamına gelmez.\n📌 Bağışlar gönüllü katkılardır, satın alma değildir.\n\n3. taraf hizmetler: iyzico, Cloudinary, Google OAuth',
    priority: 5,
  },

  // ─── TEKNİK (EK) ────────────────────────────────────────────
  {
    id: 'technical-4',
    category: 'technical',
    keywords: ['pwa', 'ana ekran', 'uygulama ekle', 'install', 'kısayol'],
    question: 'FundEd\'i telefonuma ekleyebilir miyim?',
    answer: 'Evet! FundEd PWA (Progressive Web App) olarak çalışır:\n\n📱 iPhone:\n1. Safari\'de funded.com\'u açın\n2. Paylaş butonuna tıklayın\n3. "Ana Ekrana Ekle" seçin\n\n📱 Android:\n1. Chrome\'da funded.com\'u açın\n2. Menü → "Ana ekrana ekle"\n\n✅ Artık FundEd telefon uygulaması gibi çalışır!\n📌 Bildirimler alabilir, off-line erişim sağlayabilirsiniz.',
    priority: 6,
  },
  {
    id: 'technical-5',
    category: 'technical',
    keywords: ['para birimi', 'dolar', 'tl', 'lira', 'currency', 'kur', 'döviz'],
    question: 'Hangi para birimlerinde bağış yapabilirim?',
    answer: 'FundEd\'de desteklenen para birimleri:\n\n💵 USD — Amerikan Doları\n💵 TRY — Türk Lirası\n\n📌 Minimum bağış:\n- TRY: ₺100\n- USD: $10\n\n💡 Sağ üst köşedeki para birimi seçiciyle değiştirebilirsiniz.\nHızlı miktarlar: $25, $50, $100, $250, $500, $1.000',
    priority: 7,
  },
  {
    id: 'technical-6',
    category: 'technical',
    keywords: ['iletişim', 'destek', 'email', 'mail', 'contact', 'ulaşım', 'info'],
    question: 'FundEd\'e nasıl ulaşabilirim?',
    answer: 'FundEd İletişim:\n\n📧 E-posta: info@funded.com\n🤖 AI Asistan: Ben her zaman buradayım!\n🌐 Website: funded.com\n\n📱 Sosyal Medya:\n🐦 Twitter\n📘 Facebook\n📸 Instagram\n\n© 2026 FundEd. Tüm hakları saklıdır.',
    priority: 7,
  },

  // ─── EK DUYGUSAL / MOTİVASYON ──────────────────────────────
  {
    id: 'emotional-6',
    category: 'emotional',
    keywords: ['etki örnek', 'ne yapabilirim', '$25', '$50', '$100', '$250', 'ne değişir'],
    question: 'Bağışımla ne fark yaratabilirim?',
    answer: 'Bağışınızın somut etkisi:\n\n📝 $25 → Bir öğrencinin temel defter ve kalem ihtiyaçları\n🎒 $50 → Bir öğrencinin okul çantası ihtiyacı\n📚 $100 → Bir çocuğun 1 yıllık okul malzemesi\n💻 $250 → Bir sınıfa dijital eğitim materyali\n🎓 $750 → Bir öğrencinin 1 dönemlik bursu\n🏫 $2.500 → Bir sınıfın yenilenmesi\n\n🌟 Her kuruş önemli, her bağış bir hayatı değiştirir!\n\n📖 "Eğitim, dünyayı değiştirebileceğiniz en güçlü silahtır." — Nelson Mandela',
    followUp: 'Haydi, bir öğrenciye destek olalım mı?',
    priority: 9,
  },
  {
    id: 'emotional-7',
    category: 'emotional',
    keywords: ['244 milyon', 'dünya', 'çocuk okula', 'erişim', 'eğitime erişim', 'istatistik'],
    question: 'Eğitime erişim sorunu ne kadar büyük?',
    answer: '📊 Dünya genelinde 244 milyon+ çocuk okula gidemiyor.\n\n💔 Bu çocukların büyük çoğunluğu maddi imkânsızlıklar nedeniyle eğitimden mahrum kalıyor.\n\n🎯 FundEd\'in misyonu bu eşitsizliği ortadan kaldırmak.\n\n🌍 2030 hedefimiz: Eğitimde ölçülebilir eşitlik sağlamak.\n\n💙 "Dünyada hiçbir öğrencinin maddi imkânsızlık nedeniyle eğitimden mahrum kalmadığı bir gelecek" — bizim vizyonumuz.\n\nSiz de bu vizyonun bir parçası olabilirsiniz!',
    priority: 8,
  },
  {
    id: 'emotional-8',
    category: 'emotional',
    keywords: ['güvenilirlik', 'neden güveneyim', 'sahte mi', 'dolandırıcılık', 'fraud'],
    question: 'FundEd\'e neden güvenmeliyim?',
    answer: 'FundEd\'e güvenmeniz için 10 neden:\n\n1️⃣ %100 Doğrulama — Her öğrenci 4 kademeli doğrulamadan geçer\n2️⃣ %100 İzlenebilirlik — Her bağışın akıbeti takip edilir\n3️⃣ %100 İade Güvencesi — Doğrulanamazsa 5-7 günde iade\n4️⃣ 0 Gizli Maliyet — Platform kesintisi şeffaf\n5️⃣ 4.9/5.0 Güven Skoru\n6️⃣ 48 Saat İnceleme — Hızlı başvuru değerlendirme\n7️⃣ SSL + 3D Secure ödeme\n8️⃣ iyzico sertifikalı altyapı\n9️⃣ Admin denetimi — Her kampanya incelenir\n🔟 KVKK uyumlu veri koruma\n\nŞeffaflık bizim DNA\'mızdır! 🛡️',
    priority: 10,
  },

  // ─── KAMPANYA FİLTRELERİ ───────────────────────────────────
  {
    id: 'student-5',
    category: 'student',
    keywords: ['kampanya filtre', 'ara', 'bul', 'keşfet', 'browse', 'göz at', 'incele'],
    question: 'Kampanyaları nasıl filtreleyebilirim?',
    answer: 'Kampanyalar sayfasında gelişmiş filtreleme:\n\n🔍 Arama: Öğrenci adı, üniversite, bölüm\n🎓 Bölüm: Mühendislik, Tıp, Hukuk, İşletme, Sanat vb.\n🏫 Üniversite: Belirli üniversiteye göre\n🌍 Ülke: Türkiye veya uluslararası\n📊 Durum: Aktif, Tamamlanmış\n🔥 Sıralama: En acil, Hedefe en yakın, En yeni\n\n💡 Ya da bana "Öğrenci bul" demeniz yeterli — birkaç soru sorup size en uygun kampanyayı bulurum! 🤖',
    followUp: 'Size en uygun öğrenciyi bulmamı ister misiniz?',
    priority: 8,
  },

  // ─── ANA SAYFA & GENEL ─────────────────────────────────────
  {
    id: 'about-10',
    category: 'about',
    keywords: ['ana sayfa', 'homepage', 'anasayfa', 'öne çıkan', 'featured'],
    question: 'Ana sayfada neler var?',
    answer: 'FundEd Ana Sayfası:\n\n🌟 Hero Bölümü: "Eğitime Destek Ol, Hayatları Değiştir"\n📊 Canlı İstatistikler: Desteklenen Öğrenci, Toplam Bağış, Aktif Kampanya, Bağışçı Sayısı\n🔍 Nasıl Çalışır: 3 adımlık süreç açıklaması\n⭐ Öne Çıkan Kampanyalar: Seçilmiş kampanyalar\n🎯 CTA: "Fark Yaratmaya Hazır mısınız? — Kampanyaları Keşfet"\n\nHer şey tek sayfada! 🚀',
    priority: 5,
  },

  // ─── İLERLEME RAPORLARI ────────────────────────────────────
  {
    id: 'impact-4',
    category: 'impact',
    keywords: ['ilerleme raporu', 'quarterly', 'üç aylık', 'güncelleme', 'öğrenci güncelleme'],
    question: 'İlerleme raporları nasıl çalışır?',
    answer: 'FundEd İlerleme Raporları:\n\n📋 Üç aylık öğrenci ilerleme raporları\n📸 Fotoğraflı güncellemeler\n📊 Bağış kullanım dağılımı\n💬 Öğrenci teşekkür mesajları\n🎥 Video hikayeleri\n\n📌 Rapor türleri:\n- İlerleme güncellemesi\n- Teşekkür mesajı\n- Milestone (hedef gerçekleşme)\n\n📥 Raporlar Bağışlarım → Bağış Detayı sayfasından görüntülenebilir.\n\n💡 "Bağış kullanım dağılımı, öğrenci harcama raporlarını paylaştıktan sonra görüntülenir."',
    priority: 6,
  },

  // ─── DUYGUSAL — BAĞIŞ ANLAMI ───────────────────────────────
  {
    id: 'emotional-9',
    category: 'emotional',
    keywords: ['her bağış', 'umut', 'değişim', 'katkı', 'fayda', 'anlam'],
    question: 'Her bağışın bir anlamı var mı?',
    answer: '💙 Her bağış bir umut yeşertir — birlikte değişimi yaratıyoruz.\n\n🌟 Bağışınız sadece para değil:\n- Bir öğrencinin geleceğine yatırım\n- Bir ailenin umuduna katkı\n- Bir toplumun dönüşümüne destek\n\n📖 "Bir çocuğa eğitim vermek, bir yaşamı değiştirmek değildir. Bir nesli dönüştürmektir."\n\n🦋 Kelebek etkisi: Bir bağış → Bir mezuniyet → Bir kariyer → Yüzlerce hayata dokunuş\n\n"Eğitime erişimi demokratikleştiren topluluğumuza katılın." 🎓',
    priority: 9,
  },
];

// ═══════════════════════════════════════════════════════════════
// ARAMA MOTORU
// ═══════════════════════════════════════════════════════════════

/** Türkçe karakterleri normalize eder ve küçük harfe çevirir */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

/** Birbiriyle ilişkili kategori grupları — aynı grup içindeki kategoriler related olabilir */
const RELATED_CATEGORY_GROUPS: KnowledgeCategory[][] = [
  ['about', 'how_it_works', 'impact'],
  ['donation', 'payment'],
  ['security', 'verification'],
  ['student', 'campaign'],
  ['donor', 'badges', 'calendar'],
  ['mentor', 'alumni'],
  ['corporate', 'sponsor'],
  ['emotional'],
  ['technical'],
  ['legal'],
  ['product_donation'],
];

/** Verilen kategori ile ilişkili kategorileri döndürür */
function getRelatedCategories(category: KnowledgeCategory): KnowledgeCategory[] {
  for (const group of RELATED_CATEGORY_GROUPS) {
    if (group.includes(category)) return group;
  }
  return [category];
}

/**
 * Ana arama fonksiyonu — en iyi eşleşen entry'yi döndürür.
 * Hem keyword eşleşmesi hem de fuzzy matching kullanır.
 * İlgili sorular aynı veya yakın kategoriden seçilir.
 */
export function searchKnowledge(query: string): {
  entry: KnowledgeEntry | null;
  related: KnowledgeEntry[];
} {
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 1);

  if (queryWords.length === 0) return { entry: null, related: [] };

  const scored: { entry: KnowledgeEntry; score: number; keywordHits: number }[] = [];

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    let keywordHits = 0;

    // 1. Keyword eşleşme (en yüksek ağırlık)
    for (const keyword of entry.keywords) {
      const nk = normalizeText(keyword);

      // Tam içerme: "güvenilir mi" query'si "güvenilir" keyword'ünü içerir
      if (normalizedQuery.includes(nk)) {
        score += 10 * nk.length;
        keywordHits++;
      }

      // Kelime bazlı eşleşme (tam kelime eşleşmeleri)
      for (const word of queryWords) {
        if (nk === word) {
          score += 8;  // tam kelime eşleşmesi
          keywordHits++;
        } else if (nk.includes(word) && word.length >= 4) {
          score += 3;
          keywordHits++;
        } else if (word.includes(nk) && nk.length >= 4) {
          score += 3;
          keywordHits++;
        }
        // Kök eşleşme: sadece 4+ karakter ve çok kısa olmayan kelimeler
        // (3 karakter kök eşleşmesi çok fazla yanlış pozitif üretiyor)
        if (word.length >= 5 && nk.length >= 5 && word.substring(0, 4) === nk.substring(0, 4)) {
          score += 1;
        }
      }
    }

    // 2. Soru metninde eşleşme
    const normalizedQuestion = normalizeText(entry.question);
    for (const word of queryWords) {
      if (normalizedQuestion.includes(word)) score += 2;
    }

    // 3. Öncelik bonusu
    score += entry.priority * 0.5;

    if (score > 0) {
      scored.push({ entry, score, keywordHits });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  // Minimum eşik
  const threshold = 5;
  const best = scored[0]?.score >= threshold ? scored[0].entry : null;

  // İlgili sorular: aynı veya yakın kategoriden seçilir
  // Farklı konudaki entry'ler önerilmez — bu sayede alakasız takip soruları engellenir
  let related: KnowledgeEntry[] = [];
  if (best) {
    const relatedCategories = getRelatedCategories(best.category);
    const relatedThreshold = threshold * 1.5; // related için daha yüksek eşik

    // Önce aynı kategoriden eşleşmeleri bul
    const sameCategoryEntries = scored.filter(
      (s) =>
        s.score >= relatedThreshold &&
        s.entry.id !== best.id &&
        s.entry.category === best.category &&
        s.keywordHits >= 1, // en az 1 gerçek keyword eşleşmesi olmalı
    );

    // Sonra ilişkili kategorilerden eşleşmeleri bul
    const relatedCategoryEntries = scored.filter(
      (s) =>
        s.score >= relatedThreshold &&
        s.entry.id !== best.id &&
        s.entry.category !== best.category &&
        relatedCategories.includes(s.entry.category) &&
        s.keywordHits >= 2, // farklı kategori için 2+ keyword eşleşmesi gerekli
    );

    // Aynı kategoriden 2'ye kadar, yoksa ilişkili kategoriden tamamla
    related = [
      ...sameCategoryEntries.slice(0, 2).map((s) => s.entry),
      ...relatedCategoryEntries.slice(0, 2 - sameCategoryEntries.length).map((s) => s.entry),
    ].slice(0, 2);
  }

  return { entry: best, related };
}

/** Rastgele motivasyon mesajı döndür */
export function getRandomMotivation(): KnowledgeEntry {
  const emotional = KNOWLEDGE_BASE.filter((e) => e.category === 'emotional');
  return emotional[Math.floor(Math.random() * emotional.length)];
}

/** Bilinmeyen sorular için fallback cevaplar */
const FALLBACK_RESPONSES = [
  'Bu konuda kesin bir bilgim yok ama size başka konularda yardımcı olabilirim! 🤔\n\n💡 Şunları deneyebilirsiniz:\n- "Nasıl bağış yapabilirim?"\n- "Bana öğrenci öner"\n- "FundEd nedir?"',
  'Hmm, bu soruyu tam anlayamadım. 🤔 Başka bir şekilde sormayı deneyebilir misiniz? Ya da şu konularda yardımcı olabilirim:\n\n🎯 Öğrenci eşleştirme\n💝 Bağış süreci\n🔒 Güvenlik bilgisi',
  'Bu konuda detaylı bilgi için info@funded.com adresine yazabilirsiniz. 📧\n\nBen şu konularda yardımcı olabilirim:\n- Platform hakkında bilgi\n- Bağış süreci\n- Öğrenci önerisi\n\nNe sormak istersiniz? 😊',
];

export function getFallbackResponse(): string {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

/** Saate göre karşılama mesajı */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'İyi geceler! 🌙';
  if (hour < 12) return 'Günaydın! ☀️';
  if (hour < 18) return 'İyi günler! 🌤️';
  return 'İyi akşamlar! 🌆';
}

/** Tüm özel günler — SPECIAL_DAYS (notifications.ts) ile senkronize, tam liste */
import { SPECIAL_DAYS } from '@/types/notifications';

export interface SpecialDayInfo {
  title: string;
  emoji: string;
  description: string;
  link: string;
  daysLeft: number;
}

/** Bugün bir özel gün mü? Tam eşleşme (daysLeft === 0). */
export function getTodaySpecialDay(): SpecialDayInfo | null {
  const result = getUpcomingSpecialDay(0);
  return result && result.daysLeft === 0 ? result : null;
}

/** Yaklaşan özel günü kontrol et (varsayılan ±3 gün, tam liste) */
export function getUpcomingSpecialDay(maxDaysAhead = 3): SpecialDayInfo | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();

  let closest: SpecialDayInfo | null = null;

  for (const sd of SPECIAL_DAYS) {
    // SPECIAL_DAYS tarihlerinden ay-gün çıkar (yıl-bağımsız)
    const parts = sd.date.split('-');
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const eventDate = new Date(currentYear, month, day);
    eventDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round(
      (eventDate.getTime() - today.getTime()) / 86400000,
    );

    if (diffDays >= 0 && diffDays <= maxDaysAhead) {
      if (!closest || diffDays < closest.daysLeft) {
        closest = {
          title: sd.title,
          emoji: sd.emoji || '📅',
          description: sd.description,
          link: sd.link || '/campaigns',
          daysLeft: diffDays,
        };
      }
    }
  }

  return closest;
}
