'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';

export default function HomeSearchBar() {
    const router = useRouter();
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
                <Input
                    type="text"
                    placeholder={t('common.search') + '...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 text-white placeholder:text-blue-200 bg-white/10 border-white/30 focus:border-white"
                />
                <Button type="submit" size="lg">
                    <Search className="mr-2 h-5 w-5" />
                    {t('common.search')}
                </Button>
            </div>
        </form>
    );
}
