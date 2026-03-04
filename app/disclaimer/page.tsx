'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from "@/lib/i18n/context";

export default function DisclaimerPage() {
    const { t } = useTranslation();
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
              {t('app.page.g_ven_ve_effafl_k_s_z')}</div>

            <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  {t('app.page.destek_olurken_bilece_iniz_her')}</h1>
                <p className="text-lg text-slate-200">
                  {t('app.page.funded_renciler_ve_ba_lar_bulu')}</p>
              </div>
              <div className="shrink-0 space-y-2 text-sm text-slate-200/80">
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 border border-white/15">
                  <span role="img" aria-label="calendar">🗓️</span>
                  {t('app.page.g_ncelleme')}{lastUpdated}
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 border border-white/15">
                  <span role="img" aria-label="shield">🛡️</span>
                  {t('app.page.effafl_k_ve_sorumluluk_lkesi')}</div>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[{
                title: 'Titiz Doğrulama',
                desc: 'Öğrenci belgelerini kontrol eder, doğrulama sürecini şeffaf paylaşırız.',
                tone: 'bg-white/10 border-white/15'
              }, {
                title: 'Güvenli Ödeme',
                desc: 'Ödemeler iyzico altyapısıyla işlenir; kart bilgileri bizde tutulmaz.',
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
                <h2 className="text-xl font-semibold text-slate-900">{t('app.page.platform_rol_m_z')}</h2>
                <p className="mt-3 text-slate-700 leading-relaxed">
                  {t('app.page.funded_bir_ba_ve_e_itim_fonlam')}</p>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex gap-2"><span role="img" aria-label="link">🤝</span> {t('app.page.ba_lant_kurar_arac_l_k_ederiz')}</div>
                  <div className="flex gap-2"><span role="img" aria-label="lock">🔒</span> {t('app.page.deme_s_recini_ifreli_ve_kay_tl')}</div>
                  <div className="flex gap-2"><span role="img" aria-label="balance">⚖️</span> {t('app.page.ba_ms_z_ve_effaf_kal_r_z')}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-amber-900">{t('app.page.garantilemediklerimiz')}</h2>
                <ul className="mt-3 space-y-2 text-slate-800 text-sm leading-relaxed">
                  <li>{t('app.page.kampanyalar_n_hedeflerine_ula_')}</li>
                  <li>{t('app.page.rencilerin_fonlar_beyan_ettikl')}</li>
                  <li>{t('app.page.renci_beyanlar_n_n_eksiksiz_ve')}</li>
                  <li>{t('app.page.e_itim_kt_lar_n_n_mezuniyet_ba')}</li>
                </ul>
                <p className="mt-3 text-xs text-amber-800">
                  {t('app.page.ba_yapmadan_nce_kampanya_detay')}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{t('app.page.ba_sorumluluklar')}</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700 leading-relaxed">
                  <li>{t('app.page.ba_lar_geri_demesizdir_yasal_z')}</li>
                  <li>{t('app.page.vergisel_y_k_ml_l_klerinizi_ke')}</li>
                  <li>{t('app.page.kampanya_a_klamalar_n_ve_g_nce')}</li>
                  <li>{t('app.page.riskleri_de_erlendirerek_bilin')}</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{t('app.page.renci_sorumluluklar')}</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700 leading-relaxed">
                  <li>{t('app.page.do_ru_ve_g_ncel_bilgiler_payla')}</li>
                  <li>{t('app.page.fonlar_belirtilen_e_itim_amac_')}</li>
                  <li>{t('app.page.talep_edildi_inde_ek_belge_g_n')}</li>
                  <li>{t('app.page.toplulu_a_kar_d_r_st_ve_a_k_ol')}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-12">
          <div className="max-w-5xl mx-auto px-4 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-sky-700">{t('app.page.nas_l_al_yoruz')}</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{t('app.page.do_rulama_ve_effafl_k_ad_mlar_')}</h2>
              </div>
              <div className="rounded-full bg-sky-100 text-sky-800 text-sm px-4 py-2 font-medium">
                {t('app.page.s_rekli_iyile_tirme_ve_kay_tl_')}</div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[{
                title: 'Belge Kontrolü',
                desc: 'Öğrenci belgesi, transkript gibi evraklar manuel gözden geçirilir.',
                tone: 'bg-white border-slate-100'
              }, {
                title: 'Güvenli Ödeme',
                desc: 'iyzico ile şifreli işlem, kart verisi FundEd sistemlerine girmez.',
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
              <h3 className="text-lg font-semibold">{t('app.page.riskleri_bilerek_hareket_edin')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-red-900/90">
                {t('app.page.ba_lar_bir_yat_r_m_veya_sat_n_')}</p>
            </div>
          </div>
        </section>

        <section className="bg-white text-slate-900 py-12">
          <div className="max-w-5xl mx-auto px-4 space-y-6">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-emerald-700">{t('app.page.sorumluluk_reddi')}</p>
              <h2 className="text-2xl font-bold">{t('app.page.yasal_er_eve_ve_s_n_rlar')}</h2>
              <p className="text-slate-700 leading-relaxed">
                {t('app.page.y_r_rl_kteki_hukuk_er_evesinde')}</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{t('app.page.sorular_n_z_m_var')}</h3>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                {t('app.page.effafl_k_i_in_buraday_z_kampan')}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="mailto:support@fund-ed.com"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors"
                >
                  {t('app.page.destek_ekibine_yaz')}</a>
                <div className="text-xs text-slate-600">
                  {t('app.page.h_zl_yan_t_1_2_i_g_n_i_inde_be')}</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
