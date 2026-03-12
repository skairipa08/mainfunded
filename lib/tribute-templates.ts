/**
 * Tribute Giving — Types & Message Template System
 *
 * Supports 5 occasions with pre-written Turkish message for each.
 * The user can override the message freely after selecting an occasion.
 */

export type TributeOccasion =
  | 'birthday'
  | 'mothers_day'
  | 'graduation'
  | 'get_well'
  | 'general';

export interface TributeOccasionMeta {
  id: TributeOccasion;
  label: string;
  emoji: string;
  /** Default message sent by the donor — {{honoree}} will be replaced at runtime */
  defaultMessage: string;
}

export const TRIBUTE_OCCASIONS: TributeOccasionMeta[] = [
  {
    id: 'general',
    label: 'Özel Bir Kişi İçin',
    emoji: '💙',
    defaultMessage:
      'Seni düşünüyorum ve bu bağışı sana özel biri olduğunu hatırlatmak için yaptım.',
  },
  {
    id: 'birthday',
    label: 'Doğum Günü',
    emoji: '🎂',
    defaultMessage:
      'Doğum günün kutlu olsun! Bu özel günde bir öğrencinin eğitim hayaline ortak olmak istedim.',
  },
  {
    id: 'mothers_day',
    label: 'Anneler Günü',
    emoji: '🌸',
    defaultMessage:
      'Anneler Günün kutlu olsun! Sonsuz sevgine karşılık bir öğrencinin geleceğine ışık tutmak istedim.',
  },
  {
    id: 'graduation',
    label: 'Mezuniyet',
    emoji: '🎓',
    defaultMessage:
      'Mezuniyetin kutlu olsun! O emeklerin ve azmin için gurur duyuyorum. Bu bağış seninle kutlamak için.',
  },
  {
    id: 'get_well',
    label: 'Geçmiş Olsun',
    emoji: '🌻',
    defaultMessage:
      'Geçmiş olsun! Bir an önce iyileşmeni, sağlık ve mutluluk dolu günler geçirmeni diliyorum.',
  },
];

export interface TributeInfo {
  /** Is this a tribute donation? */
  isTribute: boolean;
  /** Name of the person being honored */
  honoreeName: string;
  /** Honoree's email (optional — for notification) */
  honoreeEmail?: string;
  /** The occasion */
  occasion: TributeOccasion;
  /** Custom or template-based message the donor writes */
  message: string;
  /** Donor display name (used in honoree notification) */
  donorDisplayName?: string;
}

/**
 * Returns the template message for an occasion,
 * optionally substituting {{honoree}} placeholder.
 */
export function getOccasionTemplate(
  occasion: TributeOccasion,
  honoreeName?: string
): string {
  const meta = TRIBUTE_OCCASIONS.find((o) => o.id === occasion);
  const tpl = meta?.defaultMessage ?? TRIBUTE_OCCASIONS[0].defaultMessage;
  return honoreeName ? tpl.replace(/\{\{honoree\}\}/g, honoreeName) : tpl;
}

/**
 * Social share text for a tribute donation.
 * E.g. "Annem adına bir öğrenciye destek oldum 💙 — #FundEd"
 */
export function buildShareText(
  honoreeName: string,
  campaignTitle: string,
  occasion: TributeOccasion
): string {
  const meta = TRIBUTE_OCCASIONS.find((o) => o.id === occasion);
  const emoji = meta?.emoji ?? '💙';

  const occasionPhrase: Record<TributeOccasion, string> = {
    birthday: `${honoreeName}'ın doğum günü onuruna`,
    mothers_day: `${honoreeName} adına Anneler Günü'nde`,
    graduation: `${honoreeName}'ın mezuniyeti şerefine`,
    get_well: `${honoreeName}'a geçmiş olsun dileğiyle`,
    general: `${honoreeName} adına`,
  };

  const phrase = occasionPhrase[occasion] ?? `${honoreeName} adına`;

  return `${phrase} bir öğrencinin eğitim hayaline destek oldum ${emoji}\n"${campaignTitle}"\n#FundEd #EğitimHakkı`;
}
