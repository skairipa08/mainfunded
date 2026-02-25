// ═══════════════════════════════════════════════════════════════
// FundEd AI Assistant — Chat Engine
// Knowledge base entegrasyonlu merkezi sohbet motoru
// ═══════════════════════════════════════════════════════════════

import {
  searchKnowledge,
  getFallbackResponse,
  getTimeBasedGreeting,
  getUpcomingSpecialDay,
  getTodaySpecialDay,
  getRandomMotivation,
  type KnowledgeEntry,
  type SpecialDayInfo,
} from './knowledge-base';
import { getStepMessage, getNextStep, botMessage } from './chat-flow';
import type { ChatMessage, ChatStep, QuickReply, DonorPreferences } from '@/types/ai-assistant';

export interface ChatEngineResponse {
  messages: ChatMessage[];
  quickReplies?: QuickReply[];
  nextStep?: ChatStep;
  shouldFetchRecommendations?: boolean;
  preferences?: Partial<DonorPreferences>;
}

// ─── Kelime bazlı intent tespiti ─────────────────────────────

type UserIntent =
  | 'greeting'
  | 'find_student'
  | 'faq'
  | 'motivation'
  | 'farewell'
  | 'thanks'
  | 'unknown';

function detectIntent(text: string): UserIntent {
  const lower = text.toLowerCase();

  const patterns: { intent: UserIntent; words: string[] }[] = [
    {
      intent: 'greeting',
      words: ['merhaba', 'selam', 'hey', 'hi', 'hello', 'günaydın', 'iyi günler', 'naber'],
    },
    {
      intent: 'find_student',
      words: [
        'öğrenci bul',
        'öğrenci öner',
        'eşleştir',
        'kampanya öner',
        'bağış yap',
        'birine yardım',
        'karar veremedim',
        'seçemedim',
        'öner',
        'uygun öğrenci',
      ],
    },
    {
      intent: 'motivation',
      words: ['ilham', 'motive', 'motivasyon', 'söz', 'quote', 'ilham ver'],
    },
    {
      intent: 'farewell',
      words: ['görüşürüz', 'bye', 'hoşça kal', 'güle güle', 'bb', 'bay bay'],
    },
    {
      intent: 'thanks',
      words: ['teşekkür', 'sağol', 'sağ ol', 'harika', 'eyvallah', 'tşk', 'thx'],
    },
  ];

  for (const { intent, words } of patterns) {
    for (const word of words) {
      if (lower.includes(word)) return intent;
    }
  }

  return 'faq';
}

// ─── Hoşgeldin mesajı ────────────────────────────────────────

export function generateWelcomeResponse(): ChatEngineResponse {
  const greeting = getTimeBasedGreeting();
  const specialDay = getUpcomingSpecialDay();

  const lines = [
    `${greeting} Ben FundEd AI Asistanıyım! 🤖`,
    '',
    '🎯 Size uygun öğrenci bulabilirim',
    '❓ Platform hakkında sorularınızı yanıtlayabilirim',
    '💝 Bağış süreci hakkında bilgi verebilirim',
  ];

  if (specialDay) {
    const prefix =
      specialDay.daysLeft === 0
        ? `Bugün ${specialDay.emoji} ${specialDay.title}!`
        : `${specialDay.daysLeft} gün sonra ${specialDay.emoji} ${specialDay.title}!`;
    lines.push('', prefix, 'Bu özel günde bir öğrenciye destek olmak ister misiniz?');
  }

  return {
    messages: [botMessage(lines.join('\n'))],
    quickReplies: [
      { label: '🎯 Öğrenci bul', value: 'find_student' },
      { label: '❓ Nasıl çalışır?', value: 'ask_how' },
      { label: '🔒 Güvenilir mi?', value: 'ask_trust' },
      { label: '📋 Kampanyaları gör', value: 'browse' },
    ],
  };
}

// ─── Proactive trigger mesajı ────────────────────────────────

export function generateProactiveResponse(): ChatEngineResponse {
  const specialDay = getUpcomingSpecialDay();

  let text: string;
  if (specialDay && specialDay.daysLeft === 0) {
    text = `${specialDay.emoji} Bugün ${specialDay.title}!\n\n💝 ${specialDay.description}\n\nBu anlamlı günde bir öğrenciye destek olmak ister misiniz?`;
  } else if (specialDay && specialDay.daysLeft === 1) {
    text = `${specialDay.emoji} Yarın ${specialDay.title}! ${specialDay.description} Bu özel günü bir bağışla kutlayın!`;
  } else {
    text =
      'Kampanyaları incelediğinizi gördüm! 👀 Size en uygun öğrenciyi bulmamı ister misiniz?';
  }

  return {
    messages: [botMessage(text)],
    quickReplies: [
      { label: '💝 Bağış Yap', value: 'donate_now' },
      { label: '🎯 Öğrenci Bul', value: 'find_student' },
      { label: '🙅 Hayır, teşekkürler', value: 'dismiss' },
    ],
  };
}

// ─── Özel gün banner mesajı (widget otomatik açılır) ─────────

export interface SpecialDayBannerData {
  isSpecialDay: boolean;
  title: string;
  emoji: string;
  description: string;
  link: string;
  message: string;
  quickReplies: QuickReply[];
}

export function generateSpecialDayBanner(): SpecialDayBannerData | null {
  const today = getTodaySpecialDay();
  if (!today) return null;

  const ctaMessages = [
    `${today.emoji} Bugün ${today.title}!\n\n${today.description}\n\n💝 Bu anlamlı günde bir öğrencinin eğitimine destek olarak fark yaratın!`,
    `${today.emoji} Bugün özel bir gün: ${today.title}!\n\n${today.description}\n\n🌟 Bağışınızla bu günü daha da anlamlı kılın!`,
    `${today.emoji} ${today.title} kutlu olsun!\n\n${today.description}\n\n💙 Bir bağış, bir hayatı değiştirebilir. Bugün harekete geçin!`,
  ];

  const message = ctaMessages[Math.floor(Math.random() * ctaMessages.length)];

  return {
    isSpecialDay: true,
    title: today.title,
    emoji: today.emoji,
    description: today.description,
    link: today.link,
    message,
    quickReplies: [
      { label: '💝 Hemen Bağış Yap', value: 'donate_now' },
      { label: '🎯 Öğrenci Bul', value: 'find_student' },
      { label: '📋 Kampanyaları Gör', value: 'browse' },
    ],
  };
}

// ─── Kullanıcı mesajını işle ─────────────────────────────────

export function processUserMessage(
  text: string,
  currentStep?: ChatStep,
): ChatEngineResponse {
  const intent = detectIntent(text);

  // Eğer recommendation flow aktifse chat-flow'a devredilir (ChatWindow halleder)
  if (
    currentStep &&
    !['idle', 'welcome', 'faq', 'faq_answer'].includes(currentStep)
  ) {
    // Bu durumda ChatWindow kendi flow hâlâ yöntemiyle devam etsin
    return {
      messages: [],
      nextStep: currentStep,
    };
  }

  switch (intent) {
    case 'greeting': {
      return generateWelcomeResponse();
    }

    case 'find_student': {
      const step = getStepMessage('ask_field');
      return {
        messages: [botMessage(step.text)],
        quickReplies: step.quickReplies,
        nextStep: 'ask_field',
      };
    }

    case 'motivation': {
      const entry = getRandomMotivation();
      return {
        messages: [botMessage(entry.answer)],
        quickReplies: [
          { label: '🎯 Öğrenci bul', value: 'find_student' },
          { label: '✨ Başka bir ilham', value: 'motivation' },
        ],
      };
    }

    case 'farewell': {
      const result = searchKnowledge('görüşürüz');
      return {
        messages: [botMessage(result.entry?.answer ?? 'Görüşürüz! 👋')],
      };
    }

    case 'thanks': {
      const result = searchKnowledge('teşekkür');
      return {
        messages: [botMessage(result.entry?.answer ?? 'Rica ederim! 😊')],
      };
    }

    case 'faq':
    default: {
      return processKnowledgeQuery(text);
    }
  }
}

// ─── Knowledge base sorgusu ──────────────────────────────────

function processKnowledgeQuery(query: string): ChatEngineResponse {
  const { entry, related } = searchKnowledge(query);

  if (!entry) {
    return {
      messages: [botMessage(getFallbackResponse())],
      quickReplies: [
        { label: '🎯 Öğrenci bul', value: 'find_student' },
        { label: '❓ Nasıl çalışır?', value: 'ask_how' },
        { label: '🔒 Güvenilir mi?', value: 'ask_trust' },
      ],
    };
  }

  const messages: ChatMessage[] = [botMessage(entry.answer)];

  if (entry.followUp) {
    messages.push(botMessage(entry.followUp));
  }

  // İlgili sorulardan quick reply oluştur
  // Sadece gerçekten ilişkili ve farklı konudaki soruları göster
  const quickReplies: QuickReply[] = related
    .filter((r) => r.question !== entry.question) // aynı soruyu tekrar gösterme
    .map((r) => ({
      label: `💡 ${r.question}`,
      value: `faq:${r.id}`,
    }));

  // Her zaman temel navigasyon seçeneklerini ekle
  quickReplies.push({ label: '🎯 Öğrenci bul', value: 'find_student' });
  quickReplies.push({ label: '🏠 Ana menü', value: 'home' });

  return {
    messages,
    quickReplies,
  };
}

// ─── ID ile bilgi tabanından cevap getir ─────────────────────

export function getKnowledgeById(id: string): ChatEngineResponse {
  const { KNOWLEDGE_BASE } = require('./knowledge-base');
  const entry = (KNOWLEDGE_BASE as KnowledgeEntry[]).find((e) => e.id === id);

  if (!entry) {
    return {
      messages: [botMessage(getFallbackResponse())],
    };
  }

  const messages: ChatMessage[] = [botMessage(entry.answer)];
  if (entry.followUp) messages.push(botMessage(entry.followUp));

  // Find related entries from the same category
  const related = (KNOWLEDGE_BASE as KnowledgeEntry[])
    .filter((e) => e.id !== id && e.category === entry.category)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 2);

  const quickReplies: QuickReply[] = related.map((r) => ({
    label: `💡 ${r.question}`,
    value: `faq:${r.id}`,
  }));

  if (!quickReplies.some((q) => q.value === 'find_student')) {
    quickReplies.push({ label: '🎯 Öğrenci bul', value: 'find_student' });
  }

  return {
    messages,
    quickReplies,
  };
}
