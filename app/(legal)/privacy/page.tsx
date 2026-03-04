'use client';
import { useTranslation } from "@/lib/i18n/context";


export default function PrivacyPolicyPage() {
  const { t } = useTranslation();
  const today = new Date().toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="prose prose-blue max-w-none">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">{t('app.page.gizlilik_politikas')}</h1>
      <p className="text-sm text-gray-500 mb-8">{t('app.page.son_g_ncelleme')}{today}</p>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.1_veri_sorumlusu')}</h2>
        <p>
          {t('app.page.6698_say_l_ki_isel_verilerin_k')}<strong>{t('app.page.funded_e_itim_teknolojileri')}</strong>
          {t('app.page.olarak_ki_isel_verilerinizin_g')}</p>
        <ul>
          <li>
            <strong>{t('app.page.leti_im')}</strong>{' '}
            <a href="mailto:support@fund-ed.com" className="text-blue-600 hover:underline">
              support@fund-ed.com
            </a>
          </li>
          <li>
            <strong>{t('app.page.ba_vuru_y_ntemi')}</strong> {t('app.page.yukar_daki_e_posta_adresi_zeri')}</li>
        </ul>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.2_lenen_ki_isel_veriler')}</h2>
        <p>
          {t('app.page.platform_zerinden_a_a_daki_kat')}</p>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="text-left px-4 py-2 font-semibold text-blue-900">{t('app.page.veri_kategorisi')}</th>
                <th className="text-left px-4 py-2 font-semibold text-blue-900">{t('app.page.rnekler')}</th>
                <th className="text-left px-4 py-2 font-semibold text-blue-900">{t('app.page.leme_amac')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 font-medium">{t('app.page.kimlik_bilgileri')}</td>
                <td className="px-4 py-2">{t('app.page.ad_soyad')}</td>
                <td className="px-4 py-2">{t('app.page.hesap_olu_turma_kimlik_do_rula')}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">{t('app.page.leti_im_bilgileri')}</td>
                <td className="px-4 py-2">{t('app.page.e_posta_adresi')}</td>
                <td className="px-4 py-2">{t('app.page.bilgilendirme_i_lem_onay')}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">{t('app.page.e_itim_belgeleri')}</td>
                <td className="px-4 py-2">{t('app.page.renci_belgesi_transkript')}</td>
                <td className="px-4 py-2">{t('app.page.renci_do_rulama_s_reci')}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">{t('app.page.finansal_bilgiler')}</td>
                <td className="px-4 py-2">{t('app.page.deme_kart_bilgileri_iyzico_ara')}</td>
                <td className="px-4 py-2">{t('app.page.ba_i_lemlerinin_ger_ekle_tiril')}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">{t('app.page.kullan_m_verileri')}</td>
                <td className="px-4 py-2">{t('app.page.ip_adresi_taray_c_bilgisi_erez')}</td>
                <td className="px-4 py-2">{t('app.page.platform_g_venli_i_analitik')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.3_hukuki_sebepler')}</h2>
        <p>{t('app.page.ki_isel_verileriniz_kvkk_m_5_2')}</p>
        <ul>
          <li>{t('app.page.s_zle_menin_kurulmas_veya_ifas')}</li>
          <li>{t('app.page.hukuki_y_k_ml_l_n_yerine_getir')}</li>
          <li>{t('app.page.lgili_ki_inin_temel_hak_ve_zg_')}</li>
          <li>{t('app.page.a_k_r_za_yaln_zca_yukar_daki_s')}</li>
        </ul>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.4_saklama_s_releri')}</h2>
        <p>
          {t('app.page.ki_isel_verileriniz_i_leme_ama')}</p>
        <ul>
          <li>
            <strong>{t('app.page.hesap_ve_kimlik_bilgileri')}</strong> {t('app.page.hesap_aktif_oldu_u_s_rece_hesa')}<strong>{t('app.page.5_y_l')}</strong>
          </li>
          <li>
            <strong>{t('app.page.finansal_i_lem_kay_tlar')}</strong> {t('app.page.lgili_mevzuat_gere_i')}{' '}
            <strong>{t('app.page.10_y_l')}</strong>
          </li>
          <li>
            <strong>{t('app.page.renci_belgeleri')}</strong> {t('app.page.kampanya_kapan_ndan_itibaren')}{' '}
            <strong>{t('app.page.5_y_l')}</strong>
          </li>
          <li>
            <strong>{t('app.page.erez_verileri')}</strong> {t('app.page.en_fazla')}<strong>{t('app.page.13_ay')}</strong> {t('app.page.cnil_kvkk_uyumlu')}</li>
        </ul>
        <p>
          {t('app.page.saklama_s_resi_dolan_veriler_p')}</p>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.5_kullan_c_haklar_kvkk_m_11')}</h2>
        <p>{t('app.page.kvkk_apos_n_n_11_maddesi_uyar_')}</p>
        <ol>
          <li>{t('app.page.ki_isel_verilerinizin_i_lenip_')}</li>
          <li>{t('app.page.lenmi_se_buna_ili_kin_bilgi_ta')}</li>
          <li>{t('app.page.lenme_amac_n_ve_bunlar_n_amac_')}</li>
          <li>{t('app.page.yurt_i_inde_veya_yurt_d_nda_ak')}</li>
          <li>{t('app.page.eksik_veya_yanl_i_lenmi_verile')}<strong>{t('app.page.d_zeltilmesini')}</strong> isteme</li>
          <li>
            {t('app.page.kvkk_m_7_kapsam_nda_ki_isel_ve')}<strong>silinmesini</strong> {t('app.page.veya_yok_edilmesini_isteme')}</li>
          <li>{t('app.page.d_zeltme_silme_i_lemlerinin_ak')}</li>
          <li>
            {t('app.page.m_nhas_ran_otomatik_sistemler_')}</li>
          <li>
            {t('app.page.kanuna_ayk_r_i_leme_nedeniyle_')}<strong>{t('app.page.zarar_n_giderilmesini')}</strong> {t('app.page.talep_etme')}</li>
        </ol>
        <p className="mt-4">
          {t('app.page.ba_vurular_n_z')}{' '}
          <a href="mailto:support@fund-ed.com" className="text-blue-600 hover:underline">
            support@fund-ed.com
          </a>{' '}
          {t('app.page.adresine_g_ndererek_kullanabil')}<strong>{t('app.page.30_g_n')}</strong> {t('app.page.i_inde_sonu_land_r_lacakt_r')}</p>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.6_veri_aktar_m')}</h2>
        <p>
          {t('app.page.ki_isel_verileriniz_hizmet_kal')}</p>
        <ul>
          <li>
            <strong>iyzico</strong> {t('app.page.deme_i_lemleri_t_rkiye_merkezl')}</li>
          <li>
            <strong>{t('app.page.hosting_sa_lay_c_lar')}</strong> {t('app.page.vercel_bulut_altyap_s_ifreli_i')}</li>
          <li>
            <strong>{t('app.page.yasal_merciler')}</strong> {t('app.page.kanuni_zorunluluk_h_linde_yetk')}</li>
        </ul>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.7_erez_politikas')}</h2>
        <p>{t('app.page.platformumuz_a_a_daki_erez_t_r')}</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="text-left px-4 py-2 font-semibold text-blue-900">{t('app.page.erez_t_r')}</th>
                <th className="text-left px-4 py-2 font-semibold text-blue-900">{t('app.page.ama')}</th>
                <th className="text-left px-4 py-2 font-semibold text-blue-900">{t('app.page.s_re')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 font-medium">{t('app.page.zorunlu_erezler')}</td>
                <td className="px-4 py-2">{t('app.page.oturum_y_netimi_g_venlik')}</td>
                <td className="px-4 py-2">{t('app.page.oturum_s_resince')}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">{t('app.page.levsel_erezler')}</td>
                <td className="px-4 py-2">{t('app.page.dil_tercihi_tema_ayarlar')}</td>
                <td className="px-4 py-2">{t('app.page.1_y_l')}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">{t('app.page.analitik_erezler')}</td>
                <td className="px-4 py-2">{t('app.page.anonim_kullan_m_istatistikleri')}</td>
                <td className="px-4 py-2">{t('app.page.13_ay')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4">
          {t('app.page.taray_c_ayarlar_n_zdan_erezler')}</p>
      </section>

      {/* -------------------------------------------------- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.8_g_venlik_nlemleri')}</h2>
        <p>
          {t('app.page.ki_isel_verilerinizin_g_venli_')}</p>
        <ul>
          <li>{t('app.page.ssl_tls_ile_ifreli_veri_iletim')}</li>
          <li>{t('app.page.deme_bilgilerinin_iyzico_pci_d')}</li>
          <li>{t('app.page.eri_im_kontrolleri_ve_yetkilen')}</li>
          <li>{t('app.page.d_zenli_g_venlik_denetimleri_v')}</li>
          <li>{t('app.page.veri_minimizasyonu_ilkesi')}</li>
        </ul>
      </section>

      {/* -------------------------------------------------- */}
      <section>
        <h2 className="text-xl font-semibold text-blue-800">{t('app.page.9_politika_de_i_iklikleri')}</h2>
        <p>
          {t('app.page.bu_gizlilik_politikas_zaman_za')}</p>
      </section>
    </article>
  );
}
