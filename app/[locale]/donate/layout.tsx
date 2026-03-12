import { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const isTr = locale === 'tr';
    return {
        title: isTr
            ? 'Güvenli Bağış Yap | Çocuklar İçin Eğitim ve Terapi'
            : 'Make a Secure Donation | Education and Therapy for Children',
        description: isTr
            ? 'Şeffaf ve güvenli altyapımız ile bir çocuğun eğitim veya terapi masraflarına doğrudan destek olun. Geleceği birlikte inşa edelim.'
            : 'Directly support a child\'s education or therapy expenses with our transparent and secure infrastructure. Let\'s build the future together.',
        openGraph: {
            title: isTr
                ? 'Güvenli Bağış Yap | Çocuklar İçin Eğitim ve Terapi'
                : 'Make a Secure Donation | Education and Therapy for Children',
            description: isTr
                ? 'Şeffaf ve güvenli altyapımız ile bir çocuğun eğitim veya terapi masraflarına doğrudan destek olun. Geleceği birlikte inşa edelim.'
                : 'Directly support a child\'s education or therapy expenses with our transparent and secure infrastructure. Let\'s build the future together.',
            images: ['/og-image.png'],
            locale: isTr ? 'tr_TR' : 'en_US',
        }
    };
}

export default function DonateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
