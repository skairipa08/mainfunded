'use client'

import { useMemo } from 'react'
import type { RewardTier } from '@/types/rewards'
import { DELIVERY_LABELS, DELIVERY_ICONS } from '@/types/rewards'

interface Props {
  tiers: RewardTier[]
  selectedTierId: string | null
  onSelect: (tierId: string, minAmount: number) => void
}

export default function RewardCards({ tiers, selectedTierId, onSelect }: Props) {
  const popularTierId = useMemo(() => {
    const eligible = tiers.filter(
      (t) => t.stock_limit !== null && t.stock_claimed > 0 &&
        t.stock_claimed < (t.stock_limit ?? Infinity)
    )
    if (eligible.length === 0) return null
    return eligible.reduce((best, t) =>
      (t.stock_claimed / (t.stock_limit ?? 1)) > (best.stock_claimed / (best.stock_limit ?? 1))
        ? t : best
    ).tier_id
  }, [tiers])

  if (tiers.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🎁</span>
        <h3 className="text-lg font-bold text-gray-900">Ödül Kademeleri</h3>
        <span className="text-sm text-gray-400 font-normal">— Bağışınla birlikte dijital ödül kazan</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiers.map((tier) => {
          const isSoldOut = tier.stock_limit !== null && tier.stock_claimed >= tier.stock_limit
          const remaining = tier.stock_limit !== null ? tier.stock_limit - tier.stock_claimed : null
          const isLowStock = remaining !== null && remaining <= 5 && !isSoldOut
          const isSelected = selectedTierId === tier.tier_id
          const isPopular = tier.tier_id === popularTierId

          return (
            <div
              key={tier.tier_id}
              className={`
                relative flex flex-col rounded-2xl overflow-hidden
                border transition-all duration-300
                ${isSoldOut
                  ? 'opacity-60 border-gray-200 bg-gray-50 cursor-not-allowed'
                  : isSelected
                    ? 'border-blue-400 shadow-xl shadow-blue-100/60 ring-2 ring-blue-500 ring-offset-1 scale-[1.02] bg-white cursor-pointer'
                    : 'border-gray-200 bg-white hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-200 cursor-pointer'
                }
              `}
              onClick={() => !isSoldOut && onSelect(tier.tier_id, tier.min_amount_tl)}
            >
              {/* Popular badge */}
              {isPopular && !isSoldOut && (
                <div className="absolute top-0 left-0 right-0 flex justify-center -translate-y-0">
                  <span className="
                    inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500
                    text-white text-xs font-black px-3 py-1 rounded-b-lg
                    shadow-sm shadow-amber-200/50
                  ">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    En çok seçilen
                  </span>
                </div>
              )}

              {/* Gradient header */}
              <div className={`
                relative px-5 pt-${isPopular ? '8' : '5'} pb-4
                ${isSoldOut
                  ? 'bg-gradient-to-br from-gray-100 to-gray-200'
                  : isSelected
                    ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700'
                    : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900'
                }
              `}
                style={{ paddingTop: isPopular ? '2rem' : '1.25rem' }}
              >
                {isSelected && (
                  <div className="absolute inset-0 bg-white/10 animate-pulse rounded-none" />
                )}

                <div className="relative">
                  <div className={`
                    text-3xl font-black tracking-tight
                    ${isSoldOut ? 'text-gray-400' : 'text-white'}
                  `}>
                    ₺{tier.min_amount_tl.toLocaleString('tr-TR')}
                    <span className={`text-sm font-medium ml-1 ${isSoldOut ? 'text-gray-400' : 'text-white/70'}`}>
                      ve üzeri
                    </span>
                  </div>
                  <div className={`
                    text-base font-bold mt-1
                    ${isSoldOut ? 'text-gray-400' : 'text-white'}
                  `}>
                    {tier.title}
                  </div>
                </div>

                {/* Selected check */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex-1 px-5 py-4 flex flex-col gap-3">
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {tier.description}
                </p>

                {/* Delivery label */}
                <div className="flex items-center gap-2">
                  <span className={`
                    inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg
                    ${isSelected
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                    }
                    transition-colors duration-300
                  `}>
                    <span>{DELIVERY_ICONS[tier.delivery_type]}</span>
                    {DELIVERY_LABELS[tier.delivery_type]}
                  </span>
                </div>

                {/* Stock indicator */}
                {tier.stock_limit !== null && (
                  <div className="space-y-1.5">
                    {isSoldOut ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                          </svg>
                          Doldu
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-xs">
                          <span className={isLowStock ? 'text-amber-600 font-semibold' : 'text-gray-500'}>
                            {isLowStock ? '🔥 Son ' : ''}{remaining} adet kaldı
                          </span>
                          <span className="text-gray-400">{tier.stock_claimed} talep alındı</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`
                              h-full rounded-full transition-all duration-500
                              ${isLowStock
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                                : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                              }
                            `}
                            style={{
                              width: `${Math.min(100, (tier.stock_claimed / tier.stock_limit) * 100)}%`,
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Estimated delivery */}
                {tier.estimated_delivery && !isSoldOut && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Tahmini teslimat: {new Date(tier.estimated_delivery).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="px-5 pb-5">
                <button
                  type="button"
                  disabled={isSoldOut}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isSoldOut) onSelect(tier.tier_id, tier.min_amount_tl)
                  }}
                  className={`
                    w-full py-3 px-4 rounded-xl text-sm font-bold
                    transition-all duration-300
                    ${isSoldOut
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 scale-[1.01]'
                        : `
                          bg-gradient-to-r from-slate-800 to-slate-900 text-white
                          hover:from-blue-600 hover:to-indigo-700
                          hover:shadow-lg hover:shadow-blue-200/50
                          hover:scale-[1.01]
                        `
                    }
                  `}
                >
                  {isSoldOut
                    ? 'Tükendi'
                    : isSelected
                      ? '✓ Seçildi — Bağış yap'
                      : 'Bu ödülle bağış yap'
                  }
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
