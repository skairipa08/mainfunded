'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, GraduationCap, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { verificationStatuses } from '@/lib/verification-statuses';
import { VerificationBadgeCompact } from './VerificationBadge';
import { useTranslation } from '@/lib/i18n';

interface CampaignCardProps {
  campaign: any;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const { t } = useTranslation();
  const progress = campaign.goal_amount > 0
    ? (campaign.raised_amount / campaign.goal_amount) * 100
    : 0;
  const student = campaign.student || {};
  const verificationStatus = student.verification_status || 'pending';
  const tierApproved = campaign.tier_approved ?? student.tier_approved;
  const status = verificationStatuses[verificationStatus as keyof typeof verificationStatuses] || verificationStatuses.pending;

  return (
    <Link href={`/campaign/${campaign.campaign_id}`}>
      <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden group">
        <div className="relative">
          {campaign.cover_image ? (
            <div className="relative w-full h-48">
              <Image
                src={campaign.cover_image}
                alt={campaign.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-16 w-16 text-white opacity-50" aria-hidden="true" />
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
            {/* Show tier badge if tier_approved exists, otherwise show legacy badge */}
            {tierApproved !== undefined && tierApproved >= 1 ? (
              <VerificationBadgeCompact tier={tierApproved} />
            ) : (
              <Badge className={`${status.color} border`}>
                {verificationStatus === 'verified' ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <Clock className="h-3 w-3 mr-1" />
                )}
                {status.label}
              </Badge>
            )}
            {campaign.isPublished && (campaign.status === 'published' || campaign.createdFrom === 'application') && (
              <Badge className="bg-emerald-600 text-white border-emerald-700 shadow-sm">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {t('campaignCard.approved')}
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{campaign.title}</h3>
              <p className="text-sm text-gray-700 font-medium mb-1">{student.name || t('campaign.student')}</p>
              <div className="flex items-center text-sm text-gray-600 space-x-3">
                {student.field_of_study && (
                  <span className="flex items-center">
                    <GraduationCap className="h-4 w-4 mr-1" aria-hidden="true" />
                    {student.field_of_study}
                  </span>
                )}
                {student.country && (
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" aria-hidden="true" />
                    {student.country}
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{campaign.story}</p>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-gray-900">
                  {t('campaignCard.raised', { amount: `$${(campaign.raised_amount || 0).toLocaleString()}` })}
                </span>
                <span className="text-gray-600">
                  {t('campaignCard.goal', { amount: `$${(campaign.goal_amount || 0).toLocaleString()}` })}
                </span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-2" />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('campaignCard.donorCount', { count: campaign.donor_count || 0 })}</span>
              <span className="flex items-center text-blue-600 font-medium">
                <TrendingUp className="h-4 w-4 mr-1" />
                {t('campaignCard.funded', { percent: progress.toFixed(0) })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
