import { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const isTr = locale === 'tr';
    return {
        title: isTr
            ? 'Aktif Kampanyalar ve Öğrenciler | FundEd'
            : 'Active Campaigns and Students | FundEd',
        description: isTr
            ? 'Eğitim ve terapi desteği bekleyen doğrulanmış çocukların hikayelerini keşfedin. İhtiyaç duydukları destek türüne göre güvenli bağış yaparak hayatlarına dokunun.'
            : 'Discover the stories of verified children waiting for education and therapy support. Make a secure donation according to the type of support they need and touch their lives.',
        openGraph: {
            title: isTr
                ? 'Aktif Kampanyalar ve Öğrenciler | FundEd'
                : 'Active Campaigns and Students | FundEd',
            description: isTr
                ? 'Eğitim ve terapi desteği bekleyen doğrulanmış çocukların hikayelerini keşfedin. İhtiyaç duydukları destek türüne göre güvenli bağış yaparak hayatlarına dokunun.'
                : 'Discover the stories of verified children waiting for education and therapy support. Make a secure donation according to the type of support they need and touch their lives.',
            images: ['/og-image.png'],
            locale: isTr ? 'tr_TR' : 'en_US',
        }
    };
}

export default function BrowseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
