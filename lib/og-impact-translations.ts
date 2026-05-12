type OgImpactText = {
  badge: string;
  impact: string;
  supporter: string;
  thanks: string;
};

const OG_IMPACT_TRANSLATIONS: Record<string, OgImpactText> = {
  en: {
    badge: 'ANNIVERSARY',
    impact: '1 Year of Impact',
    supporter: 'Proud Supporter of',
    thanks: 'Thank you for making a difference!',
  },
  tr: {
    badge: 'YIL DÖNÜMÜ',
    impact: '1 Yıllık Etki',
    supporter: 'Gururlu Destekçisi:',
    thanks: 'Fark yarattığınız için teşekkürler!',
  },
};

export function getOgImpactTranslations(lang?: string): OgImpactText {
  return OG_IMPACT_TRANSLATIONS[lang || 'en'] || OG_IMPACT_TRANSLATIONS.en;
}
