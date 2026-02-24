'use client';

import React, { useRef, useEffect, useState } from 'react';
import { X, Minus, Send, RotateCcw } from 'lucide-react';
import type { ChatMessage, ChatStep, DonorPreferences, RecommendedCampaign } from '@/types/ai-assistant';
import { MessageBubble } from './MessageBubble';
import { QuickReplyButtons } from './QuickReplyButtons';
import { RecommendationCard } from './RecommendationCard';
import { TypingIndicator } from './TypingIndicator';
import {
  getWelcomeMessage,
  getStepMessage,
  getNextStep,
  getSearchingMessage,
  getNoResultsMessage,
  getFaqPrompt,
  getFaqNotFound,
  getAfterResultsMessage,
  userMessage,
  botMessage,
  msgId,
} from '@/lib/ai-assistant/chat-flow';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

export function ChatWindow({ isOpen, onClose, onMinimize }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<ChatStep>('welcome');
  const [preferences, setPreferences] = useState<DonorPreferences>({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedCampaign[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([getWelcomeMessage()]);
    }
  }, [messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, recommendations]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  /** Add a bot message with a typing delay */
  const addBotMessage = async (msg: ChatMessage, delayMs = 600) => {
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, delayMs));
    setIsTyping(false);
    setMessages((prev) => [...prev, msg]);
  };

  /** Fetch recommendations from the API */
  const fetchRecommendations = async (prefs: DonorPreferences) => {
    try {
      const res = await fetch('/api/assistant/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: prefs, limit: 3 }),
      });
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setRecommendations(data.data);
        const resultMsg = botMessage(
          `Sana ${data.data.length} öğrenci buldum! İşte en uygun eşleşmeler:`
        );
        await addBotMessage(resultMsg, 800);
        // After showing results, show "anything else?" after a delay
        setTimeout(async () => {
          await addBotMessage(getAfterResultsMessage(), 1500);
        }, 2000);
      } else {
        await addBotMessage(getNoResultsMessage(), 800);
      }
    } catch (error) {
      console.error('Recommendation fetch error:', error);
      await addBotMessage(
        botMessage('Bir hata oluştu 😔 Lütfen tekrar dene.'),
        500
      );
    }
  };

  /** Fetch FAQ answer */
  const fetchFaqAnswer = async (query: string) => {
    try {
      const res = await fetch('/api/assistant/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.success && data.data.answer) {
        await addBotMessage(botMessage(data.data.answer), 600);
        // Show related questions if any
        if (data.data.relatedQuestions?.length > 0) {
          const relatedMsg = botMessage(
            'İlgili sorular:',
            data.data.relatedQuestions.map((q: string) => ({
              label: q,
              value: `faq:${q}`,
            }))
          );
          await addBotMessage(relatedMsg, 400);
        }
        // Show continue options
        await addBotMessage(
          botMessage('Başka nasıl yardımcı olabilirim?', [
            { label: '🎓 Öğrenci bul', value: 'find_student' },
            { label: '❓ Başka sorum var', value: 'ask_faq' },
            { label: '👋 Teşekkürler', value: 'dismiss' },
          ]),
          300
        );
      } else {
        await addBotMessage(getFaqNotFound(), 600);
      }
    } catch (error) {
      console.error('FAQ fetch error:', error);
      await addBotMessage(getFaqNotFound(), 500);
    }
  };

  /** Handle a quick-reply selection or navigate the flow */
  const handleQuickReply = async (value: string, label: string) => {
    // Add user's choice as a message
    setMessages((prev) => [...prev, userMessage(label)]);
    setRecommendations([]); // Clear previous recommendations

    // Handle special actions
    if (value === 'dismiss') {
      await addBotMessage(
        botMessage('İyi günler! Yardıma ihtiyacın olursa buradayım 😊'),
      );
      return;
    }

    if (value === 'find_student') {
      // Reset preferences and start flow
      setPreferences({});
      setCurrentStep('ask_field');
      await addBotMessage(getStepMessage('ask_field'));
      return;
    }

    if (value === 'ask_faq') {
      setCurrentStep('faq');
      await addBotMessage(getFaqPrompt());
      return;
    }

    if (value.startsWith('faq:')) {
      const question = value.replace('faq:', '');
      setMessages((prev) => [...prev, userMessage(question)]);
      await fetchFaqAnswer(question);
      return;
    }

    // Handle flow step responses
    const newPrefs = { ...preferences };

    switch (currentStep) {
      case 'ask_field':
        newPrefs.field = value;
        break;
      case 'ask_gender':
        newPrefs.gender = value;
        break;
      case 'ask_budget':
        newPrefs.budget = value;
        break;
      case 'ask_priority':
        newPrefs.priority = value;
        break;
      case 'ask_country':
        newPrefs.country = value;
        break;
    }

    setPreferences(newPrefs);

    const nextStep = getNextStep(currentStep);

    if (nextStep === 'searching' || currentStep === 'ask_country') {
      // All questions answered — fetch recommendations
      setCurrentStep('searching');
      await addBotMessage(getSearchingMessage(), 400);
      setCurrentStep('results');
      await fetchRecommendations(newPrefs);
    } else {
      setCurrentStep(nextStep);
      await addBotMessage(getStepMessage(nextStep));
    }
  };

  /** Handle free-text input (mainly for FAQ) */
  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text) return;

    setInputValue('');
    setMessages((prev) => [...prev, userMessage(text)]);

    if (currentStep === 'faq') {
      await fetchFaqAnswer(text);
    } else {
      // Try FAQ if user types freely at any point
      await fetchFaqAnswer(text);
    }
  };

  /** Handle Enter key */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /** Reset the conversation */
  const handleReset = () => {
    setMessages([getWelcomeMessage()]);
    setCurrentStep('welcome');
    setPreferences({});
    setRecommendations([]);
    setInputValue('');
    setIsTyping(false);
  };

  // Find the last bot message that has quick replies
  const lastBotMsgWithReplies = [...messages]
    .reverse()
    .find((m) => m.sender === 'bot' && m.quickReplies && m.quickReplies.length > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-[9999] overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-sm">🎓</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">FundEd Asistan</h3>
            <p className="text-[10px] text-blue-100">Size en uygun öğrenciyi bulalım</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Sohbeti sıfırla"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onMinimize}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Küçült"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Messages Area ────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 scroll-smooth"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-2">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={rec.campaign_id} campaign={rec} rank={i + 1} />
            ))}
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}

        {/* Quick replies (show only for the latest message) */}
        {lastBotMsgWithReplies && !isTyping && (
          <QuickReplyButtons
            replies={lastBotMsgWithReplies.quickReplies!}
            onSelect={handleQuickReply}
            disabled={isTyping}
          />
        )}
      </div>

      {/* ── Input Area ───────────────────────────────────────────── */}
      <div className="border-t border-gray-200 px-3 py-2 flex items-center gap-2 flex-shrink-0 bg-gray-50">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mesajını yaz..."
          className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 bg-white transition-colors"
          disabled={isTyping}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isTyping}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
