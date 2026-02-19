import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | FundEd',
  description: 'FundEd KVKK uyumlu gizlilik politikası ve kişisel verilerin korunması hakkında bilgilendirme.',
};

export default function PrivacyPolicyPage() {
  const today = new Date().toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="prose prose-blue max-w-none">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Gizlilik Politikası</h1>
      <p className="text-sm text-gray-500 mb-8">Son güncelleme: {today}</p>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">1. Veri Sorumlusu</h2>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri
          sorumlusu sıfatıyla hareket eden <strong>FundEd Eğitim Teknolojileri</strong>
          olarak kişisel verilerinizin güvenliğine azami özen göstermekteyiz.
        </p>
        <ul>
          <li>
            <strong>İletişim:</strong>{' '}
            <a href="mailto:support@fund-ed.com" className="text-blue-600 hover:underline">
              support@fund-ed.com
            </a>
          </li>
          <li>
            <strong>Başvuru yöntemi:</strong> Yukarıdaki e-posta adresi üzerinden veya
            platformdaki &quot;Hesap Ayarları&quot; bölümünden.
          </li>
        </ul>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">2. İşlenen Kişisel Veriler</h2>
        <p>
          Platform üzerinden aşağıdaki kategorilerde kişisel veri işlenmektedir:
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="text-left px-4 py-2 font-semibold text-blue-900">Veri Kategorisi</th>
                <th className="text-left px-4 py-2 font-semibold text-blue-900">Örnekler</th>
                <th className="text-left px-4 py-2 font-semibold text-blue-900">İşleme Amacı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 font-medium">Kimlik Bilgileri</td>
                <td className="px-4 py-2">Ad, soyad</td>
                <td className="px-4 py-2">Hesap oluşturma, kimlik doğrulama</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">İletişim Bilgileri</td>
                <td className="px-4 py-2">E-posta adresi</td>
                <td className="px-4 py-2">Bilgilendirme, işlem onayı</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Eğitim Belgeleri</td>
                <td className="px-4 py-2">Öğrenci belgesi, transkript</td>
                <td className="px-4 py-2">Öğrenci doğrulama süreci</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Finansal Bilgiler</td>
                <td className="px-4 py-2">Ödeme kartı bilgileri (Stripe aracılığıyla)</td>
                <td className="px-4 py-2">Bağış işlemlerinin gerçekleştirilmesi</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Kullanım Verileri</td>
                <td className="px-4 py-2">IP adresi, tarayıcı bilgisi, çerezler</td>
                <td className="px-4 py-2">Platform güvenliği, analitik</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">3. Hukuki Sebepler</h2>
        <p>Kişisel verileriniz KVKK m.5/2 kapsamında aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
        <ul>
          <li>Sözleşmenin kurulması veya ifası için gerekli olması</li>
          <li>Hukuki yükümlülüğün yerine getirilmesi</li>
          <li>İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla meşru menfaat</li>
          <li>Açık rıza (yalnızca yukarıdaki sebepler kapsamına girmeyen hallerde)</li>
        </ul>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">4. Saklama Süreleri</h2>
        <p>
          Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta
          öngörülen zamanaşımı süreleriyle uyumlu olarak saklanır:
        </p>
        <ul>
          <li>
            <strong>Hesap ve kimlik bilgileri:</strong> Hesap aktif olduğu sürece + hesap
            kapatmadan itibaren <strong>5 yıl</strong>
          </li>
          <li>
            <strong>Finansal işlem kayıtları:</strong> İlgili mevzuat gereği{' '}
            <strong>10 yıl</strong>
          </li>
          <li>
            <strong>Öğrenci belgeleri:</strong> Kampanya kapanışından itibaren{' '}
            <strong>5 yıl</strong>
          </li>
          <li>
            <strong>Çerez verileri:</strong> En fazla <strong>13 ay</strong> (CNIL/KVKK uyumlu)
          </li>
        </ul>
        <p>
          Saklama süresi dolan veriler, periyodik imha süreçleri kapsamında silinir, yok
          edilir veya anonim hâle getirilir.
        </p>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">5. Kullanıcı Hakları (KVKK m.11)</h2>
        <p>KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
        <ol>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri öğrenme</li>
          <li>Eksik veya yanlış işlenmiş verilerin <strong>düzeltilmesini</strong> isteme</li>
          <li>
            KVKK m.7 kapsamında kişisel verilerin <strong>silinmesini</strong> veya yok edilmesini isteme
          </li>
          <li>Düzeltme/silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
          <li>
            Münhasıran otomatik sistemler vasıtasıyla analiz edilmesi sonucu aleyhinize bir
            sonucun ortaya çıkmasına itiraz etme
          </li>
          <li>
            Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde <strong>zararın giderilmesini</strong> talep etme
          </li>
        </ol>
        <p className="mt-4">
          Başvurularınızı{' '}
          <a href="mailto:support@fund-ed.com" className="text-blue-600 hover:underline">
            support@fund-ed.com
          </a>{' '}
          adresine göndererek kullanabilirsiniz. Talebiniz en geç <strong>30 gün</strong> içinde
          sonuçlandırılacaktır.
        </p>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">6. Veri Aktarımı</h2>
        <p>
          Kişisel verileriniz, hizmet kalitesini sağlamak amacıyla aşağıdaki taraflara
          aktarılabilir:
        </p>
        <ul>
          <li>
            <strong>Stripe Inc.</strong> — Ödeme işlemleri (ABD merkezli; KVKK m.9 kapsamında
            yeterli önlemler alınmıştır)
          </li>
          <li>
            <strong>Hosting sağlayıcıları</strong> — Vercel / bulut altyapısı (şifreli iletişim,
            veri işleme sözleşmesi mevcuttur)
          </li>
          <li>
            <strong>Yasal merciler</strong> — Kanuni zorunluluk hâlinde yetkili kamu kurum ve
            kuruluşları
          </li>
        </ul>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">7. Çerez Politikası</h2>
        <p>Platformumuz aşağıdaki çerez türlerini kullanmaktadır:</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="text-left px-4 py-2 font-semibold text-blue-900">Çerez Türü</th>
                <th className="text-left px-4 py-2 font-semibold text-blue-900">Amaç</th>
                <th className="text-left px-4 py-2 font-semibold text-blue-900">Süre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 font-medium">Zorunlu Çerezler</td>
                <td className="px-4 py-2">Oturum yönetimi, güvenlik</td>
                <td className="px-4 py-2">Oturum süresince</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">İşlevsel Çerezler</td>
                <td className="px-4 py-2">Dil tercihi, tema ayarları</td>
                <td className="px-4 py-2">1 yıl</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Analitik Çerezler</td>
                <td className="px-4 py-2">Anonim kullanım istatistikleri</td>
                <td className="px-4 py-2">13 ay</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4">
          Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda
          platformun bazı işlevleri kısıtlanabilir.
        </p>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">8. Güvenlik Önlemleri</h2>
        <p>
          Kişisel verilerinizin güvenliğini sağlamak amacıyla aşağıdaki teknik ve idari
          tedbirler alınmaktadır:
        </p>
        <ul>
          <li>SSL/TLS ile şifreli veri iletimi</li>
          <li>Ödeme bilgilerinin Stripe PCI-DSS sertifikalı altyapısında işlenmesi</li>
          <li>Erişim kontrolleri ve yetkilendirme mekanizmaları</li>
          <li>Düzenli güvenlik denetimleri ve log izleme</li>
          <li>Veri minimizasyonu ilkesi</li>
        </ul>
      </section>

      {/* -------------------------------------------------- */}
      <section>
        <h2 className="text-xl font-semibold text-blue-800">9. Politika Değişiklikleri</h2>
        <p>
          Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler
          yapıldığında kayıtlı e-posta adresinize bildirim gönderilecektir. Güncel metin her
          zaman bu sayfada yayımlanır.
        </p>
      </section>
    </article>
  );
}
