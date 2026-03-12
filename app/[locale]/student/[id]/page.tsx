import { notFound } from 'next/navigation';
import { applyPrivacySettings, ViewerRole } from '@/lib/student-privacy';
import { ProfileHeader } from '@/components/student-passport/ProfileHeader';
import { VerificationBadges } from '@/components/student-passport/VerificationBadges';
import { Timeline } from '@/components/student-passport/Timeline';
import { MessageForm } from '@/components/student-passport/MessageForm';

// Mock DB function - in a real app this would use Prisma client
async function getStudentProfile(id: string) {
    // Mock data for demo purposes
    if (id !== '1') return null;

    return {
        profile: {
            id: '1',
            userId: 'user-1',
            photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&auto=format&fit=crop',
            age: 21,
            schoolName: 'Bogazici University',
            grade: '3rd Year',
            major: 'Computer Engineering',
            careerGoal: 'Software Engineer specializing in AI',
            hobbies: ['Reading', 'Coding', 'Chess'],
            shortStory: 'I grew up in a small town and always dreamed of building technology that helps people. Thanks to my donors, I am now able to focus entirely on my studies without worrying about financial constraints.',
            gpa: 3.8,
        },
        settings: {
            ageVisibility: 'EVERYONE',
            gpaVisibility: 'DONORS_ONLY',
            storyVisibility: 'EVERYONE'
        },
        verifications: [
            { type: 'ID', status: 'APPROVED' },
            { type: 'SCHOOL', status: 'APPROVED' },
            { type: 'TEACHER', status: 'APPROVED' }
        ],
        achievements: [
            { id: 'a1', type: 'SCHOLARSHIP', title: 'First Scholarship Received', date: new Date('2023-09-01') },
            { id: 'a2', type: 'PASSED_CLASS', title: 'Finished 1st Year', date: new Date('2024-06-15') },
            { id: 'a3', type: 'OTHER', title: 'Hackathon Winner', description: 'Won 1st place in national AI hackathon', date: new Date('2025-05-20') }
        ]
    };
}

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
    const data = await getStudentProfile(params.id);

    if (!data) {
        notFound();
    }

    // Determine viewer role (in real app, get from auth session + db check if donor donated to this student)
    const viewerRole: ViewerRole = 'EVERYONE'; // change to 'DONORS_ONLY' to see hidden fields like GPA

    // Apply privacy settings
    const safeProfile = applyPrivacySettings(data.profile, data.settings, viewerRole);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <ProfileHeader profile={safeProfile} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Timeline achievements={data.achievements} />
                    </div>

                    <div className="space-y-6">
                        <VerificationBadges verifications={data.verifications} />
                        <MessageForm studentId={data.profile.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
