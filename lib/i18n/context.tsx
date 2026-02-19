'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import translations
import en from '@/locales/en.json';
import tr from '@/locales/tr.json';
import de from '@/locales/de.json';
import ar from '@/locales/ar.json';
import zh from '@/locales/zh.json';
import ru from '@/locales/ru.json';
import fr from '@/locales/fr.json';
import es from '@/locales/es.json';

// Available locales
export type Locale = 'en' | 'tr' | 'de' | 'ar' | 'zh' | 'ru' | 'fr' | 'es';

const translations: Record<Locale, typeof en> = {
    en,
    tr,
    de,
    ar,
    zh,
    ru,
    fr,
    es,
};

// Helper function to get nested translation value
function getNestedValue(obj: any, path: string): string {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            return path; // Return the key if translation not found
        }
    }

    return typeof result === 'string' ? result : path;
}

// Context type
interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Storage key
const LOCALE_STORAGE_KEY = 'funded-locale';

// Provider component
export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');
    const [mounted, setMounted] = useState(false);

    // Load saved locale on mount
    useEffect(() => {
        let detected: Locale = 'en';
        const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale;
        const validLocales: Locale[] = ['en', 'tr', 'de', 'ar', 'zh', 'ru', 'fr', 'es'];
        if (savedLocale && validLocales.includes(savedLocale)) {
            detected = savedLocale;
        } else {
            // Detect browser language
            const browserLang = navigator.language.toLowerCase();
            if (browserLang.startsWith('tr')) detected = 'tr';
            else if (browserLang.startsWith('de')) detected = 'de';
            else if (browserLang.startsWith('ar')) detected = 'ar';
            else if (browserLang.startsWith('zh')) detected = 'zh';
            else if (browserLang.startsWith('ru')) detected = 'ru';
            else if (browserLang.startsWith('fr')) detected = 'fr';
            else if (browserLang.startsWith('es')) detected = 'es';
        }
        setLocaleState(detected);
        // Sync HTML attributes so lang="en" from the server is corrected
        document.documentElement.lang = detected;
        document.documentElement.dir = detected === 'ar' ? 'rtl' : 'ltr';
        setMounted(true);
    }, []);

    // Save locale to localStorage
    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);

        // Update HTML lang attribute
        document.documentElement.lang = newLocale;
        // Update HTML dir attribute for RTL
        document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    };

    // Translation function
    const t = (key: string, params?: Record<string, string | number>): string => {
        let translation = getNestedValue(translations[locale], key);

        // Fallback to English if translation is missing (i.e., returns the key) and we are not already in English
        if (translation === key && locale !== 'en') {
            const enTranslation = getNestedValue(translations['en'], key);
            if (enTranslation !== key) {
                translation = enTranslation;
            }
        }

        // Replace parameters like {name} with actual values
        if (params) {
            Object.entries(params).forEach(([paramKey, value]) => {
                translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
            });
        }

        return translation;
    };

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <I18nContext.Provider value={{ locale: 'en', setLocale, t }}>
                {children}
            </I18nContext.Provider>
        );
    }

    return (
        <I18nContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </I18nContext.Provider>
    );
}

// Hook to use translations
export function useTranslation() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
}

// Hook to get current locale
export function useLocale() {
    const { locale, setLocale } = useTranslation();
    return { locale, setLocale };
}
