'use client';

/**
 * TributeShareCard
 *
 * Shown on the donation success screen when a tribute was made.
 * Provides shareable links for Twitter/X, WhatsApp, and clipboard copy.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Twitter, Share2, Link2, Check } from 'lucide-react';
import { buildShareText, TRIBUTE_OCCASIONS, type TributeInfo } from '@/lib/tribute-templates';

interface TributeShareCardProps {
  tribute: TributeInfo;
  campaignTitle: string;
  campaignId: string;
  /** Donor's display name (might be masked) */
  donorName: string;
}

export function TributeShareCard({
  tribute,
  campaignTitle,
  campaignId,
  donorName,
}: TributeShareCardProps) {
  const [copied, setCopied] = useState(false);

  const meta = TRIBUTE_OCCASIONS.find((o) => o.id === tribute.occasion);
  const shareText = buildShareText(tribute.honoreeName, campaignTitle, tribute.occasion);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://fund-ed.com';
  const campaignUrl = `${baseUrl}/campaign/${campaignId}`;

  // OG image URL for preview
  const ogImageUrl = `${baseUrl}/api/tribute/og-image?${new URLSearchParams({
    donor: donorName,
    honoree: tribute.honoreeName,
    occasion: meta?.label ?? '',
    campaign: campaignTitle,
    emoji: meta?.emoji ?? '💙',
  }).toString()}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(campaignUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${campaignUrl}`)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${campaignUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 240, damping: 24 }}
      className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl overflow-hidden"
    >
      {/* OG Image preview */}
      <div className="relative w-full aspect-[1200/630] bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-800 overflow-hidden">
        {/* Decorative elements (CSS-only preview) */}
        <div className="absolute inset-0 flex flex-col justify-center p-6 text-white">
          <div className="text-3xl mb-2">{meta?.emoji ?? '💙'}</div>
          <div className="text-xs uppercase tracking-widest opacity-70 mb-1">{meta?.label}</div>
          <div className="text-xl font-bold leading-tight mb-1">{tribute.honoreeName} adına</div>
          <div className="text-sm opacity-75">bir öğrencinin eğitimine destek olundu</div>
          {campaignTitle && (
            <div className="mt-2 text-xs opacity-60 truncate">🎓 {campaignTitle}</div>
          )}
          <div className="absolute bottom-3 right-4 text-xs opacity-50 font-semibold">💙 fund-ed.com</div>
        </div>
        {/* Real OG image as background (loads async) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ogImageUrl}
          alt="Tribute share card"
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={(e) => (e.currentTarget.style.opacity = '1')}
          style={{ opacity: 0, transition: 'opacity 0.5s' }}
        />
      </div>

      {/* Share buttons */}
      <div className="p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700 text-center">
          Bu anlamlı jest paylaşmaya değer ✨
        </p>

        <div className="flex gap-2">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Twitter className="h-4 w-4" />
            X / Twitter
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white text-sm font-medium rounded-lg hover:bg-[#1fb85b] transition-colors"
          >
            <Share2 className="h-4 w-4" />
            WhatsApp
          </a>

          <button
            type="button"
            onClick={copyLink}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
            {copied ? 'Kopyalandı!' : 'Linki Kopyala'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
