import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kullanım Koşulları | FundEd',
    description: 'FundEd platform kullanım koşulları, komisyon oranları ve sorumluluk bildirimi.',
};

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
