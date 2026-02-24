'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MessageCircle,
  Send,
  User,
  ChevronRight,
} from 'lucide-react';

interface ConversationThread {
  donor_id: string;
  donor_name: string;
  campaign_id: string;
  campaign_title: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  anonymous: boolean;
}

interface Message {
  message_id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  content: string;
  type: string;
  read: boolean;
  created_at: string;
}

export default function StudentMessagesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const preselectedCampaign = searchParams.get('campaign') || '';
  const preselectedDonor = searchParams.get('donor') || '';

  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [activeThread, setActiveThread] = useState<ConversationThread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const userId = (session?.user as any)?.id;

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/student/messages/threads');
      if (res.ok) {
        const data = await res.json();
        setThreads(data.data ?? []);

        // Auto-open thread if donor/campaign is specified
        if (preselectedDonor && preselectedCampaign) {
          const match = (data.data ?? []).find(
            (t: ConversationThread) =>
              t.donor_id === preselectedDonor && t.campaign_id === preselectedCampaign,
          );
          if (match) {
            openThread(match);
          } else {
            // Create a placeholder thread for new conversation
            setActiveThread({
              donor_id: preselectedDonor,
              donor_name: 'Bağışçı',
              campaign_id: preselectedCampaign,
              campaign_title: '',
              last_message: '',
              last_message_at: '',
              unread_count: 0,
              anonymous: false,
            });
          }
        }
      }
    } catch {
      toast.error('Mesajlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [preselectedDonor, preselectedCampaign]);

  useEffect(() => {
    if (session) fetchThreads();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [session, fetchThreads]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openThread = async (thread: ConversationThread) => {
    setActiveThread(thread);
    setMessagesLoading(true);

    // Clear old polling
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    try {
      await loadMessages(thread);

      // Mark as read
      await fetch('/api/student/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: thread.campaign_id,
          donor_id: thread.donor_id,
        }),
      });

      // Update unread count in thread list
      setThreads((prev) =>
        prev.map((t) =>
          t.donor_id === thread.donor_id && t.campaign_id === thread.campaign_id
            ? { ...t, unread_count: 0 }
            : t,
        ),
      );

      // Start polling for new messages
      pollIntervalRef.current = setInterval(() => {
        loadMessages(thread);
      }, 5000);
    } catch {
      toast.error('Mesajlar yüklenemedi');
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadMessages = async (thread: ConversationThread) => {
    const res = await fetch(
      `/api/student/messages?campaign_id=${thread.campaign_id}&donor_id=${thread.donor_id}`,
    );
    if (res.ok) {
      const data = await res.json();
      setMessages(data.data ?? []);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeThread) return;

    setSending(true);
    try {
      const res = await fetch('/api/student/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: activeThread.campaign_id,
          recipient_id: activeThread.donor_id,
          content: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage('');
        // Immediately reload messages
        await loadMessages(activeThread);
      } else {
        const errData = await res.json();
        toast.error(errData.error?.message || 'Mesaj gönderilemedi');
      }
    } catch {
      toast.error('Mesaj gönderilirken hata oluştu');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/student/panel">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mesajlar</h1>
          <p className="text-gray-500 text-sm">
            Sadece size bağış yapan donörlerle iletişim kurabilirsiniz.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Thread List */}
          <div className={`w-full md:w-80 border-r flex-shrink-0 flex flex-col ${activeThread ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-900">Konuşmalar</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : threads.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Henüz mesajınız yok</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Bağışçılarınızdan mesaj geldiğinde burada görünür.
                  </p>
                </div>
              ) : (
                threads.map((thread) => {
                  const isActive =
                    activeThread?.donor_id === thread.donor_id &&
                    activeThread?.campaign_id === thread.campaign_id;
                  return (
                    <button
                      key={`${thread.donor_id}-${thread.campaign_id}`}
                      onClick={() => openThread(thread)}
                      className={`w-full p-4 text-left flex items-center gap-3 border-b hover:bg-gray-50 transition-colors ${
                        isActive ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium flex-shrink-0">
                        {thread.anonymous ? '?' : thread.donor_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {thread.anonymous ? 'Anonim Bağışçı' : thread.donor_name}
                          </p>
                          {thread.unread_count > 0 && (
                            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                              {thread.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-blue-600 truncate">{thread.campaign_title}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {thread.last_message}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!activeThread ? 'hidden md:flex' : 'flex'}`}>
            {!activeThread ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <MessageCircle className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500">Bir konuşma seçin</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Sol taraftaki listeden bir bağışçı seçerek mesajlaşmaya başlayın.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveThread(null);
                      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                    }}
                    className="md:hidden p-1 rounded hover:bg-gray-200"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                    {activeThread.anonymous
                      ? '?'
                      : activeThread.donor_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {activeThread.anonymous ? 'Anonim Bağışçı' : activeThread.donor_name}
                    </p>
                    {activeThread.campaign_title && (
                      <p className="text-xs text-gray-500 truncate">
                        {activeThread.campaign_title}
                      </p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messagesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                        >
                          <Skeleton className="h-10 w-48 rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <p className="text-gray-400 text-sm">Henüz mesaj yok</p>
                        <p className="text-gray-400 text-xs mt-1">
                          İlk mesajı göndererek konuşmayı başlatın.
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.sender_id === userId;
                      return (
                        <div
                          key={msg.message_id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isOwn
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwn ? 'text-blue-200' : 'text-gray-400'
                              }`}
                            >
                              {new Date(msg.created_at).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Mesajınızı yazın..."
                      rows={1}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-24"
                      maxLength={1000}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      size="sm"
                      className="h-10"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
