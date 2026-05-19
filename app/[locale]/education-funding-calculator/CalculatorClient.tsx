// app/[locale]/education-funding-calculator/CalculatorClient.tsx
'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

// 2025 Turkey market prices (TL)
const PRICES = {
  book:       200,  // ders kitabı
  meal:        80,  // okul öğünü
  day:        150,  // eğitim günü (ulaşım + kırtasiye + yemek)
  stationery: 400,  // kırtasiye seti
  tutoring:   350,  // etüt/özel ders saati
}

const PRESETS = [500, 1_000, 2_500, 5_000, 10_000]

function fmt(n: number) {
  return new Intl.NumberFormat('tr-TR').format(n)
}

function calcImpact(amount: number) {
  return {
    books:      Math.floor(amount / PRICES.book),
    meals:      Math.floor(amount / PRICES.meal),
    days:       Math.floor(amount / PRICES.day),
    stationery: Math.floor(amount / PRICES.stationery),
    tutoring:   Math.floor(amount / PRICES.tutoring),
  }
}

interface Props { locale: string }

export default function CalculatorClient({ locale }: Props) {
  const isTr = locale === 'tr'
  const [amount, setAmount] = useState<number | null>(null)
  const [customRaw, setCustomRaw] = useState('')

  const handlePreset = (v: number) => {
    setAmount(v)
    setCustomRaw('')
  }

  const handleCustom = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setCustomRaw(raw)
    const n = parseInt(raw, 10)
    setAmount(isNaN(n) || n <= 0 ? null : n)
  }, [])

  const impact = amount ? calcImpact(amount) : null

  const categories = isTr ? [
    { key: 'books' as const,      icon: '📚', label: 'Ders Kitabı',    unit: 'kitap', color: 'bg-amber-50  border-amber-200',   num: 'text-amber-700',   badge: 'bg-amber-100 text-amber-700',   price: PRICES.book },
    { key: 'meals' as const,      icon: '🍱', label: 'Okul Öğünü',    unit: 'öğün',  color: 'bg-emerald-50 border-emerald-200', num: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', price: PRICES.meal },
    { key: 'days' as const,       icon: '📅', label: 'Eğitim Günü',   unit: 'gün',   color: 'bg-indigo-50 border-indigo-200',   num: 'text-indigo-700',  badge: 'bg-indigo-100 text-indigo-700',  price: PRICES.day },
    { key: 'stationery' as const, icon: '✏️', label: 'Kırtasiye Seti', unit: 'set',  color: 'bg-orange-50 border-orange-200',   num: 'text-orange-700',  badge: 'bg-orange-100 text-orange-700',  price: PRICES.stationery },
    { key: 'tutoring' as const,   icon: '🎓', label: 'Etüt Saati',    unit: 'saat',  color: 'bg-purple-50 border-purple-200',   num: 'text-purple-700',  badge: 'bg-purple-100 text-purple-700',  price: PRICES.tutoring },
  ] : [
    { key: 'books' as const,      icon: '📚', label: 'Textbooks',      unit: 'books', color: 'bg-amber-50  border-amber-200',   num: 'text-amber-700',   badge: 'bg-amber-100 text-amber-700',   price: PRICES.book },
    { key: 'meals' as const,      icon: '🍱', label: 'School Meals',   unit: 'meals', color: 'bg-emerald-50 border-emerald-200', num: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', price: PRICES.meal },
    { key: 'days' as const,       icon: '📅', label: 'Education Days', unit: 'days',  color: 'bg-indigo-50 border-indigo-200',   num: 'text-indigo-700',  badge: 'bg-indigo-100 text-indigo-700',  price: PRICES.day },
    { key: 'stationery' as const, icon: '✏️', label: 'Stationery Kit', unit: 'kits', color: 'bg-orange-50 border-orange-200',   num: 'text-orange-700',  badge: 'bg-orange-100 text-orange-700',  price: PRICES.stationery },
    { key: 'tutoring' as const,   icon: '🎓', label: 'Tutoring Hours', unit: 'hours', color: 'bg-purple-50 border-purple-200',   num: 'text-purple-700',  badge: 'bg-purple-100 text-purple-700',  price: PRICES.tutoring },
  ]

  return (
    <div className="space-y-8">

      {/* Preset buttons */}
      <section>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          {isTr ? 'Hazır Tutarlar' : 'Preset Amounts'}
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {PRESETS.map(p => {
            const active = amount === p && customRaw === ''
            return (
              <button
                key={p}
                onClick={() => handlePreset(p)}
                className={`rounded-2xl border-2 py-4 px-2 text-center font-bold transition-all duration-150 ${
                  active
                    ? 'border-emerald-500 bg-slate-900 text-white shadow-lg scale-105'
                    : 'border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <span className="block text-lg md:text-xl">₺{fmt(p)}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Custom amount */}
      <section>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          {isTr ? 'Ya da Kendi Tutarını Gir' : 'Or Enter Your Own Amount'}
        </p>
        <div className="relative max-w-xs">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg pointer-events-none">₺</span>
          <input
            type="text"
            inputMode="numeric"
            value={customRaw}
            onChange={handleCustom}
            placeholder={isTr ? '1.500' : '1,500'}
            className="w-full pl-9 pr-4 py-3 border-2 border-slate-200 rounded-2xl text-slate-800 font-bold text-lg focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-300"
          />
        </div>
      </section>

      {/* Impact results */}
      {impact && amount && (
        <section>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            {isTr ? `₺${fmt(amount)} ile neler sağlanır?` : `What ₺${fmt(amount)} provides:`}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {categories.map(cat => (
              <div key={cat.key} className={`border rounded-2xl p-4 ${cat.color}`}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.badge}`}>
                    ₺{fmt(cat.price)}/{cat.unit}
                  </span>
                </div>
                <p className={`text-3xl font-black mb-0.5 ${cat.num}`}>{fmt(impact[cat.key])}</p>
                <p className="text-xs text-slate-500 font-medium">{cat.label}</p>
              </div>
            ))}
          </div>

          {/* Equivalency note */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              {isTr ? 'Bağlamsal Karşılaştırma' : 'Context'}
            </p>
            <div className="space-y-2">
              {impact.days >= 180 && (
                <p className="text-sm text-slate-700">
                  <span className="font-bold text-indigo-700">🏫 {isTr ? 'Tam bir okul yılı' : 'A full school year'}</span>
                  {isTr ? ` — ${fmt(impact.days)} gün, ${Math.floor(impact.days / 180)} tam akademik yıla karşılık gelir.` : ` — ${fmt(impact.days)} days covers ${Math.floor(impact.days / 180)} full academic year(s).`}
                </p>
              )}
              {impact.books >= 8 && (
                <p className="text-sm text-slate-700">
                  <span className="font-bold text-amber-700">📚 {isTr ? 'Tam kitap seti' : 'Full book set'}</span>
                  {isTr ? ' — Bir öğrencinin tüm yıllık ders kitaplarını karşılar.' : " — Covers a student's entire yearly textbook set."}
                </p>
              )}
              {impact.meals >= 20 && (
                <p className="text-sm text-slate-700">
                  <span className="font-bold text-emerald-700">🍱 {isTr ? 'Aylık öğün' : 'Monthly meals'}</span>
                  {isTr ? ` — ${fmt(impact.meals)} öğün ≈ ${Math.floor(impact.meals / 20)} aylık okul öğünü.` : ` — ${fmt(impact.meals)} meals ≈ ${Math.floor(impact.meals / 20)} month(s) of daily school lunches.`}
                </p>
              )}
              {impact.tutoring >= 4 && (
                <p className="text-sm text-slate-700">
                  <span className="font-bold text-purple-700">🎓 {isTr ? 'Etüt desteği' : 'Tutoring support'}</span>
                  {isTr ? ` — ${fmt(impact.tutoring)} saat etüt, sınav hazırlığına ciddi katkı sağlar.` : ` — ${fmt(impact.tutoring)} tutoring hours makes a meaningful difference for exam prep.`}
                </p>
              )}
              {impact.days < 4 && impact.books < 2 && (
                <p className="text-sm text-slate-500 italic">
                  {isTr ? 'Her tutar fark yaratır — küçük bir katkı bile gerçek etki yaratır.' : 'Every amount matters — even a small contribution creates real impact.'}
                </p>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">
                {isTr ? 'Hemen Destekle' : 'Support Now'}
              </p>
              <p className="text-white font-bold text-lg">
                {isTr ? `₺${fmt(amount)} ile bir öğrencinin hayatına dokunun` : `Make a ₺${fmt(amount)} difference today`}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                {isTr ? 'Doğrulanmış öğrenci · Şeffaf takip · ESG uyumlu' : 'Verified student · Transparent tracking · ESG-aligned'}
              </p>
            </div>
            <Link
              href={`/${locale}/fund-a-student`}
              className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
            >
              {isTr ? 'Öğrenci Destekle →' : 'Fund a Student →'}
            </Link>
          </div>
        </section>
      )}

      {/* Empty state */}
      {!impact && (
        <div className="text-center py-16">
          <p className="text-5xl mb-4 text-slate-200">↑</p>
          <p className="text-base font-medium text-slate-400">
            {isTr ? 'Tutarı seçin veya girin' : 'Select or enter an amount above'}
          </p>
        </div>
      )}

      {/* Source note */}
      <p className="text-xs text-slate-300 text-center pb-4">
        {isTr
          ? 'Fiyatlar 2025 Türkiye ortalama piyasa değerlerine dayanmaktadır. Bölgeye ve okul türüne göre değişebilir.'
          : 'Prices based on 2025 Turkish market averages. May vary by region and school type.'}
      </p>

    </div>
  )
}
