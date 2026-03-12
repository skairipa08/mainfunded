import * as React from 'react';
import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Img,
    Button,
    Link,
} from '@react-email/components';

interface ImpactReportEmailProps {
    donorName: string;
    studentName: string;
    studentPhotoUrl: string;
    yearsSupported: number;
    newAchievements: string[];
    gpaChange?: string; // e.g. "+0.2"
    followUrl: string;
    impactCardUrl: string;
    campaignUrl: string;
    t: (key: string, variables?: Record<string, any>) => string;
}

export const ImpactReportEmail = ({
    donorName,
    studentName,
    studentPhotoUrl,
    yearsSupported,
    newAchievements,
    gpaChange,
    followUrl,
    impactCardUrl,
    campaignUrl,
    t,
}: ImpactReportEmailProps) => {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={headerSection}>
                        <Text style={headerTitle}>
                            {t('email.impactReport.header', { years: yearsSupported })}
                        </Text>
                    </Section>

                    <Section style={contentSection}>
                        <Text style={greeting}>
                            {t('email.impactReport.greeting', { donorName })}
                        </Text>

                        <Text style={introText}>
                            {t('email.impactReport.intro', { studentName, years: yearsSupported })}
                        </Text>

                        <Section style={studentCard}>
                            <Img
                                src={studentPhotoUrl}
                                alt={studentName}
                                width="120"
                                height="120"
                                style={studentImage}
                            />
                            <Text style={studentNameTitle}>{studentName}</Text>

                            {/* Achievements Segment */}
                            {newAchievements.length > 0 && (
                                <div style={achievementBox}>
                                    <Text style={sectionSubtitle}>{t('email.impactReport.achievementsTitle')}</Text>
                                    <ul style={achievementList}>
                                        {newAchievements.map((achiev, i) => (
                                            <li key={i} style={achievementItem}>{achiev}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* GPA Segment if allowed */}
                            {gpaChange && (
                                <div style={gpaBox}>
                                    <Text style={gpaText}>
                                        {t('email.impactReport.gpaProgress')} <strong style={{ color: '#10b981' }}>{gpaChange}</strong>
                                    </Text>
                                </div>
                            )}
                        </Section>

                        {/* Follow Section */}
                        <Section style={actionSection}>
                            <Text style={followText}>
                                {t('email.impactReport.followPrompt', { studentName })}
                            </Text>
                            <Button style={followButton} href={followUrl}>
                                {t('email.impactReport.followButton')}
                            </Button>
                        </Section>

                        {/* Social Sharing Section */}
                        <Section style={shareSection}>
                            <Text style={shareText}>
                                {t('email.impactReport.sharePrompt')}
                            </Text>
                            <Link href={impactCardUrl}>
                                <Img
                                    src={impactCardUrl}
                                    alt="Impact Card"
                                    style={impactCardImage}
                                />
                            </Link>
                        </Section>

                        <Section style={{ marginTop: '30px', textAlign: 'center' }}>
                            <Button style={campaignButton} href={campaignUrl}>
                                {t('email.impactReport.viewCampaign')}
                            </Button>
                        </Section>

                    </Section>

                    <Section style={footer}>
                        <Text style={footerText}>
                            © {new Date().getFullYear()} FundEd. {t('email.impactReport.footerRight')}
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

// Styles
const main = {
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '0',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
};

const headerSection = {
    backgroundColor: '#6366f1',
    padding: '30px 20px',
    textAlign: 'center' as const,
};

const headerTitle = {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
};

const contentSection = {
    padding: '30px 40px',
};

const greeting = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '10px',
};

const introText = {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.5',
};

const studentCard = {
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '25px',
    textAlign: 'center' as const,
};

const studentImage = {
    borderRadius: '50%',
    margin: '0 auto',
    objectFit: 'cover' as const,
};

const studentNameTitle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827',
    marginTop: '15px',
};

const achievementBox = {
    marginTop: '20px',
    textAlign: 'left' as const,
    backgroundColor: '#ffffff',
    padding: '15px',
    borderRadius: '6px',
};

const sectionSubtitle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#3b82f6',
    margin: '0 0 10px 0',
};

const achievementList = {
    margin: '0',
    paddingLeft: '20px',
    color: '#4b5563',
};

const achievementItem = {
    marginBottom: '4px',
};

const gpaBox = {
    marginTop: '15px',
    backgroundColor: '#ecfdf5',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #a7f3d0',
};

const gpaText = {
    margin: '0',
    color: '#065f46',
    fontWeight: '500',
    fontSize: '16px',
};

const actionSection = {
    marginTop: '35px',
    textAlign: 'center' as const,
    backgroundColor: '#eff6ff',
    padding: '25px',
    borderRadius: '8px',
};

const followText = {
    fontSize: '16px',
    color: '#1e3a8a',
    marginBottom: '15px',
};

const followButton = {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '6px',
    fontWeight: 'bold',
    textDecoration: 'none',
};

const campaignButton = {
    backgroundColor: '#10b981',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '6px',
    fontWeight: 'bold',
    textDecoration: 'none',
};

const shareSection = {
    marginTop: '35px',
    textAlign: 'center' as const,
};

const shareText = {
    fontSize: '16px',
    color: '#4b5563',
    marginBottom: '15px',
};

const impactCardImage = {
    maxWidth: '100%',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    margin: '0 auto',
};

const footer = {
    borderTop: '1px solid #e5e7eb',
    padding: '20px',
    textAlign: 'center' as const,
};

const footerText = {
    color: '#9ca3af',
    fontSize: '14px',
    margin: '0',
};

export default ImpactReportEmail;
