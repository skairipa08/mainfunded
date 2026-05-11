import type { ChatStep, ChatMessage, QuickReply, DonorPreferences } from '@/types/ai-assistant';

// ─── Chat Flow Definitions ──────────────────────────────────────────
// Each step in the guided conversation with quick-reply options.

/** Generate a unique message ID */
export function msgId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Build a bot message */
export function botMessage(
  text: string,
  quickReplies?: QuickReply[],
): ChatMessage {
  return {
    id: msgId(),
    sender: 'bot',
    text,
    timestamp: Date.now(),
    quickReplies,
  };
}

/** Build a user message */
export function userMessage(text: string): ChatMessage {
  return {
    id: msgId(),
    sender: 'user',
    text,
    timestamp: Date.now(),
  };
}

// ─── Step definitions ───────────────────────────────────────────────

export function getWelcomeMessage(): ChatMessage {
  return botMessage(
    'Merhaba! 👋 Sana en uygun öğrenciyi bulmana yardımcı olabilirim. Birkaç soru ile mükemmel eşleşmeyi bulalım!\n\nNe yapmak istersin?',
    [
      { label: '🎓 Öğrenci bul', value: 'find_student' },
      { label: '❓ Soru sor', value: 'ask_faq' },
    ]
  );
}

export function getProactiveTriggerMessage(type: 'idle' | 'scroll' | 'exit' | 'return'): ChatMessage {
  const messages: Record<string, string> = {
    idle: 'Kampanyalar arasında gezindiğini fark ettim 😊 Sana en uygun öğrenciyi bulmama izin ver — sadece birkaç soru!',
    scroll: 'Birçok harika öğrenci var, biliyorum! 🎓 Birkaç soruyla sana en uygun olanı bulabilirim.',
    exit: 'Gitmeden önce — 30 saniyede sana mükemmel eşleşmeyi bulabilirim! 💝',
    return: 'Tekrar hoş geldin! 👋 Geçen sefer baktığın öğrenciler hâlâ desteğini bekliyor.',
  };

  return botMessage(
    messages[type] || messages.idle,
    [
      { label: '🎓 Öğrenci öner', value: 'find_student' },
      { label: 'Hayır, teşekkürler', value: 'dismiss' },
    ]
  );
}

export function getFieldQuestion(): ChatMessage {
  return botMessage(
    'Hangi alanla ilgileniyorsun?',
    [
      { label: '💻 Mühendislik', value: 'engineering' },
      { label: '🏥 Tıp / Sağlık', value: 'medicine' },
      { label: '⚖️ Hukuk', value: 'law' },
      { label: '🎨 Sanat / Tasarım', value: 'arts' },
      { label: '📊 İşletme / İktisat', value: 'business' },
      { label: '🤷 Farketmez', value: 'any' },
    ]
  );
}

export function getGenderQuestion(): ChatMessage {
  return botMessage(
    'Nasıl bir öğrenciyi desteklemek istersin?',
    [
      { label: '👩 Kız öğrenci', value: 'female' },
      { label: '👨 Erkek öğrenci', value: 'male' },
      { label: '🤷 Farketmez', value: 'any' },
    ]
  );
}

export function getBudgetQuestion(): ChatMessage {
  return botMessage(
    'Bütçen ne kadar?',
    [
      { label: '₺50 – ₺100', value: '50-100' },
      { label: '₺100 – ₺500', value: '100-500' },
      { label: '₺500+', value: '500+' },
      { label: '🤷 Belirli bir rakamım yok', value: 'any' },
    ]
  );
}

export function getPriorityQuestion(): ChatMessage {
  return botMessage(
    'Sana en çok hangisi hitap eder?',
    [
      { label: '🆘 Acil ihtiyacı olan', value: 'urgent' },
      { label: '⭐ Başarılı ama desteğe muhtaç', value: 'high-achiever' },
      { label: '🏁 Hedefe en yakın olan', value: 'almost-there' },
      { label: '🤷 Farketmez', value: 'any' },
    ]
  );
}

export function getCountryQuestion(): ChatMessage {
  return botMessage(
    'Bir ülke tercihin var mı?',
    [
      { label: '🇹🇷 Türkiye', value: 'Turkey' },
      { label: '🌍 Farketmez', value: 'any' },
    ]
  );
}

export function getSearchingMessage(): ChatMessage {
  return botMessage('Sana en uygun öğrencileri arıyorum... 🔍');
}

export function getNoResultsMessage(): ChatMessage {
  return botMessage(
    'Üzgünüm, şu an tercihlerine uygun aktif kampanya bulamadım. 😔 Kriterleri değiştirmek ister misin?',
    [
      { label: '🔄 Tekrar dene', value: 'find_student' },
      { label: '❓ Soru sor', value: 'ask_faq' },
    ]
  );
}

export function getFaqPrompt(): ChatMessage {
  return botMessage(
    'Merak ettiğin şeyi yaz, sana hemen cevap vereyim! Örneğin:\n• Bağışım güvende mi?\n• Vergi indirimi alabilir miyim?\n• Öğrenciler nasıl doğrulanıyor?'
  );
}

export function getFaqNotFound(): ChatMessage {
  return botMessage(
    'Bu konuyu bilgi tabanımda bulamadım 🤔\n\nDestek ekibimize yazın: getsfunded@gmail.com',
    [
      { label: '📧 Mail gönder', value: 'support_email' },
      { label: '🎯 Öğrenci bul', value: 'find_student' },
      { label: '🏠 Ana menü', value: 'home' },
    ]
  );
}

export function getAfterResultsMessage(): ChatMessage {
  return botMessage(
    'Başka bir şey yapabilir miyim?',
    [
      { label: '🔄 Yeni arama', value: 'find_student' },
      { label: '❓ Soru sor', value: 'ask_faq' },
      { label: '👋 Teşekkürler', value: 'dismiss' },
    ]
  );
}

/** Determine the next step after the current one */
export function getNextStep(currentStep: ChatStep): ChatStep {
  const flow: ChatStep[] = [
    'welcome',
    'ask_field',
    'ask_budget',
    'ask_priority',
    'searching',
    'results',
  ];
  const idx = flow.indexOf(currentStep);
  if (idx === -1 || idx >= flow.length - 1) return 'results';
  return flow[idx + 1];
}

/** Get the message for a specific step */
export function getStepMessage(step: ChatStep): ChatMessage {
  switch (step) {
    case 'welcome': return getWelcomeMessage();
    case 'ask_field': return getFieldQuestion();
    case 'ask_gender': return getGenderQuestion();
    case 'ask_budget': return getBudgetQuestion();
    case 'ask_priority': return getPriorityQuestion();
    case 'ask_country': return getCountryQuestion();
    case 'searching': return getSearchingMessage();
    case 'faq': return getFaqPrompt();
    case 'faq_answer': return getFaqNotFound();
    default: return getWelcomeMessage();
  }
}
