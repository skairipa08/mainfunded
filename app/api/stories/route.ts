export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/authz';
import { successResponse, errorResponse, handleRouteError } from '@/lib/api-response';
import crypto from 'crypto';

/**
 * GET /api/stories
 * Public: returns approved success stories
 */
export async function GET(request: NextRequest) {
    try {
        const db = await getDb();
        const { searchParams } = new URL(request.url);

        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
        const skip = (page - 1) * limit;

        const query = { status: 'approved' };
        const totalCount = await db.collection('success_stories').countDocuments(query);

        const stories = await db.collection('success_stories')
            .find(query, {
                projection: {
                    _id: 0,
                    story_id: 1,
                    user_name: 1,
                    title: 1,
                    quote: 1,
                    university: 1,
                    field: 1,
                    funded_amount: 1,
                    created_at: 1,
                },
            })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        return successResponse({
            stories,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        return handleRouteError(error);
    }
}

/**
 * POST /api/stories
 * Authenticated: create a new success story (pending approval)
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return errorResponse({ code: 'UNAUTHORIZED', message: 'Giriş yapmanız gerekiyor' }, 401);
        }

        const db = await getDb();
        const body = await request.json();

        const { title, quote, university, field, funded_amount } = body;

        // Validation
        if (!quote || typeof quote !== 'string' || quote.trim().length < 10) {
            return errorResponse({
                code: 'VALIDATION_ERROR',
                message: 'Hikaye en az 10 karakter olmalıdır',
            }, 400);
        }

        if (!university || typeof university !== 'string' || university.trim().length < 2) {
            return errorResponse({
                code: 'VALIDATION_ERROR',
                message: 'Üniversite adı gereklidir',
            }, 400);
        }

        if (!field || typeof field !== 'string' || field.trim().length < 2) {
            return errorResponse({
                code: 'VALIDATION_ERROR',
                message: 'Bölüm adı gereklidir',
            }, 400);
        }

        const story = {
            story_id: `story_${crypto.randomBytes(8).toString('hex')}`,
            user_id: user.id,
            user_name: user.name || 'Anonim',
            user_email: user.email || '',
            title: (title || '').trim().substring(0, 200) || 'Başarı Hikayem',
            quote: quote.trim().substring(0, 1000),
            university: university.trim().substring(0, 200),
            field: field.trim().substring(0, 200),
            funded_amount: Math.max(0, parseFloat(funded_amount) || 0),
            status: 'pending',
            admin_note: null,
            reviewed_by: null,
            reviewed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        await db.collection('success_stories').insertOne(story);

        return successResponse({ story_id: story.story_id }, 'Hikayeniz başarıyla gönderildi. Onay sonrası yayınlanacaktır.', 201);
    } catch (error) {
        return handleRouteError(error);
    }
}
