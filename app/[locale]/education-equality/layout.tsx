import { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const isTr = locale === 'tr';
    return {
        title: isTr
            ? 'Eğitimde Fırsat Eşitliği | FundEd'
            : 'Educational Equality | FundEd',
        description: isTr
            ? 'Dünyanın her yerindeki dezavantajlı çocuklar için eğitimde eşitlik sağlıyoruz. Okul malzemesi, dijital erişim ve güvenli eğitim ortamları için bağış yapın.'
            : 'We provide educational equality for disadvantaged children all over the world. Donate for school supplies, digital access, and safe educational environments.',
        openGraph: {
            title: isTr
                ? 'Eğitimde Fırsat Eşitliği | FundEd'
                : 'Educational Equality | FundEd',
            description: isTr
                ? 'Dünyanın her yerindeki dezavantajlı çocuklar için eğitimde eşitlik sağlıyoruz. Okul malzemesi, dijital erişim ve güvenli eğitim ortamları için bağış yapın.'
                : 'We provide educational equality for disadvantaged children all over the world. Donate for school supplies, digital access, and safe educational environments.',
            images: ['/og-image.png'],
            locale: isTr ? 'tr_TR' : 'en_US',
        }
    };
}

export default function EducationEqualityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
