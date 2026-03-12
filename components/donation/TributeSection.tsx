'use client';

/**
 * TributeSection
 *
 * Drop-in bağış formu bölümü: "Bu bağışı birinin adına yapıyorum"
 *
 * Usage:
 *   <TributeSection value={tributeInfo} onChange={setTributeInfo} />
 */

import { useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Mail, User, MessageSquare, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  TRIBUTE_OCCASIONS,
  getOccasionTemplate,
  type TributeInfo,
  type TributeOccasion,
} from '@/lib/tribute-templates';

interface TributeSectionProps {
  value: TributeInfo;
  onChange: (v: TributeInfo) => void;
}

const EMPTY_TRIBUTE: TributeInfo = {
  isTribute: false,
  honoreeName: '',
  honoreeEmail: '',
  occasion: 'general',
  message: '',
};

export function TributeSection({ value, onChange }: TributeSectionProps) {
  const uid = useId();

  // Pre-fill message when occasion or honoreeName changes
  useEffect(() => {
    if (!value.isTribute) return;
    const tpl = getOccasionTemplate(value.occasion, value.honoreeName || undefined);
    // Only auto-fill if the message matches a previous template (or is empty)
    const previousTpl = getOccasionTemplate(value.occasion, '');
    if (!value.message || value.message === previousTpl) {
      onChange({ ...value, message: tpl });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.occasion, value.isTribute]);

  const toggle = (checked: boolean) => {
    if (checked) {
      onChange({
        ...EMPTY_TRIBUTE,
        isTribute: true,
        message: getOccasionTemplate('general'),
      });
    } else {
      onChange({ ...EMPTY_TRIBUTE });
    }
  };

  const setField = <K extends keyof TributeInfo>(key: K, val: TributeInfo[K]) => {
    onChange({ ...value, [key]: val });
  };

  const setOccasion = (occasion: TributeOccasion) => {
    const tpl = getOccasionTemplate(occasion, value.honoreeName || undefined);
    onChange({ ...value, occasion, message: tpl });
  };

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Toggle row */}
      <div
        className="flex items-center gap-3 px-4 py-4 cursor-pointer select-none bg-white hover:bg-gray-50 transition-colors"
        onClick={() => toggle(!value.isTribute)}
      >
        <Checkbox
          id={`${uid}-tribute`}
          checked={value.isTribute}
          onCheckedChange={toggle}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex-1">
          <Label htmlFor={`${uid}-tribute`} className="text-sm font-semibold text-gray-900 cursor-pointer leading-none">
            <Gift className="inline h-4 w-4 mr-1.5 text-purple-500 -mt-0.5" />
            Bu bağışı birinin adına yapıyorum
          </Label>
          <p className="text-xs text-gray-500 mt-1 ml-5 leading-snug">
            Sevdiklerinize özel bir hediye — onlara da bildirim gönderilecek.
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${value.isTribute ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Expandable form */}
      <AnimatePresence initial={false}>
        {value.isTribute && (
          <motion.div
            key="tribute-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 bg-purple-50/40 px-4 pb-5 pt-4 space-y-4">

              {/* Occasion selector */}
              <div>
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                  Özel Gün
                </Label>
                <div className="flex flex-wrap gap-2">
                  {TRIBUTE_OCCASIONS.map((occ) => (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setOccasion(occ.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        value.occasion === occ.id
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <span>{occ.emoji}</span>
                      <span>{occ.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Honoree name */}
              <div className="space-y-1.5">
                <Label htmlFor={`${uid}-hname`} className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-gray-400" />
                  Onurlandırılan Kişinin Adı <span className="text-red-400">*</span>
                </Label>
                <Input
                  id={`${uid}-hname`}
                  type="text"
                  placeholder="Örn: Annem, Ali Bey, Zeynep..."
                  maxLength={200}
                  value={value.honoreeName}
                  onChange={(e) => {
                    const name = e.target.value;
                    const tpl = getOccasionTemplate(value.occasion, name || undefined);
                    onChange({ ...value, honoreeName: name, message: tpl });
                  }}
                  className="h-9 text-sm"
                />
              </div>

              {/* Honoree email (optional) */}
              <div className="space-y-1.5">
                <Label htmlFor={`${uid}-hemail`} className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  E-posta Adresi
                  <span className="text-xs text-gray-400 font-normal">(opsiyonel — bildirim gönderilecek)</span>
                </Label>
                <Input
                  id={`${uid}-hemail`}
                  type="email"
                  placeholder="ornek@email.com"
                  maxLength={320}
                  value={value.honoreeEmail ?? ''}
                  onChange={(e) => setField('honoreeEmail', e.target.value || undefined)}
                  className="h-9 text-sm"
                />
              </div>

              {/* Personal message */}
              <div className="space-y-1.5">
                <Label htmlFor={`${uid}-hmsg`} className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                  Kişisel Mesaj
                </Label>
                <textarea
                  id={`${uid}-hmsg`}
                  rows={3}
                  maxLength={1000}
                  value={value.message}
                  onChange={(e) => setField('message', e.target.value)}
                  placeholder="Mesajınızı buraya yazın..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-white"
                />
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setField('message', getOccasionTemplate(value.occasion, value.honoreeName || undefined))}
                    className="text-xs text-purple-600 hover:underline"
                  >
                    Şablonu geri yükle
                  </button>
                  <span className="text-[11px] text-gray-400">{value.message.length}/1000</span>
                </div>
              </div>

              {/* Preview badge */}
              {value.honoreeName && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-white rounded-lg border border-purple-100 px-3 py-2.5 text-sm text-gray-700"
                >
                  <span className="text-base">
                    {TRIBUTE_OCCASIONS.find((o) => o.id === value.occasion)?.emoji ?? '💙'}
                  </span>
                  <span>
                    <strong>{value.honoreeName}</strong> adına bağış yapılacak
                    {value.honoreeEmail && (
                      <span className="text-gray-400"> · {value.honoreeEmail} adresine bildirim gönderilecek</span>
                    )}
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { EMPTY_TRIBUTE };
export type { TributeInfo };
