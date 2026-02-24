// ═══════════════════════════════════════════════════════
// Notification & Calendar Types
// ═══════════════════════════════════════════════════════

export type NotificationType =
  | 'donation'        // Bağış yapıldı
  | 'campaign'        // Yeni kampanya / kampanya güncelleme
  | 'milestone'       // Kampanya hedefe yaklaştı
  | 'thank_you'       // Teşekkür mesajı
  | 'reminder'        // Bağış hatırlatıcısı
  | 'impact'          // Etki raporu
  | 'calendar'        // Takvim etkinliği
  | 'badge'           // Rozet kazanıldı
  | 'streak'          // Bağış serisi
  | 'system';         // Sistem bildirimi

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;          // Tıklanınca yönlendirilecek URL
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  donationReminders: boolean;
  campaignUpdates: boolean;
  milestoneAlerts: boolean;
  impactReports: boolean;
  calendarReminders: boolean;
  reminderDay: number;      // Aylık hatırlatma günü (1-28)
}

export type CalendarEventType =
  | 'donation'      // Geçmiş bağış
  | 'campaign_end'  // Kampanya bitiş tarihi
  | 'special_day'   // Özel gün (23 Nisan vb.)
  | 'school'        // Okul takvimi
  | 'reminder';     // Kullanıcı hatırlatıcısı

export interface CalendarEvent {
  id: string;
  date: string;             // ISO date string
  title: string;
  description?: string;
  type: CalendarEventType;
  emoji: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export interface DonationStreak {
  currentStreak: number;    // Ardışık ay sayısı
  longestStreak: number;
  totalDonations: number;
  lastDonationDate: string | null;
}

// Special days for Turkey / education-related
export const SPECIAL_DAYS: Omit<CalendarEvent, 'id'>[] = [
  {
    date: '2026-04-23',
    title: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı',
    description: 'Çocukların geleceği için bağış yapın!',
    type: 'special_day',
    emoji: '🎈',
    link: '/campaigns',
  },
  {
    date: '2026-11-24',
    title: 'Öğretmenler Günü',
    description: 'Öğretmenlere destek olun!',
    type: 'special_day',
    emoji: '🍎',
    link: '/campaigns',
  },
  {
    date: '2026-09-14',
    title: 'Okullar Açılıyor',
    description: 'Öğrencilerin okul ihtiyaçları için bağış zamanı',
    type: 'school',
    emoji: '📚',
    link: '/campaigns',
  },
  {
    date: '2026-06-13',
    title: 'Yaz Tatili Başlangıcı',
    description: 'Yaz kursları için destek olun',
    type: 'school',
    emoji: '☀️',
    link: '/campaigns',
  },
  {
    date: '2026-10-29',
    title: 'Cumhuriyet Bayramı',
    description: 'Cumhuriyetin geleceği eğitimle şekillenir',
    type: 'special_day',
    emoji: '🇹🇷',
    link: '/campaigns',
  },
  {
    date: '2026-01-01',
    title: 'Yeni Yıl',
    description: 'Yeni yıl, yeni umutlar! Bağışınızla fark yaratın.',
    type: 'special_day',
    emoji: '🎉',
    link: '/campaigns',
  },
  {
    date: '2026-05-19',
    title: 'Atatürkü Anma, Gençlik ve Spor Bayramı',
    description: 'Gençliğe yatırım yapın',
    type: 'special_day',
    emoji: '🏃',
    link: '/campaigns',
  },

  // ── Dünya Günleri — Eğitim, Gençlik & Duygusal ──────────────

  // OCAK
  {
    date: '2026-01-24',
    title: 'Uluslararası Eğitim Günü',
    description: 'Eğitim bir haktır. Bir öğrencinin hayatını değiştirin!',
    type: 'special_day',
    emoji: '📖',
    link: '/campaigns',
  },
  {
    date: '2026-01-27',
    title: 'Uluslararası Holokost Anma Günü',
    description: 'Asla unutma. Eğitimle hoşgörüyü yaşatalım.',
    type: 'special_day',
    emoji: '🕯️',
    link: '/campaigns',
  },

  // ŞUBAT
  {
    date: '2026-02-04',
    title: 'Dünya Kanser Günü',
    description: 'Sağlık alanında okuyan öğrencilere destek olun.',
    type: 'special_day',
    emoji: '🎗️',
    link: '/campaigns',
  },
  {
    date: '2026-02-11',
    title: 'Uluslararası Kadınlar ve Kızlar Bilim Günü',
    description: 'STEM alanında kız öğrencileri destekleyin!',
    type: 'special_day',
    emoji: '🔬',
    link: '/campaigns',
  },
  {
    date: '2026-02-20',
    title: 'Dünya Sosyal Adalet Günü',
    description: 'Eğitimde fırsat eşitliği herkesin hakkıdır.',
    type: 'special_day',
    emoji: '⚖️',
    link: '/campaigns',
  },
  {
    date: '2026-02-21',
    title: 'Uluslararası Anadil Günü',
    description: 'Her dil bir kültürdür. Eğitimle kültürleri yaşatalım.',
    type: 'special_day',
    emoji: '🗣️',
    link: '/campaigns',
  },

  // MART
  {
    date: '2026-03-08',
    title: 'Dünya Kadınlar Günü',
    description: 'Kız öğrencilerin eğitimine destek olun!',
    type: 'special_day',
    emoji: '💜',
    link: '/campaigns',
  },
  {
    date: '2026-03-20',
    title: 'Dünya Mutluluk Günü',
    description: 'Bir öğrencinin yüzünü güldürün — mutluluk bulaşıcıdır!',
    type: 'special_day',
    emoji: '😊',
    link: '/campaigns',
  },
  {
    date: '2026-03-21',
    title: 'Dünya Down Sendromu Günü',
    description: 'Kapsayıcı eğitim herkese açık olmalı.',
    type: 'special_day',
    emoji: '💛',
    link: '/campaigns',
  },

  // NİSAN
  {
    date: '2026-04-02',
    title: 'Dünya Otizm Farkındalık Günü',
    description: 'Fark değil, farkındalık! Kapsayıcı eğitimi destekleyin.',
    type: 'special_day',
    emoji: '🧩',
    link: '/campaigns',
  },
  {
    date: '2026-04-07',
    title: 'Dünya Sağlık Günü',
    description: 'Sağlık alanında eğitim alan öğrencilere destek olun.',
    type: 'special_day',
    emoji: '🏥',
    link: '/campaigns',
  },
  {
    date: '2026-04-22',
    title: 'Dünya Dünya Günü (Earth Day)',
    description: 'Geleceği kurtarmak eğitimle başlar.',
    type: 'special_day',
    emoji: '🌍',
    link: '/campaigns',
  },
  {
    date: '2026-04-23',
    title: 'Dünya Kitap ve Telif Hakkı Günü',
    description: 'Bir öğrenciye kitap hediye edin!',
    type: 'special_day',
    emoji: '📚',
    link: '/campaigns',
  },

  // MAYIS
  {
    date: '2026-05-01',
    title: 'Emek ve Dayanışma Günü',
    description: 'Dayanışma eğitimle güçlenir.',
    type: 'special_day',
    emoji: '✊',
    link: '/campaigns',
  },
  {
    date: '2026-05-03',
    title: 'Dünya Basın Özgürlüğü Günü',
    description: 'İletişim ve gazetecilik öğrencilerini destekleyin.',
    type: 'special_day',
    emoji: '📰',
    link: '/campaigns',
  },
  {
    date: '2026-05-15',
    title: 'Uluslararası Aile Günü',
    description: 'Her aile çocuklarının eğitimini hak eder.',
    type: 'special_day',
    emoji: '👨‍👩‍👧‍👦',
    link: '/campaigns',
  },

  // HAZİRAN
  {
    date: '2026-06-01',
    title: 'Uluslararası Çocuk Günü',
    description: 'Çocukların geleceği eğitimle aydınlansın!',
    type: 'special_day',
    emoji: '🧒',
    link: '/campaigns',
  },
  {
    date: '2026-06-12',
    title: 'Dünya Çocuk İşçiliğiyle Mücadele Günü',
    description: 'Her çocuk okula gitmeli, fabrikaya değil.',
    type: 'special_day',
    emoji: '🚫',
    link: '/campaigns',
  },
  {
    date: '2026-06-15',
    title: 'Dünya Yaşlılar Farkındalık Günü',
    description: 'Nesilden nesile bilgi aktarımı eğitimle olur.',
    type: 'special_day',
    emoji: '🤝',
    link: '/campaigns',
  },
  {
    date: '2026-06-20',
    title: 'Dünya Mülteci Günü',
    description: 'Mülteci öğrencilerin eğitim hayallerini destekleyin.',
    type: 'special_day',
    emoji: '🕊️',
    link: '/campaigns',
  },

  // TEMMUZ
  {
    date: '2026-07-15',
    title: 'Dünya Gençlik Becerileri Günü',
    description: 'Gençlerin mesleki becerilerini geliştirmelerine yardım edin.',
    type: 'special_day',
    emoji: '🛠️',
    link: '/campaigns',
  },
  {
    date: '2026-07-18',
    title: 'Nelson Mandela Uluslararası Günü',
    description: '"Eğitim, dünyayı değiştirebileceğiniz en güçlü silahtır."',
    type: 'special_day',
    emoji: '✨',
    link: '/campaigns',
  },
  {
    date: '2026-07-30',
    title: 'Uluslararası Dostluk Günü',
    description: 'Bir öğrenciyle bağ kurun, dostluk sınır tanımaz.',
    type: 'special_day',
    emoji: '🤗',
    link: '/campaigns',
  },

  // AĞUSTOS
  {
    date: '2026-08-09',
    title: 'Uluslararası Yerli Halklar Günü',
    description: 'Kültürel çeşitliliği eğitimle koruyalım.',
    type: 'special_day',
    emoji: '🌿',
    link: '/campaigns',
  },
  {
    date: '2026-08-12',
    title: 'Uluslararası Gençlik Günü',
    description: 'Gençlik geleceğimizdir. Bir genç\'in eğitimine yatırım yapın!',
    type: 'special_day',
    emoji: '🌟',
    link: '/campaigns',
  },
  {
    date: '2026-08-19',
    title: 'Dünya İnsani Yardım Günü',
    description: 'Eğitim en sürdürülebilir insani yardımdır.',
    type: 'special_day',
    emoji: '❤️',
    link: '/campaigns',
  },

  // EYLÜL
  {
    date: '2026-09-05',
    title: 'Uluslararası Hayır Günü',
    description: 'Bir iyilik yapın — bir öğrencinin hayatını değiştirin!',
    type: 'special_day',
    emoji: '💝',
    link: '/campaigns',
  },
  {
    date: '2026-09-08',
    title: 'Uluslararası Okuryazarlık Günü',
    description: 'Okuryazarlık özgürlüğün ilk adımıdır.',
    type: 'special_day',
    emoji: '✏️',
    link: '/campaigns',
  },
  {
    date: '2026-09-21',
    title: 'Uluslararası Barış Günü',
    description: 'Barış eğitimle başlar.',
    type: 'special_day',
    emoji: '☮️',
    link: '/campaigns',
  },
  {
    date: '2026-09-28',
    title: 'Uluslararası Bilgiye Evrensel Erişim Günü',
    description: 'Bilgi herkese açık olmalı. Eğitimi destekleyin!',
    type: 'special_day',
    emoji: '🔓',
    link: '/campaigns',
  },

  // EKİM
  {
    date: '2026-10-01',
    title: 'Dünya Yaşlılar Günü',
    description: 'Nesillerden nesillere bilgi aktaran eğitime destek.',
    type: 'special_day',
    emoji: '👴',
    link: '/campaigns',
  },
  {
    date: '2026-10-02',
    title: 'Dünya Şiddetsizlik Günü',
    description: 'Eğitim, şiddete karşı en güçlü silahtır.',
    type: 'special_day',
    emoji: '🕊️',
    link: '/campaigns',
  },
  {
    date: '2026-10-05',
    title: 'Dünya Öğretmenler Günü (UNESCO)',
    description: 'Dünyanın her yerindeki öğretmenlere saygı ve destek!',
    type: 'special_day',
    emoji: '👩‍🏫',
    link: '/campaigns',
  },
  {
    date: '2026-10-10',
    title: 'Dünya Ruh Sağlığı Günü',
    description: 'Öğrencilerin ruh sağlığı da önemli. Destek olun!',
    type: 'special_day',
    emoji: '🧠',
    link: '/campaigns',
  },
  {
    date: '2026-10-11',
    title: 'Uluslararası Kız Çocukları Günü',
    description: 'Kız çocuklarının eğitimi, toplumun geleceğidir.',
    type: 'special_day',
    emoji: '👧',
    link: '/campaigns',
  },
  {
    date: '2026-10-15',
    title: 'Uluslararası Beyaz Baston Günü',
    description: 'Görme engelli öğrencilerin eğitim hayallerini destekleyin.',
    type: 'special_day',
    emoji: '🦯',
    link: '/campaigns',
  },
  {
    date: '2026-10-17',
    title: 'Uluslararası Yoksulluğun Sona Erdirilmesi Günü',
    description: 'Yoksulluğa son vermenin yolu eğitimden geçer.',
    type: 'special_day',
    emoji: '🏠',
    link: '/campaigns',
  },

  // KASIM
  {
    date: '2026-11-10',
    title: 'Atatürkü Anma Günü',
    description: '"Hayatta en hakiki mürşit ilimdir." - Eğitimi destekleyin.',
    type: 'special_day',
    emoji: '🇹🇷',
    link: '/campaigns',
  },
  {
    date: '2026-11-13',
    title: 'Dünya İyilik Günü',
    description: 'Bir iyilik yapın: bir öğrencinin eğitimini destekleyin!',
    type: 'special_day',
    emoji: '💕',
    link: '/campaigns',
  },
  {
    date: '2026-11-16',
    title: 'Uluslararası Hoşgörü Günü',
    description: 'Hoşgörü eğitimle öğrenilir.',
    type: 'special_day',
    emoji: '🤝',
    link: '/campaigns',
  },
  {
    date: '2026-11-20',
    title: 'Dünya Çocuk Hakları Günü',
    description: 'Her çocuğun eğitim hakkı var. Fark yaratın!',
    type: 'special_day',
    emoji: '🌈',
    link: '/campaigns',
  },
  {
    date: '2026-11-25',
    title: 'Kadına Yönelik Şiddete Karşı Uluslararası Mücadele Günü',
    description: 'Eğitim, kadınların güçlenmesinin anahtarıdır.',
    type: 'special_day',
    emoji: '🟣',
    link: '/campaigns',
  },

  // ARALIK
  {
    date: '2026-12-01',
    title: 'Dünya AIDS Günü',
    description: 'Sağlık eğitimi hayat kurtarır.',
    type: 'special_day',
    emoji: '🎗️',
    link: '/campaigns',
  },
  {
    date: '2026-12-03',
    title: 'Dünya Engelliler Günü',
    description: 'Engelli öğrencilerin eğitim hayallerini destekleyin!',
    type: 'special_day',
    emoji: '♿',
    link: '/campaigns',
  },
  {
    date: '2026-12-05',
    title: 'Uluslararası Gönüllüler Günü',
    description: 'Gönüllülük ruhuyla bir öğrenciye umut olun!',
    type: 'special_day',
    emoji: '🙋',
    link: '/campaigns',
  },
  {
    date: '2026-12-10',
    title: 'Dünya İnsan Hakları Günü',
    description: 'Eğitim temel bir insan hakkıdır.',
    type: 'special_day',
    emoji: '⭐',
    link: '/campaigns',
  },
  {
    date: '2026-12-18',
    title: 'Uluslararası Göçmenler Günü',
    description: 'Göçmen öğrencilerin eğitime erişimini destekleyin.',
    type: 'special_day',
    emoji: '🌐',
    link: '/campaigns',
  },
  {
    date: '2026-12-20',
    title: 'Uluslararası İnsani Dayanışma Günü',
    description: 'Dayanışma bir bağışla başlar.',
    type: 'special_day',
    emoji: '🫂',
    link: '/campaigns',
  },
];
