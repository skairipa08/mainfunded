import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
    sendEmail,
    renderFeedbackThankYouEmail,
    renderFeedbackNotificationEmail,
} from '@/lib/email';
import { z } from 'zod';

const feedbackSchema = z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
    email: z.string().email('Geçersiz e-posta adresi'),
    message: z.string().min(10, 'Mesaj en az 10 karakter olmalıdır').max(2000, 'Mesaj en fazla 2000 karakter olabilir'),
    rating: z.number().min(1).max(5).optional(),
    category: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = feedbackSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0]?.message || 'Geçersiz giriş' },
                { status: 400 }
            );
        }

        const { name, email, message, rating, category } = parsed.data;

        // Save feedback to database
        const db = await getDb();
        await db.collection('feedbacks').insertOne({
            name,
            email: email.toLowerCase(),
            message,
            rating: rating || null,
            category: category || 'general',
            status: 'new',
            createdAt: new Date(),
        });

        // Send thank-you email to the user
        const thankYouHtml = renderFeedbackThankYouEmail({
            userName: name,
            message,
        });

        sendEmail({
            to: email,
            subject: '💜 Geri bildiriminiz için teşekkürler! — FundEd',
            html: thankYouHtml,
        }).catch((err) => console.error('[Feedback] Thank-you email error:', err));

        // Send notification to admin(s)
        const adminEmails = (process.env.ADMIN_EMAILS || '')
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean);

        if (adminEmails.length > 0) {
            const notificationHtml = renderFeedbackNotificationEmail({
                userName: name,
                userEmail: email,
                message,
                rating,
            });

            for (const adminEmail of adminEmails) {
                sendEmail({
                    to: adminEmail,
                    subject: `📩 Yeni Geri Bildirim: ${name}`,
                    html: notificationHtml,
                }).catch((err) => console.error('[Feedback] Admin notification error:', err));
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Geri bildiriminiz başarıyla gönderildi. Teşekkür ederiz!',
        });
    } catch (error) {
        console.error('Feedback error:', error);
        return NextResponse.json(
            { error: 'Geri bildirim gönderilemedi. Lütfen tekrar deneyin.' },
            { status: 500 }
        );
    }
}
