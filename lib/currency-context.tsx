'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useTranslation } from '@/lib/i18n';
import { formatCurrency, convertAmount, convertToUSD, getPresetAmounts, type CurrencyCode } from '@/lib/currency';

// ═══════════════════════════════════════════════════════
// Currency Context — provides currency state + helpers
// ═══════════════════════════════════════════════════════

const CURRENCY_STORAGE_KEY = 'funded-currency';
const DEFAULT_RATE = 36.5;
const RATE_REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  exchangeRate: number;
  isLoading: boolean;
  rateUpdatedAt: Date | null;
  /** Format a USD amount in the user's chosen currency */
  formatAmount: (amountInUSD: number) => string;
  /** Format amount keeping it in USD (for labels like "≈ $X") */
  formatUSD: (amount: number) => string;
  /** Convert a displayed-currency amount back to USD */
  toUSD: (amountInDisplayCurrency: number) => number;
  /** Get preset donation amounts in the current currency */
  presetAmounts: number[];
  /** Currency symbol for input fields */
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

/** Determine default currency from locale */
function defaultCurrencyForLocale(locale: string): CurrencyCode {
  return locale === 'tr' ? 'TRY' : 'USD';
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { locale } = useTranslation();
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_RATE);
  const [rateUpdatedAt, setRateUpdatedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Fetch exchange rate from our API
  const fetchRate = useCallback(async () => {
    try {
      const res = await fetch('/api/exchange-rate', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.rate && typeof data.rate === 'number') {
          setExchangeRate(data.rate);
          setRateUpdatedAt(new Date(data.updatedAt));
        }
      }
    } catch (err) {
      console.warn('[Currency] Failed to fetch exchange rate, using cached/default');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    // Check saved preference
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null;
    if (saved === 'USD' || saved === 'TRY') {
      setCurrencyState(saved);
    } else {
      // Auto-detect from locale
      setCurrencyState(defaultCurrencyForLocale(locale));
    }
    setMounted(true);
    fetchRate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When locale changes (user switches language), update currency if no manual override
  useEffect(() => {
    if (!mounted) return;
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (!saved) {
      // No manual preference — follow locale
      setCurrencyState(defaultCurrencyForLocale(locale));
    }
  }, [locale, mounted]);

  // Periodic refresh of exchange rate
  useEffect(() => {
    const interval = setInterval(fetchRate, RATE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchRate]);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem(CURRENCY_STORAGE_KEY, c);
  }, []);

  const formatAmount = useCallback(
    (amountInUSD: number): string => {
      if (currency === 'TRY') {
        const tryAmount = convertAmount(amountInUSD, exchangeRate);
        return formatCurrency(tryAmount, 'TRY', 'tr-TR');
      }
      return formatCurrency(amountInUSD, 'USD', 'en-US');
    },
    [currency, exchangeRate]
  );

  const formatUSD = useCallback(
    (amount: number): string => formatCurrency(amount, 'USD', 'en-US'),
    []
  );

  const toUSD = useCallback(
    (amountInDisplayCurrency: number): number => {
      if (currency === 'TRY') {
        return convertToUSD(amountInDisplayCurrency, exchangeRate);
      }
      return amountInDisplayCurrency;
    },
    [currency, exchangeRate]
  );

  const presetAmounts = getPresetAmounts(currency, exchangeRate);
  const currencySymbol = currency === 'TRY' ? '₺' : '$';

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    exchangeRate,
    isLoading,
    rateUpdatedAt,
    formatAmount,
    formatUSD,
    toUSD,
    presetAmounts,
    currencySymbol,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * Hook to access currency context.
 * Must be used within CurrencyProvider.
 */
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
