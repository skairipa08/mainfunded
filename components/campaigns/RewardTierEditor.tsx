'use client'

import { useState, useEffect } from 'react'
import type { RewardTierFormData, DeliveryType } from '@/types/rewards'
import { DELIVERY_LABELS, DELIVERY_ICONS } from '@/types/rewards'

interface Props {
  value: RewardTierFormData[]
  onChange: (tiers: RewardTierFormData[]) => void
}

const EMPTY_TIER: RewardTierFormData = {
  min_amount_tl: 0,
  title: '',
  description: '',
  delivery_type: 'thank_you_email',
  stock_limit: null,
  estimated_delivery: null,
}

const TIER_COLORS = [
  'border-l-blue-500',
  'border-l-violet-500',
  'border-l-fuchsia-500',
  'border-l-rose-500',
  'border-l-amber-500',
]

const TIER_GRADIENTS = [
  'from-blue-50 to-indigo-50',
  'from-violet-50 to-purple-50',
  'from-fuchsia-50 to-pink-50',
  'from-rose-50 to-red-50',
  'from-amber-50 to-orange-50',
]

const TIER_BADGE_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
]

function makeKey() {
  return `tier-${Math.random().toString(36).slice(2)}`
}

export default function RewardTierEditor({ value, onChange }: Props) {
  const [errors, setErrors] = useState<Record<number, string>>({})
  const [mounted, setMounted] = useState(false)
  // Stable keys that survive sort reordering — keyed by original insertion order
  const [stableKeys, setStableKeys] = useState<string[]>(() => value.map(() => makeKey()))

  useEffect(() => { setMounted(true) }, [])

  function validate(tiers: RewardTierFormData[]): Record<number, string> {
    const errs: Record<number, string> = {}
    const seen = new Set<number>()
    tiers.forEach((t, i) => {
      if (!t.min_amount_tl || t.min_amount_tl <= 0) {
        errs[i] = 'Minimum tutar 0\'dan büyük olmalıdır'
      } else if (seen.has(t.min_amount_tl)) {
        errs[i] = 'Bu tutar başka bir kademede zaten kullanılıyor'
      } else {
        seen.add(t.min_amount_tl)
      }
    })
    return errs
  }

  function handleTierChange(index: number, field: keyof RewardTierFormData, val: unknown) {
    const updated = value.map((t, i) => i === index ? { ...t, [field]: val } : t)
    // Preserve key association after sort
    const paired = updated.map((t, i) => ({ t, k: stableKeys[i] }))
    paired.sort((a, b) => (a.t.min_amount_tl || 0) - (b.t.min_amount_tl || 0))
    const sorted = paired.map((p) => p.t)
    const sortedKeys = paired.map((p) => p.k)
    setStableKeys(sortedKeys)
    setErrors(validate(sorted))
    onChange(sorted)
  }

  function addTier() {
    if (value.length >= 5) return
    const newTiers = [...value, { ...EMPTY_TIER }]
    setStableKeys([...stableKeys, makeKey()])
    onChange(newTiers)
  }

  function removeTier(index: number) {
    const updated = value.filter((_, i) => i !== index)
    setStableKeys(stableKeys.filter((_, i) => i !== index))
    setErrors(validate(updated))
    onChange(updated)
  }

  const deliveryTypeOptions = Object.entries(DELIVERY_LABELS) as [DeliveryType, string][]

  if (!mounted) return null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            Ödül Kademeleri
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Bağışçılara otomatik dijital ödüller tanımla
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold
            transition-colors duration-300
            ${value.length >= 5
              ? 'bg-rose-100 text-rose-700'
              : value.length >= 3
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-600'
            }
          `}>
            <span>{value.length}</span>
            <span className="text-gray-400 font-normal">/</span>
            <span>5</span>
          </div>
        </div>
      </div>

      {/* Tier cards */}
      <div className="space-y-3">
        {value.map((tier, index) => (
          <div
            key={stableKeys[index] ?? index}
            className={`
              relative rounded-xl border border-gray-200 border-l-4 ${TIER_COLORS[index % TIER_COLORS.length]}
              bg-gradient-to-br ${TIER_GRADIENTS[index % TIER_GRADIENTS.length]}
              p-5 shadow-sm
              transition-all duration-300 ease-out
              hover:shadow-md hover:border-gray-300
              animate-in slide-in-from-top-2
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className={`
                  inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black
                  ${TIER_BADGE_COLORS[index % TIER_BADGE_COLORS.length]}
                `}>
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-gray-700">
                  {tier.title || `Kademe ${index + 1}`}
                </span>
                {tier.min_amount_tl > 0 && (
                  <span className="text-xs bg-white/80 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                    ₺{tier.min_amount_tl.toLocaleString('tr-TR')} ve üzeri
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeTier(index)}
                className="
                  flex items-center gap-1 text-xs text-gray-400 hover:text-rose-500
                  px-2.5 py-1.5 rounded-lg hover:bg-rose-50
                  transition-all duration-200 font-medium
                "
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Kaldır
              </button>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Min amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Minimum Tutar (₺) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₺</span>
                  <input
                    type="number"
                    min="1"
                    value={tier.min_amount_tl || ''}
                    onChange={(e) => handleTierChange(index, 'min_amount_tl', parseInt(e.target.value) || 0)}
                    placeholder="100"
                    className={`
                      w-full pl-8 pr-3 py-2.5 text-sm border rounded-lg bg-white/80
                      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                      transition-all duration-200
                      ${errors[index] ? 'border-rose-300 bg-rose-50/50' : 'border-gray-200'}
                    `}
                  />
                </div>
                {errors[index] && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors[index]}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Ödül Başlığı <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={tier.title}
                  onChange={(e) => handleTierChange(index, 'title', e.target.value)}
                  placeholder="örn. Destek Ödülü"
                  maxLength={120}
                  className="
                    w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white/80
                    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                    transition-all duration-200
                  "
                />
              </div>

              {/* Description — full width */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Açıklama <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={tier.description}
                  onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                  placeholder="Bağışçı bu ödül karşılığında ne alır?"
                  rows={2}
                  className="
                    w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white/80 resize-none
                    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                    transition-all duration-200
                  "
                />
              </div>

              {/* Delivery type */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Teslimat Türü
                </label>
                <select
                  value={tier.delivery_type}
                  onChange={(e) => handleTierChange(index, 'delivery_type', e.target.value as DeliveryType)}
                  className="
                    w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white/80
                    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                    transition-all duration-200 cursor-pointer
                  "
                >
                  {deliveryTypeOptions.map(([val, label]) => (
                    <option key={val} value={val}>
                      {DELIVERY_ICONS[val]} {label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    FundEd otomatik gönderir
                  </span>
                </div>
              </div>

              {/* Stock limit toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Stok Limiti
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => handleTierChange(index, 'stock_limit', tier.stock_limit !== null ? null : 10)}
                      className={`
                        relative w-10 h-5.5 rounded-full transition-colors duration-300 cursor-pointer flex-shrink-0
                        ${tier.stock_limit !== null ? 'bg-blue-500' : 'bg-gray-200'}
                      `}
                      style={{ height: '22px' }}
                    >
                      <div className={`
                        absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm
                        transition-transform duration-300
                        ${tier.stock_limit !== null ? 'translate-x-4.5' : 'translate-x-0'}
                      `} style={{ width: '18px', height: '18px', transform: tier.stock_limit !== null ? 'translateX(18px)' : 'translateX(0)' }} />
                    </div>
                    <span className="text-sm text-gray-600">
                      {tier.stock_limit !== null ? 'Sınırlı' : 'Sınırsız'}
                    </span>
                  </label>
                  {tier.stock_limit !== null && (
                    <input
                      type="number"
                      min="1"
                      value={tier.stock_limit}
                      onChange={(e) => handleTierChange(index, 'stock_limit', parseInt(e.target.value) || 1)}
                      className="
                        w-20 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white/80
                        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                        transition-all duration-200
                      "
                    />
                  )}
                </div>
              </div>

              {/* Estimated delivery */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Tahmini Teslimat <span className="text-gray-400 font-normal">(opsiyonel)</span>
                </label>
                <input
                  type="date"
                  value={tier.estimated_delivery || ''}
                  onChange={(e) => handleTierChange(index, 'estimated_delivery', e.target.value || null)}
                  className="
                    w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white/80
                    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                    transition-all duration-200
                  "
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add tier button */}
      <button
        type="button"
        onClick={addTier}
        disabled={value.length >= 5}
        className={`
          w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl
          text-sm font-semibold border-2 border-dashed
          transition-all duration-300 group
          ${value.length >= 5
            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
            : `
              border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50
              bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50
            `
          }
        `}
      >
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${value.length < 5 ? 'group-hover:rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        {value.length >= 5 ? 'Maksimum 5 kademe eklendi' : 'Kademe ekle'}
      </button>

      {value.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-3">🎁</div>
          <p className="text-sm font-medium text-gray-500">Ödül kademesi ekleyerek bağışçıları teşvik et</p>
          <p className="text-xs mt-1 text-gray-400">İsteğe bağlı — kampanya kademeleri olmadan da yayımlanabilir</p>
        </div>
      )}
    </div>
  )
}
