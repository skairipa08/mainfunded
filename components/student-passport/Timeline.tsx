import { useTranslations } from 'next-intl';

interface TimelineProps {
    achievements: any[];
}

export function Timeline({ achievements }: TimelineProps) {
    const t = useTranslations('studentPassport');

    if (!achievements || achievements.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-8 border-b pb-3 dark:border-slate-800">{t('timeline.title')}</h2>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:to-indigo-50 dark:before:to-slate-900">
                {achievements.map((item, idx) => {
                    let translatedTitle = item.title;
                    if (item.type === 'SCHOLARSHIP') translatedTitle = t('timeline.receivedScholarship');
                    if (item.type === 'PASSED_CLASS') translatedTitle = t('timeline.passedClass');
                    if (item.type === 'GRADUATED') translatedTitle = t('timeline.graduated');

                    return (
                        <div key={item.id || idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md z-10 transition-transform hover:scale-110">
                                ⭐
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-slate-800 dark:text-slate-100 text-base">
                                        {translatedTitle}
                                    </span>
                                    {item.date && (
                                        <span className="text-xs font-bold px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full shadow-inner">
                                            {new Date(item.date).getFullYear()}
                                        </span>
                                    )}
                                </div>
                                {item.description && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
