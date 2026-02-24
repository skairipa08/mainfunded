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
  | 'emotional';

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
    keywords: ['minimum', 'en az', 'alt limit', 'kaç tl', 'ne kadar', 'miktar', 'tutar'],
    question: 'En az ne kadar bağış yapabilirim?',
    answer: 'Bağış miktarında bir alt limit yoktur — her miktar değerlidir! ₺10 bile bir öğrencinin hayatında fark yaratabilir. 💝\n\nÖrneğin:\n- ₺10 → Bir günlük yemek\n- ₺50 → Bir ders kitabı\n- ₺100 → Bir haftalık ulaşım\n- ₺500 → Bir aylık barınma katkısı\n- ₺1000+ → Bir dönemlik burs desteği',
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
    keywords: ['düzenli', 'aylık', 'otomatik', 'tekrar', 'abonelik', 'sürekli', 'periyodik'],
    question: 'Düzenli/aylık bağış yapabilir miyim?',
    answer: 'Şu an için bağışlar tek seferlik yapılmaktadır. Ancak bağış takvimimiz sayesinde ayda bir bağış yapmanızı hatırlatıyoruz! 📅\n\n🔥 Ayrıca bağış serisi (streak) sistemimiz var — art arda her ay bağış yaparak streak\'inizi uzatabilir ve özel rozetler kazanabilirsiniz!\n\nAylık hatırlatma günü ayarlayabilirsiniz: Profil → Bildirim Tercihleri → Hatırlatma Günü.',
    priority: 7,
  },
  {
    id: 'donation-5',
    category: 'donation',
    keywords: ['iade', 'geri', 'iptal', 'vazgeç', 'geri al', 'para iade', 'refund', 'cancel'],
    question: 'Bağışımı geri alabilir miyim?',
    answer: 'Bağışlar prensip olarak geri alınamaz, çünkü bağışınız doğrudan öğrencinin kampanyasına aktarılır. Ancak:\n\n⚠️ Yanlışlıkla yapılan bağışlar için 24 saat içinde destek ekibimize yazabilirsiniz.\n📧 info@funded.com adresine durumu açıklayan bir e-posta gönderin.\n\nHer durumda size yardımcı olmak için elimizden geleni yaparız.',
    priority: 6,
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
    keywords: ['komisyon', 'kesinti', 'ücret', 'fee', 'commission', 'cut', 'charge', 'yüzde'],
    question: 'FundEd komisyon alıyor mu?',
    answer: 'FundEd, platformun sürdürülebilirliği için minimal bir hizmet bedeli alır. Bağışınızın büyük çoğunluğu doğrudan öğrenciye ulaşır. Detaylı bilgi için şeffaflık sayfamızı ziyaret edebilirsiniz.',
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
    keywords: ['dil', 'ingilizce', 'türkçe', 'language', 'çeviri'],
    question: 'Site hangi dillerde kullanılabilir?',
    answer: 'FundEd şu an Türkçe ve İngilizce olarak hizmet vermektedir. 🇹🇷🇬🇧\n\nDil değiştirmek için sağ üst köşedeki dil seçicisini kullanabilirsiniz.',
    priority: 4,
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

/**
 * Ana arama fonksiyonu — en iyi eşleşen entry'yi döndürür.
 * Hem keyword eşleşmesi hem de fuzzy matching kullanır.
 */
export function searchKnowledge(query: string): {
  entry: KnowledgeEntry | null;
  related: KnowledgeEntry[];
} {
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 1);

  if (queryWords.length === 0) return { entry: null, related: [] };

  const scored: { entry: KnowledgeEntry; score: number }[] = [];

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;

    // 1. Keyword eşleşme (en yüksek ağırlık)
    for (const keyword of entry.keywords) {
      const nk = normalizeText(keyword);

      // Tam içerme: "güvenilir mi" query'si "güvenilir" keyword'ünü içerir
      if (normalizedQuery.includes(nk)) {
        score += 10 * nk.length;
      }

      // Kelime bazlı eşleşme
      for (const word of queryWords) {
        if (nk.includes(word)) score += 3;
        if (word.includes(nk)) score += 3;
        // Kök eşleşme (ilk 3 harf)
        if (word.length >= 3 && nk.length >= 3 && word.substring(0, 3) === nk.substring(0, 3)) {
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
      scored.push({ entry, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  // Minimum eşik
  const threshold = 5;
  const best = scored[0]?.score >= threshold ? scored[0].entry : null;

  // İlgili sorular: sonraki en iyi 2 eşleşme
  const related = scored
    .filter((s) => s.score >= threshold && s.entry.id !== best?.id)
    .slice(0, 2)
    .map((s) => s.entry);

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

/** Yaklaşan özel günü kontrol et (±3 gün) */
export function getUpcomingSpecialDay(): { title: string; emoji: string; daysLeft: number } | null {
  const today = new Date();
  const currentYear = today.getFullYear();

  const specialDays = [
    { month: 1, day: 24, title: 'Uluslararası Eğitim Günü', emoji: '📖' },
    { month: 2, day: 11, title: 'Kadınlar ve Kızlar Bilim Günü', emoji: '🔬' },
    { month: 3, day: 8, title: 'Dünya Kadınlar Günü', emoji: '💜' },
    { month: 4, day: 23, title: '23 Nisan Çocuk Bayramı', emoji: '🎈' },
    { month: 5, day: 19, title: 'Gençlik ve Spor Bayramı', emoji: '🏃' },
    { month: 6, day: 1, title: 'Uluslararası Çocuk Günü', emoji: '🧒' },
    { month: 8, day: 12, title: 'Uluslararası Gençlik Günü', emoji: '🌟' },
    { month: 9, day: 8, title: 'Uluslararası Okuryazarlık Günü', emoji: '✏️' },
    { month: 10, day: 5, title: 'Dünya Öğretmenler Günü', emoji: '👩‍🏫' },
    { month: 10, day: 11, title: 'Kız Çocukları Günü', emoji: '👧' },
    { month: 11, day: 20, title: 'Dünya Çocuk Hakları Günü', emoji: '🌈' },
    { month: 11, day: 24, title: 'Öğretmenler Günü', emoji: '🍎' },
    { month: 12, day: 3, title: 'Dünya Engelliler Günü', emoji: '♿' },
    { month: 12, day: 10, title: 'Dünya İnsan Hakları Günü', emoji: '⭐' },
  ];

  for (const day of specialDays) {
    const eventDate = new Date(currentYear, day.month - 1, day.day);
    const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / 86400000);
    if (diffDays >= 0 && diffDays <= 3) {
      return { title: day.title, emoji: day.emoji, daysLeft: diffDays };
    }
  }

  return null;
}
