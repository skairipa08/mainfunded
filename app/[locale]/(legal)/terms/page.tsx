'use client';
import { useTranslation } from "@/lib/i18n/context";

export default function TermsOfServicePage() {
  const { t } = useTranslation();
  const today = new Date().toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="prose prose-blue max-w-none">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">{t('app.page.kullan_m_ko_ullar')}</h1>
      <p className="text-sm text-gray-500 mb-8">{t('app.page.son_g_ncelleme')}{today}</p>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.1_genel_h_k_mler')}</h2>
        <p>
          {t('app.page.bu_kullan_m_ko_ullar')}<strong>{t('app.page.funded_e_itim_teknolojileri')}</strong> {t('app.page.taraf_ndan_i_letilen_fund_ed_c')}</p>
        <p>
          {t('app.page.ko_ullar_kabul_etmiyorsan_z_pl')}</p>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.2_platform_tan_m')}</h2>
        <p>
          {t('app.page.funded_do_rulanm_renciler_ile_')}</p>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.3_platform_komisyonu')}</h2>
        <p>
          {t('app.page.platform_s_rd_r_lebilirli_ini_')}</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="text-left px-4 py-2 font-semibold text-blue-900">{t('app.page.kalem')}</th>
                <th className="text-left px-4 py-2 font-semibold text-blue-900">{t('app.page.oran')}</th>
                <th className="text-left px-4 py-2 font-semibold text-blue-900">{t('app.page.a_klama')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 font-medium">{t('app.page.platform_komisyonu')}</td>
                <td className="px-4 py-2">%2</td>
                <td className="px-4 py-2">{t('app.page.platform_geli_tirme_destek_ve_')}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">{t('app.page.deme_lem_bedeli')}</td>
                <td className="px-4 py-2">%3,2</td>
                <td className="px-4 py-2">
                  {t('app.page.iyzico_deme_altyap_s_taraf_nda')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4">
          {t('app.page.ba_lar_quot_cretleri_ben_kar_l')}</p>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.4_deme_ve_transfer_s_reci')}</h2>
        <ul>
          <li>
            {t('app.page.ba_lar_iyzico_g_venli_deme_alt')}</li>
          <li>
            {t('app.page.ba_ar_l_bir_ba_sonras_fonlar_k')}{' '}
            <strong>{t('app.page.7_ila_14_i_g_n')}</strong> {t('app.page.i_inde_aktar_l_r')}</li>
          <li>
            {t('app.page.transfer_s_releri_bankalar_ara')}</li>
          <li>
            {t('app.page.platform_m_cbir_sebep_h_llerin')}</li>
        </ul>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.5_renci_y_k_ml_l_kleri')}</h2>
        <ul>
          <li>{t('app.page.profil_bilgilerinin_do_ru_ve_g')}</li>
          <li>{t('app.page.ge_erli_ve_me_ru_renci_belgele')}</li>
          <li>{t('app.page.toplanan_fonlar_n_yaln_zca_bey')}</li>
          <li>{t('app.page.kampanya_bilgilerinin_ger_e_i_')}</li>
          <li>{t('app.page.platform_kurallar_na_ve_t_rkiy')}</li>
        </ul>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.6_ba_y_k_ml_l_kleri')}</h2>
        <ul>
          <li>{t('app.page.ba_lar_g_n_ll_l_k_esas_na_daya')}</li>
          <li>
            {t('app.page.ba_lar_platformun_bir_arac_old')}</li>
          <li>
            {t('app.page.ba_lardan_do_abilecek_vergisel')}</li>
        </ul>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.7_yasakl_faaliyetler')}</h2>
        <p>{t('app.page.a_a_daki_eylemler_kesinlikle_y')}</p>
        <ul>
          <li>
            <strong>{t('app.page.sahte_belge_sunma')}</strong> {t('app.page.ger_e_e_ayk_r_renci_belgesi_ki')}</li>
          <li>
            <strong>{t('app.page.doland_r_c_l_k')}</strong> {t('app.page.yan_lt_c_kampanya_bilgisi_ile_')}</li>
          <li>
            <strong>{t('app.page.fonlar_n_k_t_ye_kullan_m')}</strong> {t('app.page.toplanan_ba_lar_n_beyan_edilen')}</li>
          <li>
            <strong>{t('app.page.kimlik_h_rs_zl')}</strong> {t('app.page.ba_ka_bir_ki_inin_bilgilerini_')}</li>
          <li>
            <strong>{t('app.page.platform_manip_lasyonu')}</strong> {t('app.page.otomatik_ara_larla_sahte_ba_ve')}</li>
          <li>
            <strong>{t('app.page.kara_para_aklama')}</strong> {t('app.page.platformun_yasad_fonlar_n_me_r')}</li>
        </ul>
        <p className="mt-4">
          {t('app.page.yasakl_faaliyetlerin_tespiti_h')}</p>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.8_fikri_m_lkiyet')}</h2>
        <p>
          {t('app.page.platform_zerindeki_t_m_i_erik_')}</p>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.9_sorumluluk_reddi')}</h2>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-amber-900 mb-3">
            <strong>{t('app.page.nemli_bilgilendirme')}</strong>
          </p>
          <ul className="text-amber-800 space-y-2">
            <li>
              {t('app.page.platform_quot_oldu_u_gibi_quot')}</li>
            <li>
              {t('app.page.funded_rencilerin_bildirdi_i_b')}</li>
            <li>
              {t('app.page.ba_ile_renci_aras_ndaki_ili_ki')}</li>
            <li>
              {t('app.page.nc_taraf_hizmet_sa_lay_c_lar_n')}</li>
            <li>
              {t('app.page.m_cbir_sebep_h_llerinde_do_al_')}</li>
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.10_uyu_mazl_k_z_m')}</h2>
        <p>
          {t('app.page.bu_kullan_m_ko_ullar_ndan_do_a')}</p>
      </section>

      {/* -------------------------------------------------- */}
      <section>
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.11_de_i_iklikler')}</h2>
        <p>
          {t('app.page.funded_bu_kullan_m_ko_ullar_n_')}</p>
      </section>
    </article>
  );
}
