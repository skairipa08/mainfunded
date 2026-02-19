import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | FundEd',
  description: 'FundEd platform kullanım koşulları, komisyon oranları ve sorumluluk bildirimi.',
};

export default function TermsOfServicePage() {
  const today = new Date().toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="prose prose-blue max-w-none">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Kullanım Koşulları</h1>
      <p className="text-sm text-gray-500 mb-8">Son güncelleme: {today}</p>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">1. Genel Hükümler</h2>
        <p>
          Bu Kullanım Koşulları, <strong>FundEd Eğitim Teknolojileri</strong> tarafından
          işletilen fund-ed.com platformuna (&quot;Platform&quot;) erişiminizi ve
          kullanımınızı düzenler. Platforma erişerek veya hesap oluşturarak bu koşulları
          kabul etmiş sayılırsınız.
        </p>
        <p>
          Koşulları kabul etmiyorsanız Platformu kullanmamanızı rica ederiz.
        </p>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">2. Platform Tanımı</h2>
        <p>
          FundEd, doğrulanmış öğrenciler ile bağışçıları bir araya getiren bir kitle
          fonlama platformudur. Platform, bağışçı ile öğrenci arasında aracılık hizmeti
          sunar; taraflar arasındaki fonlama ilişkisinin doğrudan tarafı değildir.
        </p>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">3. Platform Komisyonu</h2>
        <p>
          Platform sürdürülebilirliğini sağlamak amacıyla toplanan bağışlar üzerinden
          aşağıdaki kesintiler uygulanır:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="text-left px-4 py-2 font-semibold text-blue-900">Kalem</th>
                <th className="text-left px-4 py-2 font-semibold text-blue-900">Oran</th>
                <th className="text-left px-4 py-2 font-semibold text-blue-900">Açıklama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 font-medium">Platform Komisyonu</td>
                <td className="px-4 py-2">%2</td>
                <td className="px-4 py-2">Platform geliştirme, destek ve operasyon giderleri</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Ödeme İşlem Bedeli</td>
                <td className="px-4 py-2">%3,2</td>
                <td className="px-4 py-2">
                  Stripe ödeme altyapısı tarafından tahsil edilen işlem ücreti
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4">
          Bağışçılar, &quot;Ücretleri ben karşılayayım&quot; seçeneğini işaretleyerek bu
          bedellerin kendi hesaplarından tahsil edilmesini tercih edebilir. Bu durumda
          öğrenciye tam tutar ulaşır.
        </p>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">4. Ödeme ve Transfer Süreci</h2>
        <ul>
          <li>
            Bağışlar, Stripe güvenli ödeme altyapısı aracılığıyla işlenir.
          </li>
          <li>
            Başarılı bir bağış sonrası fonlar, kampanya sahibinin hesabına{' '}
            <strong>7 ila 14 iş günü</strong> içinde aktarılır.
          </li>
          <li>
            Transfer süreleri, bankalar arası işlem süreleri ve doğrulama prosedürlerine bağlı
            olarak değişiklik gösterebilir.
          </li>
          <li>
            Platform, mücbir sebep hâllerinde transfer süresinin uzamasından sorumlu
            tutulamaz.
          </li>
        </ul>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">5. Öğrenci Yükümlülükleri</h2>
        <ul>
          <li>Profil bilgilerinin doğru ve güncel tutulması</li>
          <li>Geçerli ve meşru öğrenci belgelerinin sunulması</li>
          <li>Toplanan fonların yalnızca beyan edilen eğitim amaçlı kullanılması</li>
          <li>Kampanya bilgilerinin gerçeği yansıtması</li>
          <li>Platform kurallarına ve Türkiye Cumhuriyeti mevzuatına uyum</li>
        </ul>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">6. Bağışçı Yükümlülükleri</h2>
        <ul>
          <li>Bağışlar gönüllülük esasına dayalı olup, yasal zorunluluk dışında iade edilmez.</li>
          <li>
            Bağışçılar, Platformun bir aracı olduğunu ve fonların kullanımını garanti
            etmediğini kabul eder.
          </li>
          <li>
            Bağışlardan doğabilecek vergisel yükümlülükler bağışçıya aittir.
          </li>
        </ul>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">7. Yasaklı Faaliyetler</h2>
        <p>Aşağıdaki eylemler kesinlikle yasaktır ve hesap askıya alınmasıyla sonuçlanır:</p>
        <ul>
          <li>
            <strong>Sahte belge sunma:</strong> Gerçeğe aykırı öğrenci belgesi, kimlik veya
            transkript yüklenmesi
          </li>
          <li>
            <strong>Dolandırıcılık:</strong> Yanıltıcı kampanya bilgisi ile bağış toplanması
          </li>
          <li>
            <strong>Fonların kötüye kullanımı:</strong> Toplanan bağışların beyan edilen amaç
            dışında harcanması
          </li>
          <li>
            <strong>Kimlik hırsızlığı:</strong> Başka bir kişinin bilgilerini kullanarak hesap
            açılması
          </li>
          <li>
            <strong>Platform manipülasyonu:</strong> Otomatik araçlarla sahte bağış veya
            etkileşim oluşturulması
          </li>
          <li>
            <strong>Kara para aklama:</strong> Platformun yasadışı fonların meşrulaştırılması
            amacıyla kullanılması
          </li>
        </ul>
        <p className="mt-4">
          Yasaklı faaliyetlerin tespiti hâlinde Platform, ilgili hesabı derhal askıya alma,
          fonları dondurma ve gerekli hukuki mercilere bildirimde bulunma hakkını saklı
          tutar.
        </p>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">8. Fikri Mülkiyet</h2>
        <p>
          Platform üzerindeki tüm içerik, tasarım, logo, yazılım ve diğer materyaller
          FundEd&apos;in fikri mülkiyetindedir. Yazılı izin olmaksızın kopyalanamaz,
          çoğaltılamaz veya dağıtılamaz.
        </p>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">9. Sorumluluk Reddi</h2>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-amber-900 mb-3">
            <strong>Önemli Bilgilendirme:</strong>
          </p>
          <ul className="text-amber-800 space-y-2">
            <li>
              Platform &quot;olduğu gibi&quot; sunulmakta olup, kesintisiz veya hatasız
              çalışacağına dair herhangi bir garanti verilmemektedir.
            </li>
            <li>
              FundEd, öğrencilerin bildirdiği bilgilerin doğruluğunu makul ölçüde doğrulamaya
              çalışır; ancak kesin doğruluk garantisi vermez.
            </li>
            <li>
              Bağışçı ile öğrenci arasındaki ilişkiden doğan uyuşmazlıklarda Platform
              taraf değildir.
            </li>
            <li>
              Üçüncü taraf hizmet sağlayıcılarından (Stripe, hosting vb.) kaynaklanan
              aksaklıklardan Platform sorumlu tutulamaz.
            </li>
            <li>
              Mücbir sebep hâllerinde (doğal afet, savaş, yasal düzenleme değişikliği vb.)
              Platform yükümlülüklerinden muaf tutulur.
            </li>
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">10. Uyuşmazlık Çözümü</h2>
        <p>
          Bu Kullanım Koşullarından doğan uyuşmazlıklarda Türkiye Cumhuriyeti hukuku
          uygulanır. Uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve İcra Daireleri
          yetkilidir.
        </p>
      </section>

      {/* -------------------------------------------------- */}
      <section>
        <h2 className="text-xl font-semibold text-blue-800">11. Değişiklikler</h2>
        <p>
          FundEd, bu Kullanım Koşullarını önceden bildirimde bulunarak güncelleme hakkını
          saklı tutar. Önemli değişikliklerde kayıtlı e-posta adresinize bildirim
          gönderilecektir. Değişiklik sonrası Platformu kullanmaya devam etmeniz, güncel
          koşulları kabul ettiğiniz anlamına gelir.
        </p>
      </section>
    </article>
  );
}
