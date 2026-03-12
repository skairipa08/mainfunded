import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface ProfileHeaderProps {
    profile: any;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
    const t = useTranslations('studentPassport');

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 mb-6 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left transition-all hover:shadow-xl">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-100 dark:border-indigo-900 shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {profile.photoUrl ? (
                    <Image src={profile.photoUrl} alt="Profile" fill className="object-cover" />
                ) : (
                    <span className="text-4xl text-slate-400">👤</span>
                )}
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-4">
                    {t('title')}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-sm text-slate-600 dark:text-slate-300">
                    {profile.age && <p><span className="font-semibold text-slate-900 dark:text-slate-200">{t('age')}:</span> {profile.age}</p>}
                    {profile.schoolName && <p><span className="font-semibold text-slate-900 dark:text-slate-200">{t('schoolName')}:</span> {profile.schoolName}</p>}
                    {profile.grade && <p><span className="font-semibold text-slate-900 dark:text-slate-200">{t('grade')}:</span> {profile.grade}</p>}
                    {profile.major && <p><span className="font-semibold text-slate-900 dark:text-slate-200">{t('major')}:</span> {profile.major}</p>}
                    {profile.careerGoal && <p><span className="font-semibold text-slate-900 dark:text-slate-200">{t('careerGoal')}:</span> {profile.careerGoal}</p>}
                    {profile.hobbies && profile.hobbies.length > 0 && <p><span className="font-semibold text-slate-900 dark:text-slate-200">{t('hobbies')}:</span> {profile.hobbies.join(', ')}</p>}
                    {profile.gpa && <p className="col-span-1 sm:col-span-2 md:col-span-3 mt-1"><span className="font-semibold text-indigo-600 dark:text-indigo-400">{t('gpa')}:</span> <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg ml-1">{profile.gpa}</span></p>}
                </div>
                {profile.shortStory && (
                    <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-800 rounded-md border-l-4 border-indigo-500 shadow-sm">
                        <p className="text-sm italic text-slate-700 dark:text-slate-300 leading-relaxed">&quot;{profile.shortStory}&quot;</p>
                    </div>
                )}
            </div>
        </div>
    );
}
