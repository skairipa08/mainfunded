import { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const isTr = locale === 'tr';
    return {
        title: isTr
            ? 'FundEd Vizyonu ve İlkelerimiz | Eğitimde Güçlü Gelecek'
            : 'FundEd Vision and Principles | A Strong Future in Education',
        description: isTr
            ? 'Toplumsal cinsiyet eşitliği, nitelikli eğitim ve eşitsizliklerin azaltılması hedeflerimizle çocukların eğitimine ve gelişimine kalıcı katkılar sağlıyoruz.'
            : 'With our goals of gender equality, quality education, and reduced inequalities, we make lasting contributions to children\'s education and development.',
        openGraph: {
            title: isTr
                ? 'FundEd Vizyonu ve İlkelerimiz | Eğitimde Güçlü Gelecek'
                : 'FundEd Vision and Principles | A Strong Future in Education',
            description: isTr
                ? 'Toplumsal cinsiyet eşitliği, nitelikli eğitim ve eşitsizliklerin azaltılması hedeflerimizle çocukların eğitimine ve gelişimine kalıcı katkılar sağlıyoruz.'
                : 'With our goals of gender equality, quality education, and reduced inequalities, we make lasting contributions to children\'s education and development.',
            images: ['/og-image.png'],
            locale: isTr ? 'tr_TR' : 'en_US',
        }
    };
}

export default function GoalsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
