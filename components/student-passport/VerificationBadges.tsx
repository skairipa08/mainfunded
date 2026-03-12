import { useTranslations } from 'next-intl';
import { ShieldCheck, School, FileSignature } from 'lucide-react';

interface VerificationBadgesProps {
    verifications: any[];
}

export function VerificationBadges({ verifications }: VerificationBadgesProps) {
    const t = useTranslations('studentPassport');

    if (!verifications || verifications.length === 0) return null;

    const BADGE_CONFIG = {
        ID: { icon: ShieldCheck, key: 'idVerified', color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' },
        SCHOOL: { icon: School, key: 'schoolApproved', color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400' },
        TEACHER: { icon: FileSignature, key: 'teacherReference', color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-400' }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-5 border-b pb-3 dark:border-slate-800">{t('verifications.title')}</h2>
            <div className="flex flex-wrap gap-4">
                {verifications.map((v, i) => {
                    const config = BADGE_CONFIG[v.type as keyof typeof BADGE_CONFIG];
                    if (!config) return null;
                    const Icon = config.icon;
                    return (
                        <div key={i} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border shadow-sm transition-transform hover:scale-105 cursor-default ${config.color}`}>
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-semibold tracking-wide">{t(`verifications.${config.key}`)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
