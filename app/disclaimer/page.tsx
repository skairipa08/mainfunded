import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DisclaimerPage() {
  const lastUpdated = new Date().toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <Navbar />
      <main className="flex-grow">
        <section className="relative overflow-hidden pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-900/50 via-slate-950 to-slate-950" />
          <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />

          <div className="relative max-w-5xl mx-auto px-4 pt-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur border border-white/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Güven ve Şeffaflık Sözü
            </div>

            <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Destek Olurken Bileceğiniz Her Şey: Sınırlar, Sorumluluklar, Güvence
                </h1>
                <p className="text-lg text-slate-200">
                  FundEd, öğrenciler ve bağışçıları buluşturan bir teknoloji köprüsüdür. Hayalleri büyütürken,
                  sınırlarımızı açıkça paylaşıyor ve yol arkadaşlığımızı güven üzerine kuruyoruz.
                </p>
              </div>
              <div className="shrink-0 space-y-2 text-sm text-slate-200/80">
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 border border-white/15">
                  <span role="img" aria-label="calendar">🗓️</span>
                  Güncelleme: {lastUpdated}
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 border border-white/15">
                  <span role="img" aria-label="shield">🛡️</span>
                  Şeffaflık ve Sorumluluk İlkesi
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[{
                title: 'Titiz Doğrulama',
                desc: 'Öğrenci belgelerini kontrol eder, doğrulama sürecini şeffaf paylaşırız.',
                tone: 'bg-white/10 border-white/15'
              }, {
                title: 'Güvenli Ödeme',
                desc: 'Ödemeler Stripe altyapısıyla işlenir; kart bilgileri bizde tutulmaz.',
                tone: 'bg-white/5 border-white/10'
              }, {
                title: 'Net Sınırlar',
                desc: 'Platform aracıdır; bağışların kullanımına dair garantiler veremeyiz.',
                tone: 'bg-white/5 border-white/10'
              }].map((item) => (
                <div key={item.title} className={`rounded-2xl p-5 backdrop-blur border ${item.tone}`}>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-slate-200/80 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white text-slate-900 py-12">
          <div className="max-w-5xl mx-auto px-4 space-y-10">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Platform Rolümüz</h2>
                <p className="mt-3 text-slate-700 leading-relaxed">
                  FundEd bir bağış ve eğitim fonlama teknolojisidir; banka, yardım kuruluşu veya eğitim kurumu değildir.
                  Öğrencileri doğrular, bağışçıyla buluşturur, ödeme altyapısını güvenli biçimde işletir.
                </p>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex gap-2"><span role="img" aria-label="link">🤝</span> Bağlantı kurar, aracılık ederiz.</div>
                  <div className="flex gap-2"><span role="img" aria-label="lock">🔒</span> Ödeme sürecini şifreli ve kayıtlı yürütürüz.</div>
                  <div className="flex gap-2"><span role="img" aria-label="balance">⚖️</span> Bağımsız ve şeffaf kalırız.</div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-amber-900">Garantilemediklerimiz</h2>
                <ul className="mt-3 space-y-2 text-slate-800 text-sm leading-relaxed">
                  <li>• Kampanyaların hedeflerine ulaşması</li>
                  <li>• Öğrencilerin fonları beyan ettikleri şekilde kullanması</li>
                  <li>• Öğrenci beyanlarının eksiksiz ve hatasız olması</li>
                  <li>• Eğitim çıktılarının (mezuniyet, başarı) gerçekleşmesi</li>
                </ul>
                <p className="mt-3 text-xs text-amber-800">
                  Bağış yapmadan önce kampanya detaylarını dikkatle okumanızı, sorularınızı doğrudan öğrenciyle
                  veya destek kanalımızla paylaşmanızı öneririz.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Bağışçı Sorumlulukları</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700 leading-relaxed">
                  <li>• Bağışlar geri ödemesizdir (yasal zorunluluklar hariç).</li>
                  <li>• Vergisel yükümlülüklerinizi kendiniz takip edersiniz.</li>
                  <li>• Kampanya açıklamalarını ve güncellemeleri kontrol edersiniz.</li>
                  <li>• Riskleri değerlendirerek bilinçli karar verirsiniz.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Öğrenci Sorumlulukları</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700 leading-relaxed">
                  <li>• Doğru ve güncel bilgiler paylaşmak.</li>
                  <li>• Fonları belirtilen eğitim amacıyla kullanmak.</li>
                  <li>• Talep edildiğinde ek belge/güncelleme sunmak.</li>
                  <li>• Topluluğa karşı dürüst ve açık olmak.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-12">
          <div className="max-w-5xl mx-auto px-4 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-sky-700">Nasıl Çalışıyoruz?</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">Doğrulama ve Şeffaflık Adımlarımız</h2>
              </div>
              <div className="rounded-full bg-sky-100 text-sky-800 text-sm px-4 py-2 font-medium">
                Sürekli iyileştirme ve kayıtlı denetim izi
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[{
                title: 'Belge Kontrolü',
                desc: 'Öğrenci belgesi, transkript gibi evraklar manuel gözden geçirilir.',
                tone: 'bg-white border-slate-100'
              }, {
                title: 'Güvenli Ödeme',
                desc: 'Stripe ile şifreli işlem, kart verisi FundEd sistemlerine girmez.',
                tone: 'bg-white border-slate-100'
              }, {
                title: 'Güncelleme Takibi',
                desc: 'Kampanya sahiplerinden düzenli durum bilgisi ister, ihlal şüphesini inceleriz.',
                tone: 'bg-white border-slate-100'
              }].map((item) => (
                <div key={item.title} className={`rounded-xl p-5 shadow-sm border ${item.tone}`}>
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-red-900">
              <h3 className="text-lg font-semibold">Riskleri Bilerek Hareket Edin</h3>
              <p className="mt-2 text-sm leading-relaxed text-red-900/90">
                Bağışlar bir yatırım veya satın alma değildir. Kampanyaların gerçekleşmemesi, hedeflerin tutmaması
                veya beyan dışı kullanım gibi riskler mevcut olabilir. Bu riskler bağış kararınızın doğal parçasıdır.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white text-slate-900 py-12">
          <div className="max-w-5xl mx-auto px-4 space-y-6">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-emerald-700">Sorumluluk Reddi</p>
              <h2 className="text-2xl font-bold">Yasal Çerçeve ve Sınırlar</h2>
              <p className="text-slate-700 leading-relaxed">
                Yürürlükteki hukuk çerçevesinde, FundEd dolaylı, tesadüfi, özel veya sonucu kayıplarından sorumlu tutulamaz.
                Üçüncü taraf servis sağlayıcılarının (Stripe, Cloudinary, kimlik doğrulama sağlayıcıları) politika ve güvenlik
                uygulamalarından sorumluluk kabul etmeyiz; fakat güvenli entegrasyon ve sözleşmesel tedbirleri uygularız.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Sorularınız mı var?</h3>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                Şeffaflık için buradayız. Kampanya, doğrulama veya bağış süreçleri hakkında aklınıza takılan her şey için
                bize ulaşabilirsiniz.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="mailto:support@fund-ed.com"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors"
                >
                  Destek Ekibine Yaz
                </a>
                <div className="text-xs text-slate-600">
                  Hızlı yanıt: 1-2 iş günü içinde | Belge taleplerine yanıt: 5 iş günü içinde
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
