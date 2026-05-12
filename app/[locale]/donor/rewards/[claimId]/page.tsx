import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getDb } from '@/lib/db'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { DELIVERY_LABELS, DELIVERY_ICONS } from '@/types/rewards'
import type { ClaimStatus, DeliveryType } from '@/types/rewards'

const STATUS_CONFIG: Record<ClaimStatus, { label: string; color: string; bg: string; border: string; icon: string; pulse: boolean }> = {
  pending: {
    label: 'Hazırlanıyor',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: '⏳',
    pulse: true,
  },
  processing: {
    label: 'Gönderiliyor',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: '🚀',
    pulse: true,
  },
  delivered: {
    label: 'Teslim Edildi',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: '✅',
    pulse: false,
  },
  failed: {
    label: 'Teslim Başarısız',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: '❌',
    pulse: false,
  },
}

interface PageProps {
  params: { claimId: string; locale: string }
}

export default async function DonorRewardPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const db = await getDb()
  const claim = await db.collection('reward_claims').findOne({ claim_id: params.claimId })

  if (!claim) {
    notFound()
  }

  if (String(claim.donor_id) !== String(session.user.id)) {
    notFound()
  }

  const tier = await db.collection('reward_tiers').findOne({ tier_id: claim.tier_id })
  const campaign = tier
    ? await db.collection('campaigns').findOne({ campaign_id: tier.campaign_id })
    : null

  const donor = await db.collection('users').findOne(
    { user_id: session.user.id },
    { projection: { name: 1, email: 1 } }
  )

  const status = (claim.status as ClaimStatus) || 'pending'
  const statusCfg = STATUS_CONFIG[status]
  const deliveryType = tier?.delivery_type as DeliveryType | undefined
  const deliveryLabel = deliveryType ? DELIVERY_LABELS[deliveryType] : ''
  const deliveryIcon = deliveryType ? DELIVERY_ICONS[deliveryType] : '🎁'
  const pdfUrl = claim.delivery_payload?.pdf_url as string | undefined

  const createdAt = claim.created_at
    ? new Date(claim.created_at).toLocaleDateString('tr-TR', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—'

  const deliveredAt = claim.delivered_at
    ? new Date(claim.delivered_at).toLocaleDateString('tr-TR', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <Navbar />

      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <main className="flex-grow relative z-10 py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Hero header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-4 py-2 rounded-full border border-white/20 mb-6 backdrop-blur-sm">
              <span>🏅</span>
              Ödül Detayı
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Ödülün Burada
            </h1>
            <p className="text-white/60 mt-2 text-sm">
              {campaign?.title || 'Kampanya'} kampanyasına yaptığın bağışın ödülü
            </p>
          </div>

          {/* Main reward card — glass morphism */}
          <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
            {/* Gradient top band */}
            <div className="h-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

            <div className="p-6 sm:p-8 space-y-6">
              {/* Status badge */}
              <div className="flex items-center justify-between">
                <div className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-full border
                  text-sm font-bold
                  ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}
                `}>
                  <span className={statusCfg.pulse ? 'animate-bounce inline-block' : ''}>
                    {statusCfg.icon}
                  </span>
                  {statusCfg.label}
                  {statusCfg.pulse && (
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  )}
                </div>
                <span className="text-white/40 text-xs">{createdAt}</span>
              </div>

              {/* Reward info */}
              <div>
                <div className="flex items-start gap-4">
                  <div className="text-5xl flex-shrink-0 mt-1">{deliveryIcon}</div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {tier?.title || 'Ödül'}
                    </h2>
                    <p className="text-white/70 text-sm mt-1 leading-relaxed">
                      {tier?.description || ''}
                    </p>
                    {deliveryLabel && (
                      <span className="inline-flex items-center gap-1.5 mt-3 bg-white/15 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/20">
                        {deliveryIcon} {deliveryLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivered message */}
              {status === 'delivered' && (
                <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-2xl p-4">
                  {deliveryType === 'thank_you_email' ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📬</span>
                      <div>
                        <p className="text-emerald-300 font-bold text-sm">E-posta Gönderildi</p>
                        <p className="text-emerald-400/80 text-xs mt-0.5">
                          Teşekkür e-postanız {claim.delivery_email} adresine gönderildi.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎉</span>
                      <div>
                        <p className="text-emerald-300 font-bold text-sm">Ödülün Teslim Edildi!</p>
                        {deliveredAt && (
                          <p className="text-emerald-400/80 text-xs mt-0.5">{deliveredAt}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        mt-3 flex items-center justify-center gap-2
                        bg-white text-emerald-700 font-bold text-sm
                        py-3 px-6 rounded-xl
                        hover:bg-emerald-50 transition-colors duration-200
                        shadow-md
                      "
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      PDF İndir
                    </a>
                  )}
                </div>
              )}

              {/* Pending / Processing info */}
              {(status === 'pending' || status === 'processing') && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-white/60 text-sm leading-relaxed">
                    Ödülünüz hazırlanıyor. İşlem tamamlandığında
                    <strong className="text-white"> {claim.delivery_email}</strong> adresine
                    bildirim gönderilecektir.
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Transaction metadata */}
              <div>
                <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">
                  İşlem Detayları
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'Kampanya', value: campaign?.title || '—' },
                    { label: 'Bağışçı', value: (donor?.name as string) || (session.user?.name as string) || '—' },
                    { label: 'E-posta', value: claim.delivery_email },
                    { label: 'Bağış Tarihi', value: createdAt },
                    { label: 'Ödül Kademesi', value: tier?.title || '—' },
                    { label: 'Talep Kimliği', value: params.claimId },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-4 py-2.5 border-b border-white/10 last:border-0"
                    >
                      <span className="text-white/50 text-sm flex-shrink-0">{label}</span>
                      <span className="text-white/90 text-sm text-right font-medium break-all">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Back link */}
          <div className="text-center">
            <a
              href="/donor/dashboard"
              className="
                inline-flex items-center gap-2 text-white/60 hover:text-white
                text-sm font-medium transition-colors duration-200
              "
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Panele Dön
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
