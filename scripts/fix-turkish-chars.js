const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'locales', 'tr.json');
let content = fs.readFileSync(filePath, 'utf-8');

// Exact value replacements: [old, new]
// We wrap in quotes to ensure we only replace JSON string values, not keys
const replacements = [
  // === COMMON ===
  [`"Giris Yap"`, `"Giriş Yap"`],
  [`"Kayit Ol"`, `"Kayıt Ol"`],
  [`"Cikis Yap"`, `"Çıkış Yap"`],
  [`"Turkce"`, `"Türkçe"`],
  [`"Yukleniyor..."`, `"Yükleniyor..."`],
  [`"Basarili"`, `"Başarılı"`],
  [`"Iptal"`, `"İptal"`],
  [`"Duzenle"`, `"Düzenle"`],
  [`"Goruntule"`, `"Görüntüle"`],
  [`"Ileri"`, `"İleri"`],
  [`"Gonder"`, `"Gönder"`],
  [`"Tumu"`, `"Tümü"`],
  [`"Hicbiri"`, `"Hiçbiri"`],
  [`"Hayir"`, `"Hayır"`],
  [`"Basla"`, `"Başla"`],

  // === NAV ===
  [`"Kampanyalara Goz At"`, `"Kampanyalara Göz At"`],
  [`"Nasil Calisir"`, `"Nasıl Çalışır"`],
  [`"Hakkimizda"`, `"Hakkımızda"`],
  [`"Yonetici Paneli"`, `"Yönetici Paneli"`],
  [`"Ogrenciler"`, `"Öğrenciler"`],
  [`"Dogrulamalar"`, `"Doğrulamalar"`],
  [`"Bagis Yap"`, `"Bağış Yap"`],
  [`"Ogrenci Gunlukleri"`, `"Öğrenci Günlükleri"`],
  [`"Mezunlarimiz"`, `"Mezunlarımız"`],
  [`"Urun Bagisi"`, `"Ürün Bağışı"`],
  [`"En iyi bagiscilari gor"`, `"En iyi bağışçıları gör"`],
  [`"Kazanilabilir rozetler"`, `"Kazanılabilir rozetler"`],
  [`"Ogrenci guncellemeleri"`, `"Öğrenci güncellemeleri"`],
  [`"Basari hikayeleri"`, `"Başarı hikayeleri"`],
  [`"Ogrencilere destek ol"`, `"Öğrencilere destek ol"`],
  [`"Laptop, kitap vs. bagisla"`, `"Laptop, kitap vs. bağışla"`],
  [`"Kurumsal eslesme programi"`, `"Kurumsal eşleşme programı"`],
  [`"Ogrencilere rehberlik et"`, `"Öğrencilere rehberlik et"`],
  [`"Platform hakkinda"`, `"Platform hakkında"`],
  [`"3 aylik ogrenci raporlari"`, `"3 aylık öğrenci raporları"`],
  [`"%100 guvenli bagis"`, `"%100 güvenli bağış"`],
  [`"Harcama raporlari"`, `"Harcama raporları"`],
  [`"Amacimiz ve hedeflerimiz"`, `"Amacımız ve hedeflerimiz"`],
  [`"Bizi taniyin"`, `"Bizi tanıyın"`],
  [`"Hakkinda"`, `"Hakkında"`],

  // === HOME ===
  [`"Egitime Destek Ol, Hayatlari Degistir"`, `"Eğitime Destek Ol, Hayatları Değiştir"`],
  [`"Dogrulanmis ogrencilerin egitim yolculugunda onlara destek olun. Her bagis fark yaratir."`, `"Doğrulanmış öğrencilerin eğitim yolculuğunda onlara destek olun. Her bağış fark yaratır."`],
  [`"Bagis Yapmaya Basla"`, `"Bağış Yapmaya Başla"`],
  [`"Ogrenci Olarak Basvur"`, `"Öğrenci Olarak Başvur"`],
  [`"Desteklenen Ogrenci"`, `"Desteklenen Öğrenci"`],
  [`"Toplam Bagis"`, `"Toplam Bağış"`],
  [`"Aktif Kampanya"`, `"Aktif Kampanya"`],
  [`"Comert Bagisci"`, `"Cömert Bağışçı"`],
  [`"Ogrenciler Basvurur"`, `"Öğrenciler Başvurur"`],
  [`"Dogrulanmis ogrenciler, egitim hedefleri ve finansman ihtiyaclariyla kampanyalar olusturur."`, `"Doğrulanmış öğrenciler, eğitim hedefleri ve finansman ihtiyaçlarıyla kampanyalar oluşturur."`],
  [`"Bagiscilar Destek Olur"`, `"Bağışçılar Destek Olur"`],
  [`"Bagiscilar kampanyalara goz atar ve desteklemek istedikleri ogrencilere katkida bulunur."`, `"Bağışçılar kampanyalara göz atar ve desteklemek istedikleri öğrencilere katkıda bulunur."`],
  [`"Hayaller Gerceklesir"`, `"Hayaller Gerçekleşir"`],
  [`"Ogrenciler fonlari dogrudan alir ve egitim hedeflerine ulasir."`, `"Öğrenciler fonları doğrudan alır ve eğitim hedeflerine ulaşır."`],
  [`"One Cikan Kampanyalar"`, `"Öne Çıkan Kampanyalar"`],
  [`"Tum Kampanyalari Gor"`, `"Tüm Kampanyaları Gör"`],
  [`"Kampanyalari Kesfet"`, `"Kampanyaları Keşfet"`],

  // === AUTH ===
  [`"Tekrar Hos Geldiniz"`, `"Tekrar Hoş Geldiniz"`],
  [`"Hesabiniza giris yapin"`, `"Hesabınıza giriş yapın"`],
  [`"Hesabiniz yok mu?"`, `"Hesabınız yok mu?"`],
  [`"Kayit olun"`, `"Kayıt olun"`],
  [`"Hesap Olustur"`, `"Hesap Oluştur"`],
  [`"Zaten hesabiniz var mi?"`, `"Zaten hesabınız var mı?"`],
  [`"Giris yapin"`, `"Giriş yapın"`],
  [`"Kimlik dogrulama sirasinda bir hata olustu."`, `"Kimlik doğrulama sırasında bir hata oluştu."`],
  [`"Sunucu yapilandirmasinda bir sorun var."`, `"Sunucu yapılandırmasında bir sorun var."`],
  [`"Erisim reddedildi. Yetkiniz olmayabilir."`, `"Erişim reddedildi. Yetkiniz olmayabilir."`],
  [`"Dogrulama baglantisinin suresi dolmus veya zaten kullanilmis."`, `"Doğrulama bağlantısının süresi dolmuş veya zaten kullanılmış."`],
  [`"Kimlik dogrulama sirasinda hata. Lutfen tekrar deneyin."`, `"Kimlik doğrulama sırasında hata. Lütfen tekrar deneyin."`],
  [`"Bu e-posta zaten baska bir hesapla iliskili."`, `"Bu e-posta zaten başka bir hesapla ilişkili."`],
  [`"Bu sayfaya erismek icin giris yapin."`, `"Bu sayfaya erişmek için giriş yapın."`],
  [`"Ana Sayfaya Don"`, `"Ana Sayfaya Dön"`],

  // === VERIFICATION ===
  [`"Ogrenci Dogrulamasi"`, `"Öğrenci Doğrulaması"`],
  [`"Bagiscilarin guvenini artirmak icin dogrulama seviyeni sec ve gerekli belgeleri yukle."`, `"Bağışçıların güvenini artırmak için doğrulama seviyeni seç ve gerekli belgeleri yükle."`],
  [`"Daha yuksek seviye = daha yuksek guven. Seviye arttikca ek kanit istenebilir."`, `"Daha yüksek seviye = daha yüksek güven. Seviye arttıkça ek kanıt istenebilir."`],
  [`"Okul E-postasi ile Dogrulama"`, `"Okul E-postası ile Doğrulama"`],
  [`"Okul e-postana bir dogrulama baglantisi gondeririz."`, `"Okul e-postana bir doğrulama bağlantısı göndeririz."`],
  [`"Gerekli"`, `"Gerekli"`],

  // verification.status
  [`"Inceleme Bekliyor"`, `"İnceleme Bekliyor"`],
  [`"Onaylandi"`, `"Onaylandı"`],
  [`"Ek Bilgi Gerekli"`, `"Ek Bilgi Gerekli"`],
  [`"Inceleme Altinda"`, `"İnceleme Altında"`],
  [`"Askiya Alindi"`, `"Askıya Alındı"`],
  [`"Suresi Doldu"`, `"Süresi Doldu"`],
  [`"Iptal Edildi"`, `"İptal Edildi"`],
  [`"Kalici Olarak Yasaklandi"`, `"Kalıcı Olarak Yasaklandı"`],

  // verification.documents
  [`"Ogrenci Kimligi"`, `"Öğrenci Kimliği"`],
  [`"Ogrenci Belgesi"`, `"Öğrenci Belgesi"`],
  [`"Devlet Kimligi"`, `"Devlet Kimliği"`],
  [`"Adres Kaniti"`, `"Adres Kanıtı"`],
  [`"Diger Belge"`, `"Diğer Belge"`],

  // verification.form
  [`"Kisisel Bilgiler"`, `"Kişisel Bilgiler"`],
  [`"Dogum Tarihi"`, `"Doğum Tarihi"`],
  [`"Telefon Numarasi"`, `"Telefon Numarası"`],
  [`"Ulke"`, `"Ülke"`],
  [`"Sehir"`, `"Şehir"`],
  [`"Egitim Bilgileri"`, `"Eğitim Bilgileri"`],
  [`"Kurum Adi"`, `"Kurum Adı"`],
  [`"Kurum Turu"`, `"Kurum Türü"`],
  [`"Bolum"`, `"Bölüm"`],
  [`"Ogrenci No (Opsiyonel)"`, `"Öğrenci No (Opsiyonel)"`],
  [`"Kayit Yili"`, `"Kayıt Yılı"`],
  [`"Tam zamanli ogrenci"`, `"Tam zamanlı öğrenci"`],
  [`"Universite"`, `"Üniversite"`],
  [`"Yuksekokul"`, `"Yüksekokul"`],
  [`"Meslek Yuksekokulu"`, `"Meslek Yüksekokulu"`],
  [`"On Lisans"`, `"Ön Lisans"`],
  [`"Yuksek Lisans"`, `"Yüksek Lisans"`],
  [`"Belgeleri Yukle"`, `"Belgeleri Yükle"`],
  [`"Incelemeye Gonder"`, `"İncelemeye Gönder"`],
  [`"Belge Adi"`, `"Belge Adı"`],
  [`"Belgeyi Kaldir"`, `"Belgeyi Kaldır"`],
  [`"Ogrenci kimligi, kayit belgesi veya transkript gibi belgelerinizi ekleyin"`, `"Öğrenci kimliği, kayıt belgesi veya transkript gibi belgelerinizi ekleyin"`],

  // verification.tiers
  [`"Belge ile Dogrulama"`, `"Belge ile Doğrulama"`],
  [`"Ogrenci belgesi veya kayit belgesi yukleyerek dogrula."`, `"Öğrenci belgesi veya kayıt belgesi yükleyerek doğrula."`],
  [`"Gerekli: Ogrenci belgesi"`, `"Gerekli: Öğrenci belgesi"`],
  [`"Yuksek Guven"`, `"Yüksek Güven"`],
  [`"Belge + okul portali ekran goruntusu (veya QR/barkod kaniti) ile dogrula."`, `"Belge + okul portalı ekran görüntüsü (veya QR/barkod kanıtı) ile doğrula."`],
  [`"Gerekli: Ogrenci belgesi, Portal ekran goruntusu"`, `"Gerekli: Öğrenci belgesi, Portal ekran görüntüsü"`],
  [`"Resmi universite onayi ile dogrulandi"`, `"Resmi üniversite onayı ile doğrulandı"`],

  // verification.badges
  [`"E-posta Dogrulandi"`, `"E-posta Doğrulandı"`],
  [`"Dogrulanmis Ogrenci"`, `"Doğrulanmış Öğrenci"`],
  [`"Dogrulanmis Ogrenci: Yuksek Guven"`, `"Doğrulanmış Öğrenci: Yüksek Güven"`],
  [`"Partner Dogrulandi"`, `"Partner Doğrulandı"`],

  // verification.checks
  [`"Kayit Belgesi"`, `"Kayıt Belgesi"`],
  [`"Universite Onayi"`, `"Üniversite Onayı"`],

  // verification.steps
  [`"Dogrulama Seviyesi Secin"`, `"Doğrulama Seviyesi Seçin"`],
  [`"Incele ve Gonder"`, `"İncele ve Gönder"`],

  // verification.statusLabels
  [`"Inceleniyor"`, `"İnceleniyor"`],

  // verification misc
  [`"Belgeler okunakli, tam kadraj ve guncel olmali."`, `"Belgeler okunaklı, tam kadraj ve güncel olmalı."`],
  [`"Ogrenci belgesi / Kayit belgesi"`, `"Öğrenci belgesi / Kayıt belgesi"`],
  [`"Ogrenci kimligi"`, `"Öğrenci kimliği"`],
  [`"Okul portali ekran goruntusu"`, `"Okul portalı ekran görüntüsü"`],
  [`"Surukle birak veya dosya sec"`, `"Sürükle bırak veya dosya seç"`],
  [`"Belgeler sadece dogrulama icin kullanilir ve guvenli sekilde saklanir."`, `"Belgeler sadece doğrulama için kullanılır ve güvenli şekilde saklanır."`],
  [`"Secilen Seviye"`, `"Seçilen Seviye"`],
  [`"Varsa ek aciklama yazabilirsin."`, `"Varsa ek açıklama yazabilirsin."`],
  [`"Gondererek, saglanan tum bilgilerin dogru oldugunu onaylarsiniz. Ekibimiz basvurunuzu 1-3 is gunu icinde inceleyecektir."`, `"Göndererek, sağlanan tüm bilgilerin doğru olduğunu onaylarsınız. Ekibimiz başvurunuzu 1-3 iş günü içinde inceleyecektir."`],
  [`"Dogrulama basvurusu basariyla gonderildi!"`, `"Doğrulama başvurusu başarıyla gönderildi!"`],
  [`"Basvuru gonderilemedi. Lutfen tekrar deneyin."`, `"Başvuru gönderilemedi. Lütfen tekrar deneyin."`],
  [`"Secilen Dosyalar"`, `"Seçilen Dosyalar"`],
  [`"Basvuru Zaten Gonderildi"`, `"Başvuru Zaten Gönderildi"`],
  [`"Dogrulama durumunuzu kontrol edin."`, `"Doğrulama durumunuzu kontrol edin."`],
  [`"Durumu Goruntule"`, `"Durumu Görüntüle"`],

  // === CAMPAIGN ===
  [`"Kampanya Olustur"`, `"Kampanya Oluştur"`],
  [`"Kampanyayi Duzenle"`, `"Kampanyayı Düzenle"`],
  [`"Bagisci"`, `"Bağışçı"`],
  [`"Kalan Gun"`, `"Kalan Gün"`],
  [`"Simdi Bagis Yap"`, `"Şimdi Bağış Yap"`],
  [`"Paylas"`, `"Paylaş"`],
  [`"Guncellemeler"`, `"Güncellemeler"`],
  [`"Bu Kampanya Hakkinda"`, `"Bu Kampanya Hakkında"`],
  [`"Ogrenci"`, `"Öğrenci"`],
  [`"Olusturulma"`, `"Oluşturulma"`],
  [`"Bitis Tarihi"`, `"Bitiş Tarihi"`],

  // === DASHBOARD ===
  [`"Tekrar hos geldiniz"`, `"Tekrar hoş geldiniz"`],
  [`"Kampanyalarim"`, `"Kampanyalarım"`],
  [`"Bagislarim"`, `"Bağışlarım"`],
  [`"Dogrulama Durumu"`, `"Doğrulama Durumu"`],
  [`"Ilerleme Raporlari"`, `"İlerleme Raporları"`],
  [`"Desteklediginiz ogrencilerin ilerleme raporlarini goruntuleyun"`, `"Desteklediğiniz öğrencilerin ilerleme raporlarını görüntüleyin"`],

  // === MY DONATIONS PAGE ===
  [`"Tum bagislarinizi takip edin ve etkilerinizi gorun"`, `"Tüm bağışlarınızı takip edin ve etkilerinizi görün"`],
  [`"Bagis Sayisi"`, `"Bağış Sayısı"`],
  [`"Son Bagis"`, `"Son Bağış"`],
  [`"Kampanya veya ogrenci adi ile ara..."`, `"Kampanya veya öğrenci adı ile ara..."`],
  [`"Baslangic Tarihi"`, `"Başlangıç Tarihi"`],
  [`"Tamamlandi"`, `"Tamamlandı"`],
  [`"Henuz bagis yapilmamis"`, `"Henüz bağış yapılmamış"`],
  [`"Kampanyalara goz atarak ogrencilere destek olmaya baslayabilirsiniz."`, `"Kampanyalara göz atarak öğrencilere destek olmaya başlayabilirsiniz."`],
  [`"gosteriliyor"`, `"gösteriliyor"`],
  [`"bagisten"`, `"bağıştan"`],
  [`"CSV Indir"`, `"CSV İndir"`],
  [`"Excel Indir"`, `"Excel İndir"`],
  [`"PDF Indir"`, `"PDF İndir"`],
  [`"Bagis Detayi"`, `"Bağış Detayı"`],
  [`"Bagislarima Don"`, `"Bağışlarıma Dön"`],
  [`"Bagis Tutari"`, `"Bağış Tutarı"`],
  [`"Makbuz Indir"`, `"Makbuz İndir"`],
  [`"Kampanya Ilerlemesi"`, `"Kampanya İlerlemesi"`],
  [`"tamamlandi"`, `"tamamlandı"`],
  [`"Ogrenci Guncellemeleri"`, `"Öğrenci Güncellemeleri"`],
  [`"Bagis Kullanim Dagilimi"`, `"Bağış Kullanım Dağılımı"`],
  [`"Ogrenci henuz harcama raporu paylasmadi"`, `"Öğrenci henüz harcama raporu paylaşmadı"`],
  [`"Bagis kullanim dagilimi, ogrenci harcama raporlarini paylastiktan sonra burada goruntulenecektir."`, `"Bağış kullanım dağılımı, öğrenci harcama raporlarını paylaştıktan sonra burada görüntülenecektir."`],
  [`"Kampanya Hikayesi"`, `"Kampanya Hikayesi"`],
  [`"Devamini Oku"`, `"Devamını Oku"`],
  [`"Bagis Detaylari"`, `"Bağış Detayları"`],
  [`"Bagis ID"`, `"Bağış ID"`],
  [`"Hizli Islemler"`, `"Hızlı İşlemler"`],
  [`"Makbuz Indir (PDF)"`, `"Makbuz İndir (PDF)"`],
  [`"Kampanya Sayfasina Git"`, `"Kampanya Sayfasına Git"`],
  [`"Ogrenciye Mesaj Gonder"`, `"Öğrenciye Mesaj Gönder"`],
  [`"Ogrenci Bilgileri"`, `"Öğrenci Bilgileri"`],
  [`"Henuz guncelleme yok"`, `"Henüz güncelleme yok"`],
  [`"Ogrenci ilerleme guncellemesi paylastiginda burada goruntulenecektir."`, `"Öğrenci ilerleme güncellemesi paylaştığında burada görüntülenecektir."`],
  [`"Henuz mesaj yok. Ogrenciye destek notu birakabilirsiniz."`, `"Henüz mesaj yok. Öğrenciye destek notu bırakabilirsiniz."`],
  [`"Mesajiniz basariyla gonderildi!"`, `"Mesajınız başarıyla gönderildi!"`],
  [`"Ogrenciye destek notu veya takdir mesaji yazin..."`, `"Öğrenciye destek notu veya takdir mesajı yazın..."`],
  [`"Mesajlariniz sadece desteklediginiz ogrenciye gonderilir. Max 1000 karakter."`, `"Mesajlarınız sadece desteklediğiniz öğrenciye gönderilir. Max 1000 karakter."`],
  [`"BAGIS MAKBUZU"`, `"BAĞIŞ MAKBUZU"`],
  [`"Bu belge FundEd platformu tarafindan otomatik olarak olusturulmustur."`, `"Bu belge FundEd platformu tarafından otomatik olarak oluşturulmuştur."`],
  [`"Vergi indirimi icin resmi makbuz olarak kullanilabilir."`, `"Vergi indirimi için resmi makbuz olarak kullanılabilir."`],
  [`"Videoyu Izle"`, `"Videoyu İzle"`],
  [`"Belgeyi Indir"`, `"Belgeyi İndir"`],

  // === APPLICATION STATUS ===
  [`"Basvuru Durumu"`, `"Başvuru Durumu"`],
  [`"Basvuru No"`, `"Başvuru No"`],
  [`"Basvuru Detaylari"`, `"Başvuru Detayları"`],
  [`"Egitim Seviyesi"`, `"Eğitim Seviyesi"`],
  [`"Ihtiyac Ozeti"`, `"İhtiyaç Özeti"`],
  [`"Gonderildi"`, `"Gönderildi"`],
  [`"Basvuru Bulunamadi"`, `"Başvuru Bulunamadı"`],
  [`"Girdiginiz basvuru numarasi gecersiz veya bulunamadi."`, `"Girdiğiniz başvuru numarası geçersiz veya bulunamadı."`],
  [`"Simdi Basvur"`, `"Şimdi Başvur"`],
  [`"Alindi"`, `"Alındı"`],

  // === ADMIN ===
  [`"Kullanicilar"`, `"Kullanıcılar"`],
  [`"Inceleme Bekleyenler"`, `"İnceleme Bekleyenler"`],
  [`"Sira"`, `"Sıra"`],
  [`"Bilgi Iste"`, `"Bilgi İste"`],
  [`"Askiya Al"`, `"Askıya Al"`],
  [`"Incele"`, `"İncele"`],
  [`"Iptal Et"`, `"İptal Et"`],

  // === FOOTER ===
  [`"Kullanim Sartlari"`, `"Kullanım Şartları"`],
  [`"Gizlilik Politikasi"`, `"Gizlilik Politikası"`],
  [`"Iletisim"`, `"İletişim"`],
  [`"© 2026 FundEd. Tum haklari saklidir."`, `"© 2026 FundEd. Tüm hakları saklıdır."`],

  // === APPLY ===
  [`"Egitim destegi basvurunuzu asagidaki formu doldurarak yapabilirsiniz."`, `"Eğitim desteği başvurunuzu aşağıdaki formu doldurarak yapabilirsiniz."`],
  [`"Sinif"`, `"Sınıf"`],
  [`"Fakulte"`, `"Fakülte"`],
  [`"Kampanya Aciklamasi (min. {min} karakter)"`, `"Kampanya Açıklaması (min. {min} karakter)"`],
  [`"Adiniz ve soyadiniz"`, `"Adınız ve soyadınız"`],
  [`"Turkiye"`, `"Türkiye"`],
  [`"Muhendislik Fakultesi"`, `"Mühendislik Fakültesi"`],
  [`"Bilgisayar Muhendisligi"`, `"Bilgisayar Mühendisliği"`],
  [`"Egitim hedefinizi, neden destege ihtiyac duydugunuzu ve fonlari nasil kullanacaginizi detayli olarak anlatin..."`, `"Eğitim hedefinizi, neden desteğe ihtiyaç duyduğunuzu ve fonları nasıl kullanacağınızı detaylı olarak anlatın..."`],
  [`"Belge adi (opsiyonel)"`, `"Belge adı (opsiyonel)"`],
  [`"Seciniz"`, `"Seçiniz"`],
  [`"Gecersiz isim"`, `"Geçersiz isim"`],
  [`"Gecersiz email"`, `"Geçersiz email"`],
  [`"Ulke gerekli"`, `"Ülke gerekli"`],
  [`"Egitim seviyesi gerekli"`, `"Eğitim seviyesi gerekli"`],
  [`"Hedef miktar en az 1 USD olmali"`, `"Hedef miktar en az 1 USD olmalı"`],
  [`"Sinif secimi gerekli"`, `"Sınıf seçimi gerekli"`],
  [`"Fakulte gerekli"`, `"Fakülte gerekli"`],
  [`"Bolum gerekli"`, `"Bölüm gerekli"`],
  [`"Aciklama gerekli"`, `"Açıklama gerekli"`],
  [`"En az {min} karakter gerekli ({remaining} karakter daha yazin)"`, `"En az {min} karakter gerekli ({remaining} karakter daha yazın)"`],
  [`"Gecersiz dosya turu. PDF, JPG veya PNG yukleyin."`, `"Geçersiz dosya türü. PDF, JPG veya PNG yükleyin."`],
  [`"Dosya boyutu 10MB sinirini asiyor."`, `"Dosya boyutu 10MB sınırını aşıyor."`],
  [`"Lutfen tum alanlari dogru doldurun"`, `"Lütfen tüm alanları doğru doldurun"`],
  [`"Dosyalarin yuklenmesini bekleyin."`, `"Dosyaların yüklenmesini bekleyin."`],
  [`"Basarisiz yuklemeleri kaldirin veya tekrar deneyin."`, `"Başarısız yüklemeleri kaldırın veya tekrar deneyin."`],
  [`"Basvurunuz basariyla gonderildi!"`, `"Başvurunuz başarıyla gönderildi!"`],
  [`"Bir hata olustu"`, `"Bir hata oluştu"`],
  [`"Ogrenci belgesi, transkript vb. yukleyebilirsiniz (PDF, JPG, PNG - max 10MB)"`, `"Öğrenci belgesi, transkript vb. yükleyebilirsiniz (PDF, JPG, PNG - max 10MB)"`],
  [`"Yuklendi"`, `"Yüklendi"`],
  [`"Basarisiz"`, `"Başarısız"`],
  [`"Hazir"`, `"Hazır"`],
  [`"Basvuruyu Gonder"`, `"Başvuruyu Gönder"`],
  [`"Gonderiliyor..."`, `"Gönderiliyor..."`],
  [`"1. Sinif"`, `"1. Sınıf"`],
  [`"2. Sinif"`, `"2. Sınıf"`],
  [`"3. Sinif"`, `"3. Sınıf"`],
  [`"4. Sinif"`, `"4. Sınıf"`],
  [`"5. Sinif"`, `"5. Sınıf"`],
  [`"6. Sinif"`, `"6. Sınıf"`],
  [`"Hazirlik"`, `"Hazırlık"`],
  [`"Fotograflar (Opsiyonel)"`, `"Fotoğraflar (Opsiyonel)"`],
  [`"Kendinizi veya ihtiyac duydugunuz esyalarin fotograflarini yukleyebilirsiniz"`, `"Kendinizi veya ihtiyaç duyduğunuz eşyaların fotoğraflarını yükleyebilirsiniz"`],
  [`"Fotograf Ekle"`, `"Fotoğraf Ekle"`],
  [`"Kaldir"`, `"Kaldır"`],

  // === CORPORATE ===
  [`"Kurumsal bagis panelinize hos geldiniz"`, `"Kurumsal bağış panelinize hoş geldiniz"`],
  [`"Ortalama Bagis"`, `"Ortalama Bağış"`],
  [`"Bagis Egilimi"`, `"Bağış Eğilimi"`],
  [`"Fakulte Dagilimi"`, `"Fakülte Dağılımı"`],
  [`"Son Desteklenen Ogrenciler"`, `"Son Desteklenen Öğrenciler"`],
  [`"Tumunu Gor"`, `"Tümünü Gör"`],
  [`"gecen aya gore"`, `"geçen aya göre"`],
  [`"ogrenci"`, `"öğrenci"`],

  // corporate.reports
  [`"Bagis raporlarinizi goruntuley`, `"Bağış raporlarınızı görüntüley`],
  [`"Rapor Indir"`, `"Rapor İndir"`],
  [`"Tum Ulkeler"`, `"Tüm Ülkeler"`],
  [`"Tum Fakulteler"`, `"Tüm Fakülteler"`],
  [`"Tum Durumlar"`, `"Tüm Durumlar"`],
  [`"Otomatik Aylik Rapor"`, `"Otomatik Aylık Rapor"`],
  [`"Her ayin 1inde e-posta ile rapor alin"`, `"Her ayın 1'inde e-posta ile rapor alın"`],
  [`"Etkinlestir"`, `"Etkinleştir"`],
  [`"Ayrildi"`, `"Ayrıldı"`],
  [`"Demo modunda hazirlanacak"`, `"Demo modunda hazırlanacak"`],

  // corporate.settings
  [`"Hesap ve tercihlerinizi yonetin"`, `"Hesap ve tercihlerinizi yönetin"`],
  [`"Sirket Bilgileri"`, `"Şirket Bilgileri"`],
  [`"Sirket Adi"`, `"Şirket Adı"`],
  [`"Tum ozellikler aktif"`, `"Tüm özellikler aktif"`],
  [`"Takim Uyeleri"`, `"Takım Üyeleri"`],
  [`"Uye Davet Et"`, `"Üye Davet Et"`],
  [`"Odeme Yetkilisi"`, `"Ödeme Yetkilisi"`],
  [`"Duzenleyici"`, `"Düzenleyici"`],
  [`"Izleyici"`, `"İzleyici"`],
  [`"Sifre Degistir"`, `"Şifre Değiştir"`],
  [`"Son degistirilme: 30 gun once"`, `"Son değiştirilme: 30 gün önce"`],
  [`"Degistir"`, `"Değiştir"`],
  [`"Iki Faktorlu Dogrulama (2FA)"`, `"İki Faktörlü Doğrulama (2FA)"`],
  [`"Ekstra guvenlik katmani"`, `"Ekstra güvenlik katmanı"`],
  [`"Ogrenci ilerlemesi hakkinda bildirimler"`, `"Öğrenci ilerlemesi hakkında bildirimler"`],
  [`"Tesekkur Mesajlari"`, `"Teşekkür Mesajları"`],
  [`"Ogrencilerden gelen tesekkurler"`, `"Öğrencilerden gelen teşekkürler"`],
  [`"Yeni kampanya onerileri"`, `"Yeni kampanya önerileri"`],
  [`"Aylik Ozet Raporu"`, `"Aylık Özet Raporu"`],
  [`"Her ayin sonunda e-posta ile ozet"`, `"Her ayın sonunda e-posta ile özet"`],
  [`"Degisiklikleri Kaydet"`, `"Değişiklikleri Kaydet"`],
  [`"Dosya boyutu 2MB'dan kucuk olmalidir"`, `"Dosya boyutu 2MB'dan küçük olmalıdır"`],
  [`"Lutfen bir e-posta adresi girin"`, `"Lütfen bir e-posta adresi girin"`],
  [`"adresine davet gonderildi"`, `"adresine davet gönderildi"`],
  [`"Lutfen tum alanlari doldurun"`, `"Lütfen tüm alanları doldurun"`],
  [`"Yeni sifreler uyusmuyor"`, `"Yeni şifreler uyuşmuyor"`],
  [`"Sifre en az 8 karakter olmalidir"`, `"Şifre en az 8 karakter olmalıdır"`],
  [`"Sifreniz basariyla degistirildi!"`, `"Şifreniz başarıyla değiştirildi!"`],
  [`"Iki faktorlu dogrulama basariyla etkinlestirildi!"`, `"İki faktörlü doğrulama başarıyla etkinleştirildi!"`],
  [`"E-posta ile yeni bir takim uyesi davet edin."`, `"E-posta ile yeni bir takım üyesi davet edin."`],
  [`"Izleyici - Sadece goruntuleyebilir"`, `"İzleyici - Sadece görüntüleyebilir"`],
  [`"Duzenleyici - Duzenleme yapabilir"`, `"Düzenleyici - Düzenleme yapabilir"`],
  [`"Odeme Yetkilisi - Tam yetki"`, `"Ödeme Yetkilisi - Tam yetki"`],
  [`"Davet Gonder"`, `"Davet Gönder"`],
  [`"Mevcut Sifre"`, `"Mevcut Şifre"`],
  [`"Yeni Sifre"`, `"Yeni Şifre"`],
  [`"Yeni Sifre (Tekrar)"`, `"Yeni Şifre (Tekrar)"`],
  [`"Sifreyi Degistir"`, `"Şifreyi Değiştir"`],
  [`"Google Authenticator veya benzeri bir uygulama ile taratin"`, `"Google Authenticator veya benzeri bir uygulama ile taratın"`],
  [`"Manuel Giris Icin Gizli Anahtar"`, `"Manuel Giriş İçin Gizli Anahtar"`],

  // corporate.notifications
  [`"okunmamis bildirim"`, `"okunmamış bildirim"`],
  [`"Tesekkurler"`, `"Teşekkürler"`],
  [`"Basarilar"`, `"Başarılar"`],
  [`"secili"`, `"seçili"`],
  [`"Arsivle"`, `"Arşivle"`],
  [`"Tumunu Okundu Yap"`, `"Tümünü Okundu Yap"`],
  [`"Az once"`, `"Az önce"`],
  [`"saat once"`, `"saat önce"`],
  [`"gun once"`, `"gün önce"`],
  [`"Ogrenci Detayi"`, `"Öğrenci Detayı"`],
  [`"Bu kategoride bildirim bulunmuyor."`, `"Bu kategoride bildirim bulunmuyor."`],
  [`"Ogrenci guncellemeleri"`, `"Öğrenci güncellemeleri"`],
  [`"Tesekkur mesajlari"`, `"Teşekkür mesajları"`],
  [`"Haftalik ozet"`, `"Haftalık özet"`],

  // corporate.esg
  [`"Cevre, sosyal ve yonetisim etkinizi olcun"`, `"Çevre, sosyal ve yönetişim etkinizi ölçün"`],
  [`"Cevresel"`, `"Çevresel"`],
  [`"Yonetisim"`, `"Yönetişim"`],
  [`"Genel ESG Puani"`, `"Genel ESG Puanı"`],
  [`"Bagis faaliyetlerinize dayali"`, `"Bağış faaliyetlerinize dayalı"`],
  [`"Sektorde ilk %10"`, `"Sektörde ilk %10"`],
  [`"Gecen yila gore +%12"`, `"Geçen yıla göre +%12"`],
  [`"Kuresel etki"`, `"Küresel etki"`],
  [`"Sosyal katki"`, `"Sosyal katkı"`],
  [`"SKA Katkisi"`, `"SKA Katkısı"`],
  [`"Ulasilan Ulke"`, `"Ulaşılan Ülke"`],
  [`"Degisen Hayat"`, `"Değişen Hayat"`],

  // corporate.login
  [`"Kurumsal bagisci panelinize giris yapin"`, `"Kurumsal bağışçı panelinize giriş yapın"`],
  [`"Sifremi unuttum"`, `"Şifremi unuttum"`],
  [`"Kurumsal hesabiniz yok mu?"`, `"Kurumsal hesabınız yok mu?"`],
  [`"Iletisime gecin"`, `"İletişime geçin"`],
  [`"Kurumsal panel giris icin kullanici adi ve sifreniz mailinize aktarilacaktir. Yalnizca kurumsal musterilerimiz icindir."`, `"Kurumsal panel giriş için kullanıcı adı ve şifreniz mailinize aktarılacaktır. Yalnızca kurumsal müşterilerimiz içindir."`],
  [`"Gecersiz e-posta veya sifre"`, `"Geçersiz e-posta veya şifre"`],
  [`"Demo Giris Bilgileri"`, `"Demo Giriş Bilgileri"`],

  // corporate.students
  [`"Desteklediginiz ogrencileri takip edin"`, `"Desteklediğiniz öğrencileri takip edin"`],
  [`"Ogrenci, universite veya bolum ara..."`, `"Öğrenci, üniversite veya bölüm ara..."`],
  [`"Ilerleme"`, `"İlerleme"`],
  [`"Ogrenci Bulunamadi"`, `"Öğrenci Bulunamadı"`],
  [`"Arama kriterlerinize uygun ogrenci bulunamadi."`, `"Arama kriterlerinize uygun öğrenci bulunamadı."`],

  // corporate.studentDetail
  [`"Bagis Ilerlemesi"`, `"Bağış İlerlemesi"`],
  [`"Mesaj Gonder"`, `"Mesaj Gönder"`],
  [`"Ogrenciye bir mesaj yazin..."`, `"Öğrenciye bir mesaj yazın..."`],
  [`"Bagis Gecmisi"`, `"Bağış Geçmişi"`],
  [`"Ogrenci Guncellemeleri"`, `"Öğrenci Güncellemeleri"`],

  // corporate.campaigns
  [`"Kampanyalar ve Bagis"`, `"Kampanyalar ve Bağış"`],
  [`"Kampanyalara goz atin ve toplu bagis yapin"`, `"Kampanyalara göz atın ve toplu bağış yapın"`],
  [`"Otomatik Bagis"`, `"Otomatik Bağış"`],
  [`"Otomatik Bagis Sistemi"`, `"Otomatik Bağış Sistemi"`],
  [`"Butce belirleyin, sistem en cok ihtiyaci olan ogrencilere otomatik dagitsin."`, `"Bütçe belirleyin, sistem en çok ihtiyacı olan öğrencilere otomatik dağıtsın."`],
  [`"Butce (USD)"`, `"Bütçe (USD)"`],
  [`"Dagit"`, `"Dağıt"`],
  [`"Bagis Sepeti"`, `"Bağış Sepeti"`],
  [`"Odeme Yap"`, `"Ödeme Yap"`],
  [`"Bireysel Ogrenciler"`, `"Bireysel Öğrenciler"`],

  // === MENTOR APPLICATION ===
  [`"Mentor Basvurusu"`, `"Mentor Başvurusu"`],
  [`"Mentor programimiza katilin ve ogrencilere rehberlik edin"`, `"Mentor programımıza katılın ve öğrencilere rehberlik edin"`],
  [`"Mentor Turu"`, `"Mentor Türü"`],
  [`"Sirketinizi temsilen mentor olun"`, `"Şirketinizi temsilen mentor olun"`],
  [`"Bireysel olarak mentor olarak katilin"`, `"Bireysel olarak mentor olarak katılın"`],
  [`"Mentorlige neden uygunsunuz? (en az 100 karakter)"`, `"Mentorlüğe neden uygunsunuz? (en az 100 karakter)"`],
  [`"Deneyimlerinizi, uzmanlik alanlarinizi ve ogrencilere neden mentor olmak istediginizi anlatiniz..."`, `"Deneyimlerinizi, uzmanlık alanlarınızı ve öğrencilere neden mentor olmak istediğinizi anlatınız..."`],
  [`"Basvurunuz onay icin gonderildi. Onay durumu e-posta ile bildirilecektir."`, `"Başvurunuz onay için gönderildi. Onay durumu e-posta ile bildirilecektir."`],
  [`"Bir hata olustu. Lutfen tekrar deneyin."`, `"Bir hata oluştu. Lütfen tekrar deneyin."`],
  [`"Adiniz"`, `"Adınız"`],
  [`"Soyadiniz"`, `"Soyadınız"`],
  [`"Ulke secin"`, `"Ülke seçin"`],
  [`"Guncel Is Pozisyonu"`, `"Güncel İş Pozisyonu"`],
  [`"Orn: Yazilim Muhendisi"`, `"Örn: Yazılım Mühendisi"`],
  [`"Deneyim Yili"`, `"Deneyim Yılı"`],
  [`"Deneyim secin"`, `"Deneyim seçin"`],
  [`"yil"`, `"yıl"`],

  // === MISC remaining values ===
  [`"Makbuz No"`, `"Makbuz No"`],
  [`"Genel Bilgiler"`, `"Genel Bilgiler"`],
  [`"Islem"`, `"İşlem"`],
  [`"Hedef Mezuniyet"`, `"Hedef Mezuniyet"`],
  [`"Toplanan"`, `"Toplanan"`],

  // Remaining missed values - nav.menu duplicates
  [`"Mentor Ol"`, `"Mentor Ol"`],
  
  // home.cta
  [`"Fark Yaratmaya Hazir misiniz?"`, `"Fark Yaratmaya Hazır mısınız?"`],

  // verification.form - remaining
  [`"Belge Ekle"`, `"Belge Ekle"`],

  // Edge case: "Sifre" standalone
  [`"Sifre"`, `"Şifre"`],

  // corporate.reports remaining
  [`"kayit"`, `"kayıt"`],
  [`"Aktif"`, `"Aktif"`],
  
  // Missed items from corporate.reports
  [`"Devam"`, `"Devam"`],
];

let changed = 0;
for (const [oldStr, newStr] of replacements) {
  if (oldStr === newStr) continue; // skip no-ops
  const idx = content.indexOf(oldStr);
  if (idx !== -1) {
    // Replace ALL occurrences
    while (content.includes(oldStr)) {
      content = content.replace(oldStr, newStr);
      changed++;
    }
  }
}

// Now do a second pass to catch any remaining ASCII-only Turkish words
// that may have been missed. These are contextual word replacements
// applied only within JSON string values (between quotes).
const wordReplacements = [
  // These are applied as global text replacements but are specific enough
  // to not cause false positives
  
  // Common words that still appear without Turkish chars
  // NOTE: We search for patterns within quoted strings only
];

// Write the corrected file
fs.writeFileSync(filePath, content, 'utf-8');
console.log(`Fixed ${changed} occurrences in tr.json`);

// Verify the JSON is still valid
try {
  JSON.parse(content);
  console.log('JSON validation: PASSED');
} catch (e) {
  console.error('JSON validation: FAILED -', e.message);
}

// Report any remaining ASCII-only Turkish words that might have been missed
const data = JSON.parse(content);
const suspiciousPatterns = [
  /\bOgrenci\b/,
  /\bogrenci\b/,
  /\bBagis\b/,
  /\bbagis\b/,
  /\bDogrula/,
  /\bdogrula/,
  /\bGiris\b/,
  /\bgiris\b/,
  /\bCikis\b/,
  /\bYukle/,
  /\byukle/,
  /\bGonder\b/,
  /\bgonder\b/,
  /\bDuzenle/,
  /\bGoruntule/,
  /\bIlerleme\b/,
  /\bInceleme\b/,
  /\bBasvur/,
  /\bbasvur/,
  /\bSifre\b/,
  /\bsifre\b/,
  /\bIptal\b/,
  /\bTurkce\b/,
  /\bTurkiye\b/,
  /\bUlke\b/,
  /\bulke\b/,
  /\bUniversite\b/,
  /\buniversite\b/,
  /\bFakulte\b/,
  /\bfakulte\b/,
  /\bBolum\b/,
  /\bbolum\b/,
  /\bOlustur/,
  /\bKesfet\b/,
];

function checkValue(val, path) {
  if (typeof val === 'string') {
    for (const pat of suspiciousPatterns) {
      if (pat.test(val)) {
        console.log(`  SUSPICIOUS [${path}]: "${val.substring(0, 80)}..."`);
        break;
      }
    }
  } else if (typeof val === 'object' && val !== null) {
    for (const [k, v] of Object.entries(val)) {
      checkValue(v, path ? `${path}.${k}` : k);
    }
  }
}

console.log('\nChecking for remaining ASCII-only Turkish words:');
checkValue(data, '');
console.log('Done.');
