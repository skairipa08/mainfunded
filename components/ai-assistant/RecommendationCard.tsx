'use client';

import React from 'react';
import { Heart, ExternalLink, GraduationCap, MapPin } from 'lucide-react';
import type { RecommendedCampaign } from '@/types/ai-assistant';
import { useRouter } from 'next/navigation';

interface RecommendationCardProps {
  campaign: RecommendedCampaign;
  rank: number;
}

export function RecommendationCard({ campaign, rank }: RecommendationCardProps) {
  const router = useRouter();
  const progress = campaign.goal_amount > 0
    ? Math.min(100, (campaign.raised_amount / campaign.goal_amount) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-3 hover:shadow-md transition-shadow">
      {/* Match score header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <span className="text-xs font-semibold text-blue-700">
          🌟 %{campaign.match_score} Eşleşme
        </span>
        <span className="text-xs text-gray-500">#{rank}</span>
      </div>

      <div className="p-3">
        {/* Student info */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
            {campaign.student.picture ? (
              <img
                src={campaign.student.picture}
                alt={campaign.student.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <GraduationCap className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 truncate">
              {campaign.student.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {campaign.student.field_of_study && (
                <span className="flex items-center gap-0.5">
                  <GraduationCap className="w-3 h-3" />
                  {campaign.student.field_of_study}
                </span>
              )}
              {campaign.student.country && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {campaign.student.country}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Campaign title & story snippet */}
        <h5 className="font-medium text-sm text-gray-800 mb-1 line-clamp-1">
          {campaign.title}
        </h5>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{campaign.story}</p>

        {/* Match reasons */}
        {campaign.match_reasons.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {campaign.match_reasons.slice(0, 3).map((reason, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200"
              >
                ✓ {reason}
              </span>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-gray-700">
              ₺{campaign.raised_amount.toLocaleString('tr-TR')}
            </span>
            <span className="text-gray-500">
              / ₺{campaign.goal_amount.toLocaleString('tr-TR')}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
            <span>%{progress.toFixed(0)} fonlanmış</span>
            <span>{campaign.donor_count} destekçi</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/campaign/${campaign.campaign_id}/donate`);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Heart className="w-3.5 h-3.5" />
            Bağış Yap
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/campaign/${campaign.campaign_id}`);
            }}
            className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Detay
          </button>
        </div>
      </div>
    </div>
  );
}
