'use client';

import { useSession } from 'next-auth/react';
import { useTranslation } from "@/lib/i18n/context";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCurrency } from '@/lib/currency-context';
import {
  User, Heart, Target, Calendar, Mail, Shield, TrendingUp, BadgeCheck,
  ArrowRight, Phone, Globe, Lock, Save, CheckCircle2,
  MessageCircle, ChevronRight, Clock, Award, Settings, Download,
  Eye, BookOpen, CreditCard, BarChart3, Search, Bell, ExternalLink,
  GraduationCap, Wallet, Activity, Star, Receipt, FileText, Send,
  RefreshCw, AlertCircle, X, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// ── Types ──────────────────────────────────────────────
interface VerificationStatus {
  verification_id: string;
  status: string;
  tier_requested?: number;
  tier_approved?: number;
}

interface Donation {
  donation_id: string;
  campaign_id: string;
  amount: number;
  currency: string;
  created_at: string;
  payment_status: string;
  donor_name: string;
  campaign: {
    campaign_id: string;
    title: string;
    category: string;
    status: string;
  } | null;
  student: {
    name: string;
    image: string | null;
    university: string;
    department: string;
  } | null;
}

interface DonationSummary {
  totalAmount: number;
  totalDonations: number;
  supportedStudents: number;
  lastDonationDate: string | null;
}

interface ConversationThread {
  campaign_id: string;
  campaign_title: string;
  student_name: string;
  student_image: string | null;
  last_message: string;
  last_message_date: string;
  unread_count: number;
  messages: Message[];
}

interface Message {
  message_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  type: string;
  read: boolean;
}

// ── Sidebar Nav Item ───────────────────────────────────
function SidebarItem({ icon: Icon, label, active, onClick, badge }: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
        ${active
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${active ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Stat Card ──────────────────────────────────────────
function StatCard({ icon: Icon, value, label, trend, color, onClick }: {
  icon: any;
  value: string;
  label: string;
  trend?: string;
  color: string;
  onClick?: () => void;
}) {
  const colorMap: Record<string, { bg: string; icon: string; ring: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'ring-blue-100' },
    red: { bg: 'bg-red-50', icon: 'text-red-500', ring: 'ring-red-100' },
    green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'ring-purple-100' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-500', ring: 'ring-orange-100' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${c.bg} ring-4 ${c.ring}`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

// ── Donation Row ───────────────────────────────────────
function DonationRow({ donation, formatAmount }: { donation: Donation; formatAmount: (n: number) => string }) {
    const { t } = useTranslation();
  const statusColors: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
  };

  return (
    <Link
      href={`/my-donations/${donation.donation_id}`}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200"
    >
      {/* Student Avatar */}
      <div className="relative flex-shrink-0">
        {donation.student?.image ? (
          <Image
            src={donation.student.image}
            alt={donation.student.name}
            width={44}
            height={44}
            className="rounded-full object-cover ring-2 ring-gray-100"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
            {donation.student?.name?.charAt(0) || donation.campaign?.title?.charAt(0) || '?'}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 truncate text-sm">
            {donation.campaign?.title || 'Kampanya'}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
          {donation.student?.name && (
            <>
              <GraduationCap className="h-3 w-3" />
              {donation.student.name}
              {donation.student.university && ` · ${donation.student.university}`}
            </>
          )}
        </p>
      </div>

      {/* Amount & Date */}
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-gray-900 text-sm">{formatAmount(donation.amount)}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(donation.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
        </p>
      </div>

      {/* Status */}
      <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 hidden sm:inline-block ${statusColors[donation.payment_status] || 'bg-gray-100 text-gray-600'}`}>
        {donation.payment_status === 'paid' || donation.payment_status === 'completed' ? '✓ Tamamlandı' : donation.payment_status}
      </span>

      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
    </Link>
  );
}

// ── Conversation Preview ───────────────────────────────
function ConversationPreview({ thread, onClick }: { thread: ConversationThread; onClick: () => void }) {
    const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left group border border-transparent hover:border-gray-200"
    >
      <div className="relative flex-shrink-0">
        {thread.student_image ? (
          <Image
            src={thread.student_image}
            alt={thread.student_name}
            width={44}
            height={44}
            className="rounded-full object-cover ring-2 ring-gray-100"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
            {thread.student_name?.charAt(0) || '?'}
          </div>
        )}
        {thread.unread_count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {thread.unread_count}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-gray-900 truncate text-sm">{thread.student_name}</p>
          <span className="text-[11px] text-gray-400 flex-shrink-0">
            {new Date(thread.last_message_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{thread.campaign_title}</p>
        <p className="text-xs text-gray-400 truncate mt-1">{thread.last_message}</p>
      </div>

      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
    </button>
  );
}

// ── Quick Action Button ────────────────────────────────
function QuickAction({ icon: Icon, label, href, color }: { icon: any; label: string; href: string; color: string }) {
    const { t } = useTranslation();
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 ring-blue-100',
    red: 'bg-red-50 text-red-500 hover:bg-red-100 ring-red-100',
    green: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 ring-emerald-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 ring-purple-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 ring-orange-100',
  };

  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2.5 p-5 rounded-2xl hover:shadow-md transition-all duration-200 group border border-gray-100 hover:border-gray-200 bg-white"
    >
      <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.blue} transition-colors ring-4 ${colorMap[color]?.split(' ').pop() || 'ring-blue-100'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-medium text-gray-700 text-center leading-tight">{label}</span>
    </Link>
  );
}

// ══════════════════════════════════════════════════════
// ── Main Account Page ─────────────────────────────────
// ══════════════════════════════════════════════════════

type TabType = 'overview' | 'donations' | 'messages' | 'reports' | 'settings';

function AccountPageContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { formatAmount } = useCurrency();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(true);

  // Donations state
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donationSummary, setDonationSummary] = useState<DonationSummary>({
    totalAmount: 0, totalDonations: 0, supportedStudents: 0, lastDonationDate: null
  });
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [donationPage, setDonationPage] = useState(1);
  const [donationTotal, setDonationTotal] = useState(0);
  const [donationTotalPages, setDonationTotalPages] = useState(0);

  // Messages state
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ConversationThread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Personal info state
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    phoneCountryCode: '+90',
    phone: '',
    backupEmail: '',
    country: '',
    gender: '',
    dateOfBirth: '',
    language: 'tr',
    twoFactorEnabled: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [userAccountType, setUserAccountType] = useState<string>('student');

  // Mobile sidebar
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const COUNTRY_CODES = [
    { code: '+90', label: 'TR +90' },
    { code: '+1', label: 'US +1' },
    { code: '+44', label: 'UK +44' },
    { code: '+49', label: 'DE +49' },
    { code: '+33', label: 'FR +33' },
    { code: '+34', label: 'ES +34' },
    { code: '+971', label: 'AE +971' },
    { code: '+966', label: 'SA +966' },
  ];

  // Preview mode for demo
  const isPreviewMode = searchParams.get('preview') === 'true';
  const previewTier = parseInt(searchParams.get('tier') || '1');

  // ── Scroll chat to bottom ──
  useEffect(() => {
    if (selectedConversation && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation, selectedConversation?.messages?.length]);

  // ── Fetch donations ──
  const fetchDonations = useCallback(async (page: number = 1) => {
    try {
      setDonationsLoading(true);
      const res = await fetch(`/api/donations/my?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDonations(data.data.donations || []);
          setDonationSummary(data.data.summary || { totalAmount: 0, totalDonations: 0, supportedStudents: 0, lastDonationDate: null });
          setDonationTotal(data.data.pagination?.total || 0);
          setDonationTotalPages(data.data.pagination?.totalPages || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch donations:', err);
    } finally {
      setDonationsLoading(false);
    }
  }, []);

  // ── Build conversation threads from donations ──
  const buildConversationThreads = useCallback(async (donationsList: Donation[]) => {
    try {
      setMessagesLoading(true);
      const threads: ConversationThread[] = [];
      const seenCampaigns = new Set<string>();

      for (const d of donationsList) {
        if (!d.campaign_id || seenCampaigns.has(d.campaign_id)) continue;
        seenCampaigns.add(d.campaign_id);

        try {
          const res = await fetch(`/api/messages?campaign_id=${d.campaign_id}`);
          if (res.ok) {
            const data = await res.json();
            const msgs: Message[] = data.data || [];
            if (msgs.length > 0) {
              threads.push({
                campaign_id: d.campaign_id,
                campaign_title: d.campaign?.title || 'Kampanya',
                student_name: d.student?.name || 'Öğrenci',
                student_image: d.student?.image || null,
                last_message: msgs[msgs.length - 1].content,
                last_message_date: msgs[msgs.length - 1].created_at,
                unread_count: msgs.filter(m => !m.read && m.sender_id !== (session?.user as any)?.id).length,
                messages: msgs,
              });
            }
          }
        } catch {
          // skip
        }
      }

      setConversations(threads);
    } catch (err) {
      console.error('Failed to build threads:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, [session?.user]);

  // ── Redirect & init ──
  useEffect(() => {
    if (!isPreviewMode && status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/account');
    }
  }, [status, router, isPreviewMode]);

  useEffect(() => {
    if (isPreviewMode) {
      setVerification({
        verification_id: 'demo-123',
        status: 'APPROVED',
        tier_requested: previewTier,
        tier_approved: previewTier,
      });
      setVerificationLoading(false);

      // Demo donations
      setDonations([
        {
          donation_id: 'demo-d1', campaign_id: 'demo-c1', amount: 250, currency: 'USD',
          created_at: new Date().toISOString(), payment_status: 'completed', donor_name: 'Demo User',
          campaign: { campaign_id: 'demo-c1', title: 'Tıp Fakültesi Öğrencisi İçin Burs', category: 'education', status: 'active' },
          student: { name: 'Ayşe Yılmaz', image: null, university: 'İstanbul Üniversitesi', department: 'Tıp Fakültesi' }
        },
        {
          donation_id: 'demo-d2', campaign_id: 'demo-c2', amount: 150, currency: 'USD',
          created_at: new Date(Date.now() - 7 * 86400000).toISOString(), payment_status: 'completed', donor_name: 'Demo User',
          campaign: { campaign_id: 'demo-c2', title: 'Bilgisayar Mühendisliği Öğrencisi', category: 'education', status: 'active' },
          student: { name: 'Mehmet Kaya', image: null, university: 'ODTÜ', department: 'Bilgisayar Müh.' }
        },
        {
          donation_id: 'demo-d3', campaign_id: 'demo-c3', amount: 100, currency: 'USD',
          created_at: new Date(Date.now() - 30 * 86400000).toISOString(), payment_status: 'paid', donor_name: 'Demo User',
          campaign: { campaign_id: 'demo-c3', title: 'Hukuk Fakültesi Burs Kampanyası', category: 'education', status: 'active' },
          student: { name: 'Zeynep Demir', image: null, university: 'Ankara Üniversitesi', department: 'Hukuk' }
        },
        {
          donation_id: 'demo-d4', campaign_id: 'demo-c4', amount: 75, currency: 'USD',
          created_at: new Date(Date.now() - 45 * 86400000).toISOString(), payment_status: 'completed', donor_name: 'Demo User',
          campaign: { campaign_id: 'demo-c4', title: 'Mimarlık Öğrencisi Destek Fonu', category: 'education', status: 'active' },
          student: { name: 'Ali Öztürk', image: null, university: 'İTÜ', department: 'Mimarlık' }
        },
      ]);
      setDonationSummary({ totalAmount: 575, totalDonations: 4, supportedStudents: 4, lastDonationDate: new Date().toISOString() });
      setDonationsLoading(false);

      // Demo conversations
      setConversations([
        {
          campaign_id: 'demo-c1',
          campaign_title: 'Tıp Fakültesi Öğrencisi İçin Burs',
          student_name: 'Ayşe Yılmaz',
          student_image: null,
          last_message: 'Desteğiniz için çok teşekkür ederim! Sınav sonuçlarım çok iyi geldi.',
          last_message_date: new Date().toISOString(),
          unread_count: 1,
          messages: [
            { message_id: 'm1', sender_id: 'student-1', sender_name: 'Ayşe Yılmaz', content: 'Merhaba, bağışınız için çok teşekkür ederim! Bu destek benim için çok önemli.', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), type: 'student_to_donor', read: true },
            { message_id: 'm2', sender_id: 'demo-user', sender_name: 'Demo User', content: 'Rica ederim Ayşe, başarılar dilerim! Eğitim hayatın boyunca yanındayız.', created_at: new Date(Date.now() - 86400000).toISOString(), type: 'donor_to_student', read: true },
            { message_id: 'm3', sender_id: 'student-1', sender_name: 'Ayşe Yılmaz', content: 'Desteğiniz için çok teşekkür ederim! Sınav sonuçlarım çok iyi geldi.', created_at: new Date().toISOString(), type: 'student_to_donor', read: false },
          ]
        },
        {
          campaign_id: 'demo-c2',
          campaign_title: 'Bilgisayar Mühendisliği Öğrencisi',
          student_name: 'Mehmet Kaya',
          student_image: null,
          last_message: 'Staj başvurum kabul edildi! Google\'da staj yapacağım.',
          last_message_date: new Date(Date.now() - 172800000).toISOString(),
          unread_count: 0,
          messages: [
            { message_id: 'm4', sender_id: 'student-2', sender_name: 'Mehmet Kaya', content: 'Merhaba! Desteğiniz sayesinde yeni bir laptop alabildim ve projelerime devam edebiliyorum.', created_at: new Date(Date.now() - 5 * 86400000).toISOString(), type: 'student_to_donor', read: true },
            { message_id: 'm5', sender_id: 'demo-user', sender_name: 'Demo User', content: 'Harika! Projelerini görmek isterim.', created_at: new Date(Date.now() - 3 * 86400000).toISOString(), type: 'donor_to_student', read: true },
            { message_id: 'm6', sender_id: 'student-2', sender_name: 'Mehmet Kaya', content: 'Staj başvurum kabul edildi! Google\'da staj yapacağım.', created_at: new Date(Date.now() - 172800000).toISOString(), type: 'student_to_donor', read: true },
          ]
        },
      ]);
      setMessagesLoading(false);
      return;
    }

    if (session?.user) {
      fetch('/api/verification')
        .then(res => res.json())
        .then(data => { if (data.verification) setVerification(data.verification); })
        .catch(console.error)
        .finally(() => setVerificationLoading(false));

      // Load saved personal info from database
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const { accountType: acType, ...profileData } = data.data;
            setPersonalInfo(prev => ({
              ...prev,
              ...profileData,
            }));
            if (acType) setUserAccountType(acType);
          }
        })
        .catch(err => console.error('Failed to load profile:', err));

      fetchDonations(1);
    }
  }, [session, isPreviewMode, previewTier, fetchDonations]);

  // Load conversations after donations
  useEffect(() => {
    if (!isPreviewMode && donations.length > 0 && session?.user) {
      buildConversationThreads(donations);
    }
  }, [donations, isPreviewMode, session?.user, buildConversationThreads]);

  // ── Send message ──
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;
    setSendingMessage(true);

    if (isPreviewMode) {
      // Demo mode: just add locally
      const msg: Message = {
        message_id: `msg-${Date.now()}`,
        sender_id: 'demo-user',
        sender_name: 'Demo User',
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        type: 'donor_to_student',
        read: true,
      };
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, msg],
        last_message: msg.content,
        last_message_date: msg.created_at,
      } : null);
      setConversations(prev => prev.map(c =>
        c.campaign_id === selectedConversation.campaign_id
          ? { ...c, last_message: msg.content, last_message_date: msg.created_at, messages: [...c.messages, msg] }
          : c
      ));
      setNewMessage('');
      setSendingMessage(false);
      return;
    }

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: selectedConversation.campaign_id,
          content: newMessage.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const msg: Message = {
          message_id: data.data?.message_id || `msg-${Date.now()}`,
          sender_id: (session?.user as any)?.id || 'me',
          sender_name: session?.user?.name || 'Ben',
          content: newMessage.trim(),
          created_at: new Date().toISOString(),
          type: 'donor_to_student',
          read: true,
        };
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages, msg],
          last_message: msg.content,
          last_message_date: msg.created_at,
        } : null);
        setConversations(prev => prev.map(c =>
          c.campaign_id === selectedConversation.campaign_id
            ? { ...c, last_message: msg.content, last_message_date: msg.created_at, messages: [...c.messages, msg] }
            : c
        ));
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  // ── Personal info handlers ──
  const handlePersonalInfoChange = (field: string, value: string | boolean) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSavePersonalInfo = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalInfo),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        // Refresh the session so the name and other data are up to date
        await update();
      } else {
        const data = await res.json();
        console.error('Profile save error:', data.error?.message);
        alert(data.error?.message || 'Kaydetme başarısız oldu');
      }
    } catch (err) {
      console.error('Profile save error:', err);
      alert('Bir hata oluştu, lütfen tekrar deneyin');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading & auth gates ──
  if (status === 'loading' && !isPreviewMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          <p className="text-gray-500 animate-pulse">{t('app.page.y_kleniyor')}</p>
        </div>
      </div>
    );
  }

  if (!isPreviewMode && !session?.user) return null;

  const user = isPreviewMode
    ? { name: 'Demo User', email: 'demo@university.edu', image: null as string | null, id: 'demo-user' }
    : { ...session?.user, id: (session?.user as any)?.id };

  if (!user) return null;

  const isAdmin = !isPreviewMode && (session?.user as any)?.role === 'admin';

  // Tier badge config
  const getTierConfig = () => {
    if (!verification || verification.status !== 'APPROVED') return null;
    const tier = verification.tier_approved ?? verification.tier_requested ?? 0;
    const configs: Record<number, { label: string; color: string; bgColor: string; icon: string }> = {
      0: { label: 'Email Doğrulanmış', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: '📧' },
      1: { label: 'Seviye 1 - Doğrulanmış', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: '🥉' },
      2: { label: 'Seviye 2 - Güvenilir', color: 'text-green-700', bgColor: 'bg-green-100', icon: '🥈' },
      3: { label: 'Seviye 3 - Partner', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: '🥇' },
    };
    return configs[tier] || configs[0];
  };

  const tierConfig = getTierConfig();
  const unreadTotal = conversations.reduce((sum, c) => sum + c.unread_count, 0);
  const isStudent = userAccountType === 'student';

  // Tab switch helper (also closes mobile sidebar)
  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (tab !== 'messages') setSelectedConversation(null);
  };

  // ═══════════════════════════════════════════════════
  // ── RENDER ─────────────────────────────────────────
  // ═══════════════════════════════════════════════════

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc]">
      <Navbar />
      <main className="flex-grow">
        {/* ── Hero Header ── */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/[0.06]" />
            <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/[0.04]" />
            <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-white/30 animate-pulse" />
            <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {user.image ? (
                  <div className="relative w-18 h-18 md:w-22 md:h-22">
                    <Image
                      src={user.image}
                      alt={user.name || 'User'}
                      width={88}
                      height={88}
                      className="rounded-2xl border-[3px] border-white/30 shadow-2xl object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-[72px] h-[72px] md:w-[88px] md:h-[88px] rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-3xl md:text-4xl font-bold text-white border-[3px] border-white/20 shadow-2xl">
                    {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
                {userAccountType === 'student' && tierConfig && (
                  <span className="absolute -bottom-1.5 -right-1.5 text-lg drop-shadow-sm">{tierConfig.icon}</span>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5 mb-1">
                  <h1 className="text-xl md:text-2xl font-bold text-white truncate">
                    {t('app.page.merhaba')}{(personalInfo.name || user.name)?.split(' ')[0]}!
                  </h1>
                  {isAdmin && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-purple-500/70 text-white text-[10px] rounded-full font-medium backdrop-blur-sm">
                      <Shield className="h-3 w-3 mr-0.5" />
                      {t('app.page.admin')}</span>
                  )}
                </div>
                <p className="text-blue-200 flex items-center gap-1.5 text-sm truncate">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  {user.email}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  {userAccountType === 'student' && tierConfig && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 ${tierConfig.bgColor} ${tierConfig.color} text-[11px] rounded-full font-medium`}>
                      <BadgeCheck className="h-3 w-3 mr-1" />
                      {tierConfig.label}
                    </span>
                  )}
                  {userAccountType === 'student' && verification?.status === 'PENDING_REVIEW' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-yellow-100 text-yellow-700 text-[11px] rounded-full font-medium">
                      <Clock className="h-3 w-3 mr-1" />
                      {t('app.page.do_rulama_bekliyor')}</span>
                  )}
                  {!isStudent && donationSummary.lastDonationDate && (
                    <span className="text-[11px] text-blue-300/80 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t('app.page.son_ba')}{new Date(donationSummary.lastDonationDate).toLocaleDateString('tr-TR')}
                    </span>
                  )}
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex gap-2 flex-shrink-0 self-start sm:self-center">
                {isStudent && !tierConfig && verification?.status !== 'PENDING_REVIEW' && (
                  <Button
                    onClick={() => router.push('/verify')}
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 text-xs"
                  >
                    <BadgeCheck className="h-3.5 w-3.5 mr-1" />
                    {t('app.page.do_rulan_n')}</Button>
                )}
                {isStudent ? (
                  <Button
                    onClick={() => router.push('/apply')}
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-white/25 text-white hover:bg-white/20 backdrop-blur-sm text-xs"
                  >
                    <Target className="h-3.5 w-3.5 mr-1" />
                    {t('app.page.kampanya_olu_tur')}</Button>
                ) : (
                  <Button
                    onClick={() => router.push('/browse')}
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-white/25 text-white hover:bg-white/20 backdrop-blur-sm text-xs"
                  >
                    <Heart className="h-3.5 w-3.5 mr-1" />
                    {t('app.page.ba_yap')}</Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

            {/* ── Mobile Tab Bar ── */}
            <div className="lg:hidden flex gap-1 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
              {(isStudent ? [
                { key: 'overview' as TabType, icon: BarChart3, label: 'Genel Bakış' },
                { key: 'donations' as TabType, icon: Target, label: 'Kampanyalarım' },
                { key: 'messages' as TabType, icon: MessageCircle, label: 'Mesajlar', badge: unreadTotal },
                { key: 'reports' as TabType, icon: FileText, label: 'Raporlar' },
                { key: 'settings' as TabType, icon: Settings, label: 'Ayarlar' },
              ] : [
                { key: 'overview' as TabType, icon: BarChart3, label: 'Genel Bakış' },
                { key: 'donations' as TabType, icon: Heart, label: 'Bağışlarım', badge: donationSummary.totalDonations },
                { key: 'messages' as TabType, icon: MessageCircle, label: 'Mesajlar', badge: unreadTotal },
                { key: 'reports' as TabType, icon: FileText, label: 'Raporlar' },
                { key: 'settings' as TabType, icon: Settings, label: 'Ayarlar' },
              ]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => switchTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full leading-none ${activeTab === tab.key ? 'bg-white/25' : 'bg-red-100 text-red-600'
                      }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Desktop Sidebar ── */}
            <div className="hidden lg:block lg:w-56 flex-shrink-0">
              <div className="sticky top-24 space-y-1.5">
                <SidebarItem icon={BarChart3} label={t('app.page.genel_bak')} active={activeTab === 'overview'} onClick={() => switchTab('overview')} />
                {isStudent ? (
                  <SidebarItem icon={Target} label={t('app.page.kampanyalar_m')} active={activeTab === 'donations'} onClick={() => switchTab('donations')} />
                ) : (
                  <SidebarItem icon={Heart} label={t('app.page.ba_lar_m')} active={activeTab === 'donations'} onClick={() => switchTab('donations')} badge={donationSummary.totalDonations} />
                )}
                <SidebarItem icon={MessageCircle} label={t('app.page.mesajlar')} active={activeTab === 'messages'} onClick={() => switchTab('messages')} badge={unreadTotal} />
                <SidebarItem icon={FileText} label={t('app.page.lerleme_raporlar')} active={activeTab === 'reports'} onClick={() => switchTab('reports')} />
                <SidebarItem icon={Settings} label={t('app.page.ayarlar')} active={activeTab === 'settings'} onClick={() => switchTab('settings')} />

                {/* Quick Links */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <p className="px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('app.page.h_zl_eri_im')}</p>
                  {isStudent ? (
                    <>
                      <Link href="/apply" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50">
                        <Target className="h-3.5 w-3.5" /> {t('app.page.kampanya_olu_tur')}</Link>
                      <Link href="/campaigns" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50">
                        <Search className="h-3.5 w-3.5" /> {t('app.page.kampanyalar_ke_fet')}</Link>
                    </>
                  ) : (
                    <>
                      <Link href="/my-donations" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50">
                        <FileText className="h-3.5 w-3.5" /> {t('app.page.detayl_ba_ge_mi_i')}</Link>
                      <Link href="/browse" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50">
                        <Search className="h-3.5 w-3.5" /> {t('app.page.kampanyalar_ke_fet')}</Link>
                    </>
                  )}
                  <Link href="/account/security" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50">
                    <Shield className="h-3.5 w-3.5" /> {t('app.page.g_venlik')}</Link>
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-xs text-purple-500 hover:text-purple-700 transition-colors rounded-lg hover:bg-purple-50">
                      <Shield className="h-3.5 w-3.5" /> {t('app.page.admin_paneli')}</Link>
                  )}
                </div>
              </div>
            </div>

            {/* ── Content Area ── */}
            <div className="flex-1 min-w-0">

              {/* ═══ OVERVIEW TAB ═══ */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Stats Grid */}
                  {isStudent ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                      <StatCard
                        icon={Wallet}
                        value={formatAmount(donationSummary.totalAmount)}
                        label={t('app.page.toplam_al_nan_ba')}
                        color="blue"
                        onClick={() => switchTab('donations')}
                      />
                      <StatCard
                        icon={Target}
                        value={String(donationSummary.totalDonations)}
                        label={t('app.page.kampanya_say_s')}
                        color="orange"
                        onClick={() => switchTab('donations')}
                      />
                      <StatCard
                        icon={Heart}
                        value={String(donationSummary.supportedStudents)}
                        label={t('app.page.destek_i_say_s')}
                        color="red"
                      />
                      <StatCard
                        icon={MessageCircle}
                        value={String(conversations.length)}
                        label={t('app.page.mesajlar')}
                        color="purple"
                        onClick={() => switchTab('messages')}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                      <StatCard
                        icon={Wallet}
                        value={formatAmount(donationSummary.totalAmount)}
                        label={t('app.page.toplam_ba')}
                        color="blue"
                        onClick={() => switchTab('donations')}
                      />
                      <StatCard
                        icon={Heart}
                        value={String(donationSummary.totalDonations)}
                        label={t('app.page.ba_say_s')}
                        color="red"
                        onClick={() => switchTab('donations')}
                      />
                      <StatCard
                        icon={GraduationCap}
                        value={String(donationSummary.supportedStudents)}
                        label={t('app.page.desteklenen_renci')}
                        color="green"
                      />
                      <StatCard
                        icon={MessageCircle}
                        value={String(conversations.length)}
                        label={t('app.page.aktif_sohbet')}
                        color="purple"
                        onClick={() => switchTab('messages')}
                      />
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('app.page.h_zl_lemler')}</h3>
                    {isStudent ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <QuickAction icon={Target} label={t('app.page.kampanya_olu_tur')} href="/apply" color="blue" />
                        <QuickAction icon={FileText} label={t('app.page.lerleme_raporu_payla')} href="/reports" color="green" />
                        <QuickAction icon={MessageCircle} label={t('app.page.mesajlar_m')} href="#" color="purple" />
                        <QuickAction icon={Award} label={t('app.page.rozetlerim')} href="/badges" color="orange" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <QuickAction icon={Heart} label={t('app.page.ba_yap')} href="/browse" color="red" />
                        <QuickAction icon={Download} label={t('app.page.ba_raporu_ndir')} href="/my-donations" color="blue" />
                        <QuickAction icon={GraduationCap} label={t('app.page.rencileri_ke_fet')} href="/campaigns" color="green" />
                        <QuickAction icon={Award} label={t('app.page.rozetlerim')} href="/badges" color="purple" />
                      </div>
                    )}
                  </div>

                  {/* Two Column Layout: Recent Donations + Messages */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Recent Donations / Campaigns */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                          {isStudent ? (
                            <><Target className="h-4 w-4 text-blue-500" /> {t('app.page.gelen_ba_lar')}</>
                          ) : (
                            <><Heart className="h-4 w-4 text-red-500" /> {t('app.page.son_ba_lar')}</>
                          )}
                        </h3>
                        <button
                          onClick={() => switchTab('donations')}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
                        >
                          {t('app.page.t_m_n_g_r')}<ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {donationsLoading ? (
                          <div className="p-10 text-center">
                            <div className="h-8 w-8 animate-spin mx-auto text-blue-600 border-[3px] border-blue-200 border-t-blue-600 rounded-full" />
                          </div>
                        ) : donations.length === 0 ? (
                          <div className="p-10 text-center">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                              {isStudent ? <Target className="h-7 w-7 text-gray-300" /> : <Heart className="h-7 w-7 text-gray-300" />}
                            </div>
                            {isStudent ? (
                              <>
                                <p className="text-gray-500 text-sm mb-1 font-medium">{t('app.page.hen_z_gelen_ba_yok')}</p>
                                <p className="text-gray-400 text-xs mb-4">{t('app.page.kampanya_olu_turarak_ba_almaya')}</p>
                                <Button size="sm" onClick={() => router.push('/apply')} className="bg-blue-600 hover:bg-blue-700 text-xs">
                                  {t('app.page.kampanya_olu_tur')}</Button>
                              </>
                            ) : (
                              <>
                                <p className="text-gray-500 text-sm mb-1 font-medium">{t('app.page.hen_z_ba_yapmad_n_z')}</p>
                                <p className="text-gray-400 text-xs mb-4">{t('app.page.bir_rencinin_hayat_n_de_i_tiri')}</p>
                                <Button size="sm" onClick={() => router.push('/browse')} className="bg-blue-600 hover:bg-blue-700 text-xs">
                                  {t('app.page.lk_ba_n_z_yap_n')}</Button>
                              </>
                            )}
                          </div>
                        ) : (
                          donations.slice(0, 4).map(d => (
                            <DonationRow key={d.donation_id} donation={d} formatAmount={formatAmount} />
                          ))
                        )}
                      </div>
                    </div>

                    {/* Recent Messages */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-indigo-500" />
                          {isStudent ? 'Destekçi Mesajları' : 'Son Mesajlar'}
                          {unreadTotal > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full leading-none">
                              {unreadTotal}
                            </span>
                          )}
                        </h3>
                        <button
                          onClick={() => switchTab('messages')}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
                        >
                          {t('app.page.t_m_n_g_r')}<ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {messagesLoading ? (
                          <div className="p-10 text-center">
                            <div className="h-8 w-8 animate-spin mx-auto text-blue-600 border-[3px] border-blue-200 border-t-blue-600 rounded-full" />
                          </div>
                        ) : conversations.length === 0 ? (
                          <div className="p-10 text-center">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                              <MessageCircle className="h-7 w-7 text-gray-300" />
                            </div>
                            <p className="text-gray-500 text-sm mb-1 font-medium">{t('app.page.hen_z_mesaj_n_z_yok')}</p>
                            <p className="text-gray-400 text-xs">{isStudent ? 'Destekçilerinizden gelen mesajlar burada görünecek' : 'Bağış yaptığınız öğrencilerle sohbet edin'}</p>
                          </div>
                        ) : (
                          conversations.slice(0, 3).map(c => (
                            <ConversationPreview
                              key={c.campaign_id}
                              thread={c}
                              onClick={() => { switchTab('messages'); setSelectedConversation(c); }}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Impact Banner */}
                  {!isStudent && donationSummary.totalDonations > 0 && (
                    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-5 md:p-6 text-white relative overflow-hidden">
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10" />
                        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/[0.07]" />
                      </div>
                      <div className="relative">
                        <h3 className="text-base font-bold mb-1.5 flex items-center gap-2">
                          <Star className="h-5 w-5 text-yellow-300" />
                          {t('app.page.etki_zetiniz')}</h3>
                        <p className="text-blue-100 text-sm leading-relaxed mb-4">
                          {t('app.page.toplamda')}<span className="font-bold text-white">{donationSummary.supportedStudents} {t('app.page.rencinin')}</span> {t('app.page.e_itim_hayat_na')}{' '}<span className="font-bold text-white">{formatAmount(donationSummary.totalAmount)}</span> {t('app.page.katk_da_bulundunuz_te_ekk_rler')}</p>
                        <div className="flex flex-wrap gap-2.5">
                          <Button
                            size="sm"
                            onClick={() => router.push('/browse')}
                            className="bg-white text-blue-700 hover:bg-blue-50 text-xs shadow-lg"
                          >
                            <Heart className="h-3.5 w-3.5 mr-1" />
                            {t('app.page.daha_fazla_destek_ol')}</Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push('/my-donations')}
                            className="border-white/30 text-white hover:bg-white/10 text-xs"
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            {t('app.page.detayl_rapor')}</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ DONATIONS TAB ═══ */}
              {activeTab === 'donations' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {/* Summary Cards */}
                  {isStudent ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                      <StatCard icon={Wallet} value={formatAmount(donationSummary.totalAmount)} label={t('app.page.toplam_al_nan_ba')} color="blue" />
                      <StatCard icon={Target} value={String(donationSummary.totalDonations)} label={t('app.page.kampanya_say_s')} color="orange" />
                      <StatCard icon={Heart} value={String(donationSummary.supportedStudents)} label={t('app.page.destek_i_say_s')} color="red" />
                      <StatCard
                        icon={Calendar}
                        value={donationSummary.lastDonationDate
                          ? new Date(donationSummary.lastDonationDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                          : '-'}
                        label={t('app.page.son_ba_tarihi')}
                        color="green"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                      <StatCard icon={Wallet} value={formatAmount(donationSummary.totalAmount)} label={t('app.page.toplam_ba')} color="blue" />
                      <StatCard icon={Heart} value={String(donationSummary.totalDonations)} label={t('app.page.ba_say_s')} color="red" />
                      <StatCard icon={GraduationCap} value={String(donationSummary.supportedStudents)} label={t('app.page.desteklenen_renci')} color="green" />
                      <StatCard
                        icon={Calendar}
                        value={donationSummary.lastDonationDate
                          ? new Date(donationSummary.lastDonationDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                          : '-'}
                        label={t('app.page.son_ba_tarihi')}
                        color="orange"
                      />
                    </div>
                  )}

                  {/* Donations / Campaigns List */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 text-sm">{isStudent ? 'Kampanyalarım & Gelen Bağışlar' : 'Tüm Bağışlarım'}</h3>
                      {!isStudent && (
                        <div className="flex gap-2">
                          <Link href="/my-donations">
                            <Button size="sm" variant="outline" className="text-[11px] h-8">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {t('app.page.detayl_g_r_n_m')}</Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-[11px] h-8"
                            onClick={() => window.open('/api/donations/my/export?format=csv', '_blank')}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            {t('app.page.d_a_aktar')}</Button>
                        </div>
                      )}
                    </div>

                    <div className="divide-y divide-gray-50">
                      {donationsLoading ? (
                        <div className="p-12 text-center">
                          <div className="h-10 w-10 animate-spin mx-auto text-blue-600 mb-3 border-4 border-blue-200 border-t-blue-600 rounded-full" />
                          <p className="text-gray-500 text-sm">{isStudent ? 'Kampanyalar yükleniyor...' : 'Bağışlar yükleniyor...'}</p>
                        </div>
                      ) : donations.length === 0 ? (
                        <div className="p-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            {isStudent ? <Target className="h-8 w-8 text-gray-300" /> : <Heart className="h-8 w-8 text-gray-300" />}
                          </div>
                          {isStudent ? (
                            <>
                              <h4 className="text-base font-semibold text-gray-700 mb-1.5">{t('app.page.hen_z_kampanyan_z_yok')}</h4>
                              <p className="text-gray-400 text-sm mb-5">{t('app.page.lk_kampanyan_z_olu_turarak_ba_')}</p>
                              <Button onClick={() => router.push('/apply')} className="bg-blue-600 hover:bg-blue-700">
                                <Target className="h-4 w-4 mr-2" />
                                {t('app.page.kampanya_olu_tur')}</Button>
                            </>
                          ) : (
                            <>
                              <h4 className="text-base font-semibold text-gray-700 mb-1.5">{t('app.page.hen_z_ba_yapmad_n_z')}</h4>
                              <p className="text-gray-400 text-sm mb-5">{t('app.page.bir_rencinin_e_itim_hayat_n_de')}</p>
                              <Button onClick={() => router.push('/browse')} className="bg-blue-600 hover:bg-blue-700">
                                <Search className="h-4 w-4 mr-2" />
                                {t('app.page.kampanyalar_ke_fet')}</Button>
                            </>
                          )}
                        </div>
                      ) : (
                        <>
                          {donations.map(d => (
                            <DonationRow key={d.donation_id} donation={d} formatAmount={formatAmount} />
                          ))}

                          {/* Pagination */}
                          {donationTotalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-3.5">
                              <p className="text-xs text-gray-500">
                                {t('app.page.toplam')}{donationTotal} {t('app.page.ba')}</p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-8"
                                  disabled={donationPage <= 1}
                                  onClick={() => { const p = donationPage - 1; setDonationPage(p); fetchDonations(p); }}
                                >
                                  <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                                <span className="text-xs text-gray-600 flex items-center px-2">
                                  {donationPage} / {donationTotalPages}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-8"
                                  disabled={donationPage >= donationTotalPages}
                                  onClick={() => { const p = donationPage + 1; setDonationPage(p); fetchDonations(p); }}
                                >
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ MESSAGES TAB ═══ */}
              {activeTab === 'messages' && (
                <div className="animate-in fade-in duration-300">
                  {!selectedConversation ? (
                    /* Conversation List */
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-indigo-500" />
                          {t('app.page.sohbetlerim')}{unreadTotal > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full leading-none">{unreadTotal} yeni</span>
                          )}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">{t('app.page.ba_yapt_n_z_rencilerle_mesajla')}</p>
                      </div>

                      <div className="divide-y divide-gray-50">
                        {messagesLoading ? (
                          <div className="p-12 text-center">
                            <div className="h-10 w-10 animate-spin mx-auto text-blue-600 mb-3 border-4 border-blue-200 border-t-blue-600 rounded-full" />
                            <p className="text-gray-500 text-sm">{t('app.page.mesajlar_y_kleniyor')}</p>
                          </div>
                        ) : conversations.length === 0 ? (
                          <div className="p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                              <MessageCircle className="h-8 w-8 text-gray-300" />
                            </div>
                            <h4 className="text-base font-semibold text-gray-700 mb-1.5">{t('app.page.hen_z_mesaj_n_z_yok')}</h4>
                            <p className="text-gray-400 text-sm mb-5">
                              {t('app.page.ba_yapt_n_z_kampanyalardaki_re')}</p>
                            <Button onClick={() => router.push('/browse')} className="bg-blue-600 hover:bg-blue-700">
                              <Heart className="h-4 w-4 mr-2" />
                              {t('app.page.ba_yaparak_ba_lay_n')}</Button>
                          </div>
                        ) : (
                          conversations.map(c => (
                            <ConversationPreview
                              key={c.campaign_id}
                              thread={c}
                              onClick={() => setSelectedConversation(c)}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Chat View */
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 300px)', minHeight: '480px' }}>
                      {/* Chat Header */}
                      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white">
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5 text-gray-500" />
                        </button>
                        {selectedConversation.student_image ? (
                          <Image
                            src={selectedConversation.student_image}
                            alt={selectedConversation.student_name}
                            width={38}
                            height={38}
                            className="rounded-full ring-2 ring-gray-100"
                          />
                        ) : (
                          <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {selectedConversation.student_name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{selectedConversation.student_name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{selectedConversation.campaign_title}</p>
                        </div>
                        <Link href={`/campaign/${selectedConversation.campaign_id}`}>
                          <Button size="sm" variant="outline" className="text-[11px] h-8">
                            <Eye className="h-3 w-3 mr-1" />
                            {t('app.page.kampanya')}</Button>
                        </Link>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/50">
                        <div className="text-center mb-4">
                          <span className="text-[10px] text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
                            {selectedConversation.campaign_title}
                          </span>
                        </div>
                        {selectedConversation.messages.map(msg => {
                          const isMe = msg.type === 'donor_to_student' || msg.sender_id === user.id;
                          return (
                            <div key={msg.message_id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              {!isMe && (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-semibold mr-2 mt-auto mb-1 flex-shrink-0">
                                  {msg.sender_name.charAt(0)}
                                </div>
                              )}
                              <div className={`max-w-[75%] ${isMe ? '' : ''}`}>
                                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                                  ? 'bg-blue-600 text-white rounded-br-lg'
                                  : 'bg-white text-gray-800 rounded-bl-lg border border-gray-100 shadow-sm'
                                  }`}>
                                  <p>{msg.content}</p>
                                </div>
                                <p className={`text-[10px] mt-1 px-1 ${isMe ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                                  {new Date(msg.created_at).toLocaleString('tr-TR', {
                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="px-5 py-3.5 border-t border-gray-100 bg-white">
                        <div className="flex gap-2">
                          <Input
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder={t('app.page.mesaj_n_z_yaz_n')}
                            className="flex-1 text-sm"
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                            maxLength={1000}
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || sendingMessage}
                            className="bg-blue-600 hover:bg-blue-700 px-3.5"
                            size="sm"
                          >
                            {sendingMessage ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 text-right">{newMessage.length}/1000</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ REPORTS TAB ═══ */}
              {activeTab === 'reports' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {isStudent ? 'Akademik İlerleme Raporlarım' : 'İlerleme Raporları'}
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {isStudent
                          ? 'Akademik notlarınızı, başarılarınızı ve ilerleme durumunuzu destekçilerinizle paylaşın'
                          : 'Desteklediğiniz öğrencilerin 3 aylık ilerleme raporlarını görüntüleyin'}
                      </p>
                    </div>
                    <div className="p-6">
                      {isStudent ? (
                        <div className="space-y-6">
                          {/* Student report summary cards */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="bg-blue-50 rounded-xl p-4 text-center">
                              <GraduationCap className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                              <p className="text-lg font-bold text-gray-900">—</p>
                              <p className="text-xs text-gray-500">{t('app.page.not_ortalamas')}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-4 text-center">
                              <TrendingUp className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                              <p className="text-lg font-bold text-gray-900">—</p>
                              <p className="text-xs text-gray-500">{t('app.page.payla_lan_rapor')}</p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
                              <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                              <p className="text-lg font-bold text-gray-900">—</p>
                              <p className="text-xs text-gray-500">{t('app.page.ba_ar')}</p>
                            </div>
                          </div>

                          {/* Empty state for student */}
                          <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mb-3">
                              <FileText className="h-7 w-7 text-emerald-500" />
                            </div>
                            <h4 className="text-base font-semibold text-gray-900 mb-1.5">{t('app.page.hen_z_rapor_payla_mad_n_z')}</h4>
                            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5">
                              {t('app.page.akademik_ilerlemenizi_ve_ba_ar')}</p>
                            <Link
                              href="/reports"
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              <FileText className="h-4 w-4" />
                              {t('app.page.rapor_payla')}<ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                            <FileText className="h-8 w-8 text-blue-500" />
                          </div>
                          <h4 className="text-base font-semibold text-gray-900 mb-2">{t('app.page.lerleme_raporlar')}</h4>
                          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                            {t('app.page.destekledi_iniz_rencilerin_aka')}</p>
                          <Link
                            href="/reports"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            <FileText className="h-4 w-4" />
                            {t('app.page.raporlar_g_r_nt_le')}<ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ SETTINGS TAB ═══ */}
              {activeTab === 'settings' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{t('app.page.ki_isel_bilgiler')}</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">{t('app.page.hesap_bilgilerinizi_g_ncelleyi')}</p>
                      </div>
                      {saved && (
                        <span className="flex items-center text-emerald-600 text-[11px] font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t('app.page.kaydedildi')}</span>
                      )}
                    </div>

                    <div className="p-5 md:p-6 space-y-7">
                      {/* Username / Display Name */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          {t('app.page.kullan_c_ad')}</h4>
                        <div className="flex items-center gap-3">
                          {editingName ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                type="text"
                                placeholder={t('app.page.ad_n_z_girin')}
                                value={personalInfo.name}
                                onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                                className="flex-1"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => setEditingName(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                              >
                                {t('app.page.tamam')}</Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setPersonalInfo(prev => ({ ...prev, name: user.name || '' }));
                                  setEditingName(false);
                                }}
                                className="text-xs"
                              >
                                {t('app.page.ptal')}</Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                                {personalInfo.name || user.name || 'İsim belirtilmemiş'}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setPersonalInfo(prev => ({ ...prev, name: prev.name || user.name as string || '' }));
                                  setEditingName(true);
                                }}
                                className="text-xs"
                              >
                                {t('app.page.de_i_tir')}</Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-blue-500" />
                          {t('app.page.leti_im_bilgileri')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5">{t('app.page.telefon_numaras')}</label>
                            <div className="flex gap-2">
                              <select
                                value={personalInfo.phoneCountryCode}
                                onChange={(e) => handlePersonalInfoChange('phoneCountryCode', e.target.value)}
                                className="w-[88px] px-2 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                {COUNTRY_CODES.map((c) => (
                                  <option key={c.code} value={c.code}>{c.label}</option>
                                ))}
                              </select>
                              <Input
                                type="tel"
                                placeholder={t('app.page.5xx_xxx_xx_xx')}
                                value={personalInfo.phone}
                                onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5">{t('app.page.yedek_e_posta')}</label>
                            <Input
                              type="email"
                              placeholder="yedek@email.com"
                              value={personalInfo.backupEmail}
                              onChange={(e) => handlePersonalInfoChange('backupEmail', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Personal Details */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          {t('app.page.ki_isel_detaylar')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5">{t('app.page.cinsiyet')}</label>
                            <select
                              value={personalInfo.gender}
                              onChange={(e) => handlePersonalInfoChange('gender', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                            >
                              <option value="">{t('app.page.se_iniz')}</option>
                              <option value="male">{t('app.page.erkek')}</option>
                              <option value="female">{t('app.page.kad_n')}</option>
                              <option value="other">{t('app.page.di_er')}</option>
                              <option value="preferNotToSay">{t('app.page.belirtmek_stemiyorum')}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5">{t('app.page.do_um_tarihi')}</label>
                            <Input
                              type="date"
                              value={personalInfo.dateOfBirth}
                              onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5">{t('app.page.lke')}</label>
                            <select
                              value={personalInfo.country}
                              onChange={(e) => handlePersonalInfoChange('country', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                            >
                              <option value="">{t('app.page.se_iniz')}</option>
                              <option value="TR">{t('app.page.t_rkiye')}</option>
                              <option value="US">ABD</option>
                              <option value="GB">{t('app.page.birle_ik_krall_k')}</option>
                              <option value="DE">{t('app.page.almanya')}</option>
                              <option value="FR">{t('app.page.fransa')}</option>
                              <option value="SA">{t('app.page.suudi_arabistan')}</option>
                              <option value="AE">BAE</option>
                              <option value="OTHER">{t('app.page.di_er')}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-gray-500 mb-1.5">{t('app.page.dil')}</label>
                            <select
                              value={personalInfo.language}
                              onChange={(e) => handlePersonalInfoChange('language', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                            >
                              <option value="tr">{t('app.page.t_rk_e')}</option>
                              <option value="en">{t('app.page.english')}</option>
                              <option value="de">{t('app.page.deutsch')}</option>
                              <option value="fr">{t('app.page.fran_ais')}</option>
                              <option value="es">{t('app.page.espa_ol')}</option>
                              <option value="ar">العربية</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Security */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Lock className="h-4 w-4 text-blue-500" />
                          {t('app.page.g_venlik')}</h4>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{t('app.page.ki_fakt_rl_do_rulama')}</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">{t('app.page.hesab_n_za_ekstra_g_venlik_kat')}</p>
                            </div>
                            <button
                              onClick={() => handlePersonalInfoChange('twoFactorEnabled', !personalInfo.twoFactorEnabled)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${personalInfo.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${personalInfo.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                          {personalInfo.twoFactorEnabled && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                              <p className="text-[11px] text-blue-700">{t('app.page.ki_fakt_rl_do_rulama_yak_nda_a')}</p>
                            </div>
                          )}
                        </div>

                        <Link
                          href="/account/security"
                          className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Shield className="h-3.5 w-3.5" />
                          {t('app.page.geli_mi_g_venlik_ayarlar')}<ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>

                      {/* Save */}
                      <div className="flex justify-end pt-4 border-t border-gray-100">
                        <Button
                          onClick={handleSavePersonalInfo}
                          disabled={saving}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                          size="sm"
                        >
                          {saving ? (
                            <span className="flex items-center gap-2 text-sm">
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              {t('app.page.kaydediliyor')}</span>
                          ) : (
                            <span className="flex items-center gap-2 text-sm">
                              <Save className="h-3.5 w-3.5" />
                              {t('app.page.kaydet')}</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Verification Card - Only for students */}
                  {userAccountType === 'student' && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4 text-blue-500" />
                        {t('app.page.renci_do_rulama_durumu')}</h4>
                      {tierConfig ? (
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{tierConfig.icon}</span>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-1 ${tierConfig.bgColor} ${tierConfig.color} text-xs rounded-full font-medium`}>
                              <BadgeCheck className="h-3.5 w-3.5 mr-1" />
                              {tierConfig.label}
                            </span>
                            <p className="text-[11px] text-gray-500 mt-1">{t('app.page.hesab_n_z_do_rulanm_t_r')}</p>
                          </div>
                        </div>
                      ) : verification?.status === 'PENDING_REVIEW' ? (
                        <div className="flex items-center gap-3 bg-yellow-50 rounded-xl p-4">
                          <Clock className="h-7 w-7 text-yellow-500 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-yellow-800 text-sm">{t('app.page.do_rulama_nceleniyor')}</p>
                            <p className="text-[11px] text-yellow-600 mt-0.5">{t('app.page.ba_vurunuz_inceleme_a_amas_nda')}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                          <div>
                            <p className="font-medium text-gray-700 text-sm">{t('app.page.hesab_n_z_hen_z_do_rulanmad')}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{t('app.page.do_rulanm_hesaplar_daha_fazla_')}</p>
                          </div>
                          <Button size="sm" onClick={() => router.push('/verify')} className="bg-blue-600 hover:bg-blue-700 text-xs">
                            <BadgeCheck className="h-3.5 w-3.5 mr-1" />
                            {t('app.page.do_rula')}</Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ── Export ──────────────────────────────────────────────
export default function AccountPage() {
    const { t } = useTranslation();
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          <p className="text-gray-500">{t('app.page.y_kleniyor')}</p>
        </div>
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}
