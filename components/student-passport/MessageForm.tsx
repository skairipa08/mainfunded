'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

export function MessageForm({ studentId }: { studentId: string }) {
    const t = useTranslations('studentPassport');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSending(true);
        try {
            const res = await fetch(`/api/student/${studentId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            const data = await res.json();
            if (!res.ok) {
                if (data.error === 'rate_limit') toast.error(t('messaging.errorRateLimit'));
                else if (data.error === 'moderation') toast.error(t('messaging.errorModeration'));
                else toast.error(t('messaging.error'));
            } else {
                toast.success(t('messaging.success'));
                setMessage('');
            }
        } catch (err) {
            toast.error(t('messaging.error'));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-3 dark:border-slate-800">{t('messaging.title')}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('messaging.placeholder')}
                    className="w-full p-4 border rounded-xl resize-none h-32 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 shadow-inner transition-shadow text-slate-700 dark:text-slate-200"
                    disabled={isSending}
                    maxLength={500}
                />
                <button
                    type="submit"
                    disabled={isSending || !message.trim()}
                    className="self-end px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-all font-semibold shadow-md hover:shadow-lg active:scale-95"
                >
                    {isSending ? t('messaging.sending') : t('messaging.send')}
                </button>
            </form>
        </div>
    );
}
