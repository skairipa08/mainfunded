import { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const isTr = locale === 'tr';
    return {
        title: isTr
            ? 'Özel Gereksinimli Çocuklar Destek Fonu | FundEd'
            : 'Special Needs Children Support Fund | FundEd',
        description: isTr
            ? 'Otizm, disleksi, işitme ve görme engeli olan çocuklarımız için özel eğitim ve terapi desteği sağlayın. Onların hayallerine giden yolda bir adım da siz atın.'
            : 'Provide special education and therapy support for children with autism, dyslexia, hearing and visual impairments. Take a step with them on the way to their dreams.',
        openGraph: {
            title: isTr
                ? 'Özel Gereksinimli Çocuklar Destek Fonu | FundEd'
                : 'Special Needs Children Support Fund | FundEd',
            description: isTr
                ? 'Otizm, disleksi, işitme ve görme engeli olan çocuklarımız için özel eğitim ve terapi desteği sağlayın. Onların hayallerine giden yolda bir adım da siz atın.'
                : 'Provide special education and therapy support for children with autism, dyslexia, hearing and visual impairments. Take a step with them on the way to their dreams.',
            images: ['/og-image.png'],
            locale: isTr ? 'tr_TR' : 'en_US',
        }
    };
}

export default function SpecialNeedsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
