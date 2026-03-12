'use client';

import React, { useState } from 'react';
import { Code, Copy, Check, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/context';

export function EmbedCodeModal({ campaignId }: { campaignId: string }) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState<'script' | 'iframe' | null>(null);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fund-ed.com';

    const scriptCode = `<!-- FundEd Widget -->\n<div class="funded-campaign-widget" data-campaign-id="${campaignId}" data-theme="light"></div>\n<script src="${origin}/widget.js" async></script>`;

    const iframeCode = `<iframe \n  src="${origin}/tr/embed/campaign/${campaignId}?theme=light" \n  width="100%" \n  height="450" \n  style="border:none;border-radius:12px;overflow:hidden;max-width:600px;min-width:300px;" \n  loading="lazy"\n></iframe>`;

    const copyToClipboard = (text: string, type: 'script' | 'iframe') => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <>
            <button
                onClick={(e) => { e.preventDefault(); setIsOpen(true); }}
                className="w-full h-12 mt-3 flex items-center justify-center gap-2 border border-gray-300 rounded-lg text-base font-semibold hover:bg-gray-50 transition-colors"
            >
                <Code className="h-4 w-4" />
                {t('campaign.embed') || 'Sitene Ekle'}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setIsOpen(false)}>
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 flex flex-col relative"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: 'bounce-fade 0.3s ease-out' }}
                    >
                        <style dangerouslySetInnerHTML={{
                            __html: `
              @keyframes bounce-fade {
                0% { opacity: 0; transform: scale(0.95) translateY(10px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}} />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full p-1 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h3 className="text-xl font-bold mb-2 pr-6">
                            {t('campaign.embedTitle') || "Kampanya Widget'ı"}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 font-medium">
                            {t('campaign.embedDesc') || 'Aşağıdaki kodlardan birini kopyalayarak bu kampanyayı web sitenize veya blogunuza ekleyebilirsiniz.'}
                        </p>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-700">1. Script Metodu (Önerilen)</span>
                                    <button
                                        onClick={() => copyToClipboard(scriptCode, 'script')}
                                        className="flex text-xs font-semibold items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
                                    >
                                        {copied === 'script' ? (
                                            <><Check className="h-3.5 w-3.5 text-green-600" /><span className="text-green-600">Kopyalandı</span></>
                                        ) : (
                                            <><Copy className="h-3.5 w-3.5 text-gray-600" /><span className="text-gray-600">Kopyala</span></>
                                        )}
                                    </button>
                                </div>
                                <pre className="bg-gray-50 p-3.5 rounded-lg text-xs overflow-x-auto text-gray-800 border border-gray-200 custom-scrollbar">
                                    <code>{scriptCode}</code>
                                </pre>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-700">2. Iframe Metodu</span>
                                    <button
                                        onClick={() => copyToClipboard(iframeCode, 'iframe')}
                                        className="flex text-xs font-semibold items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
                                    >
                                        {copied === 'iframe' ? (
                                            <><Check className="h-3.5 w-3.5 text-green-600" /><span className="text-green-600">Kopyalandı</span></>
                                        ) : (
                                            <><Copy className="h-3.5 w-3.5 text-gray-600" /><span className="text-gray-600">Kopyala</span></>
                                        )}
                                    </button>
                                </div>
                                <pre className="bg-gray-50 p-3.5 rounded-lg text-xs overflow-x-auto text-gray-800 border border-gray-200 custom-scrollbar">
                                    <code>{iframeCode}</code>
                                </pre>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
