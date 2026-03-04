import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Gizlilik Politikası | FundEd',
    description: 'FundEd KVKK uyumlu gizlilik politikası ve kişisel verilerin korunması hakkında bilgilendirme.',
};

export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
