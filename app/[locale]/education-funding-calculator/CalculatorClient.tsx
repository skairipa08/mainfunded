// app/[locale]/education-funding-calculator/CalculatorClient.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

const IMPACT_TIERS = [
  { amount: 25,  books: 3,  meals: 10,  days: 5,   label: '$25' },
  { amount: 50,  books: 6,  meals: 20,  days: 10,  label: '$50' },
  { amount: 100, books: 12, meals: 40,  days: 20,  label: '$100' },
  { amount: 500, books: 60, meals: 200, days: 100, label: '$500' },
]

interface Props {
  locale: string
}

export default function CalculatorClient({ locale }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const isTr = locale === 'tr'
  const tier = IMPACT_TIERS.find((t) => t.amount === selected)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {IMPACT_TIERS.map((t) => (
          <button
            key={t.amount}
            onClick={() => setSelected(t.amount)}
            className={`rounded-2xl border-2 p-6 text-center font-bold text-2xl transition-all ${
              selected === t.amount
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 scale-105 shadow-lg'
                : 'border-slate-200 text-slate-700 hover:border-emerald-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tier && (
        <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 text-center space-y-4 animate-in fade-in duration-300">
          <p className="text-lg font-semibold text-slate-700">
            {isTr ? `${tier.label} bağışınızla:` : `With a ${tier.label} donation:`}
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-3xl font-bold text-emerald-700">{tier.books}</p>
              <p className="text-sm text-slate-500">{isTr ? 'ders kitabı' : 'textbooks'}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-3xl font-bold text-emerald-700">{tier.meals}</p>
              <p className="text-sm text-slate-500">{isTr ? 'okul öğünü' : 'school meals'}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-3xl font-bold text-emerald-700">{tier.days}</p>
              <p className="text-sm text-slate-500">{isTr ? 'eğitim günü' : 'days of education'}</p>
            </div>
          </div>
          <Link
            href={`/${locale}/fund-a-student`}
            className="inline-block mt-4 bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            {isTr ? 'Şimdi Bir Öğrenciyi Destekle →' : 'Fund a Student Now →'}
          </Link>
        </div>
      )}

      {!tier && (
        <div className="text-center text-slate-400 py-8">
          {isTr ? 'Bağış tutarını seçin' : 'Select a donation amount above'}
        </div>
      )}
    </div>
  )
}
