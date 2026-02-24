'use client';

import React, { useRef, useEffect, useState } from 'react';
import { X, Minus, Send, RotateCcw } from 'lucide-react';
import type { ChatMessage, ChatStep, DonorPreferences, RecommendedCampaign } from '@/types/ai-assistant';
import { MessageBubble } from './MessageBubble';
import { QuickReplyButtons } from './QuickReplyButtons';
import { RecommendationCard } from './RecommendationCard';
import { TypingIndicator } from './TypingIndicator';
import {
  getStepMessage,
  getNextStep,
  getSearchingMessage,
  getNoResultsMessage,
  getAfterResultsMessage,
  userMessage,
  botMessage,
} from '@/lib/ai-assistant/chat-flow';
import type { ChatEngineResponse } from '@/lib/ai-assistant/chat-engine';

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

  // Initialize with welcome message from chat engine
  useEffect(() => {
    if (messages.length === 0) {
      (async () => {
        try {
          const res = await fetch('/api/assistant/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'welcome' }),
          });
          const data: ChatEngineResponse = await res.json();
          const welcomeMessages = data.messages.map((m) => ({
            ...m,
            quickReplies: undefined,
          }));
          // Attach quick replies to the last welcome message
          if (data.quickReplies && welcomeMessages.length > 0) {
            welcomeMessages[welcomeMessages.length - 1].quickReplies = data.quickReplies;
          }
          setMessages(welcomeMessages);
        } catch {
          setMessages([botMessage('Merhaba! 👋 Size nasıl yardımcı olabilirim?', [
            { id: 'find', label: '🎯 Öğrenci bul', value: 'find_student' },
            { id: 'how', label: '❓ Nasıl çalışır?', value: 'ask_how' },
          ])]);
        }
      })();
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

  /** Fetch AI response from the chat engine (knowledge base powered) */
  const fetchChatResponse = async (text: string) => {
    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', text, currentStep }),
      });
      const data: ChatEngineResponse = await res.json();

      // If the chat engine says to start the find-student flow
      if (data.nextStep && !['idle', 'welcome', 'faq', 'faq_answer'].includes(data.nextStep)) {
        // Engine returned a step message (e.g. ask_field)
        if (data.messages.length > 0) {
          for (const msg of data.messages) {
            await addBotMessage(msg, 500);
          }
          // Attach quick replies to the last message
          if (data.quickReplies && data.quickReplies.length > 0) {
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = {
                ...copy[copy.length - 1],
                quickReplies: data.quickReplies,
              };
              return copy;
            });
          }
        } else {
          // Fallback to local step message
          await addBotMessage(getStepMessage(data.nextStep as ChatStep));
        }
        setCurrentStep(data.nextStep as ChatStep);
        return;
      }

      // Normal KB answer
      if (data.messages.length > 0) {
        for (let i = 0; i < data.messages.length; i++) {
          const isLast = i === data.messages.length - 1;
          const msg = { ...data.messages[i] };
          // Attach quick replies only to the last message
          if (isLast && data.quickReplies && data.quickReplies.length > 0) {
            msg.quickReplies = data.quickReplies;
          }
          await addBotMessage(msg, i === 0 ? 600 : 400);
        }
      } else {
        await addBotMessage(
          botMessage('Hmm, bunu tam anlayamadım 🤔 Başka türlü sormayı dener misiniz?', [
            { id: 'find', label: '🎯 Öğrenci bul', value: 'find_student' },
            { id: 'how', label: '❓ Nasıl çalışır?', value: 'ask_how' },
          ]),
          500,
        );
      }
    } catch (error) {
      console.error('Chat engine error:', error);
      await addBotMessage(
        botMessage('Bir hata oluştu 😔 Lütfen tekrar deneyin.'),
        500,
      );
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
      await addBotMessage(botMessage('Sorunuzu yazabilirsiniz, size yardımcı olmaya çalışacağım! 🤓'));
      return;
    }

    if (value === 'ask_how') {
      await fetchChatResponse('FundEd nasıl çalışır?');
      return;
    }

    if (value === 'ask_trust') {
      await fetchChatResponse('FundEd güvenilir mi?');
      return;
    }

    if (value === 'browse') {
      await addBotMessage(botMessage('Kampanyalar sayfasına gidin: /campaigns\n\nOrada tüm aktif kampanyaları inceleyebilirsiniz! 📋'));
      return;
    }

    if (value === 'home') {
      // Reset to welcome state
      handleReset();
      return;
    }

    if (value === 'motivation') {
      await fetchChatResponse('ilham ver');
      return;
    }

    if (value.startsWith('faq:')) {
      const faqId = value.replace('faq:', '');
      // Could be a knowledge base ID or a question text
      await fetchChatResponse(faqId);
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

  /** Handle free-text input — routed through the chat engine */
  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text) return;

    setInputValue('');
    setMessages((prev) => [...prev, userMessage(text)]);

    // Always use the smart chat engine (knowledge base + intent detection)
    await fetchChatResponse(text);
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
    setMessages([]);
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
