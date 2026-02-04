import { NextRequest, NextResponse } from 'next/server';
import { mockNotifications } from '@/lib/corporate/mock-data';

export const runtime = 'nodejs';

/**
 * GET /api/corporate/notifications
 * Returns notifications for the corporate account
 * 
 * Query params:
 * - type: 'update' | 'thank_you' | 'campaign' | 'milestone'
 * - unread: 'true' | 'false'
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type');
        const unread = searchParams.get('unread');

        let notifications = [...mockNotifications];

        // Apply filters
        if (type) {
            notifications = notifications.filter((n) => n.type === type);
        }
        if (unread === 'true') {
            notifications = notifications.filter((n) => !n.read);
        }

        // Sort by date descending
        notifications.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return NextResponse.json({
            success: true,
            data: {
                notifications,
                unreadCount: mockNotifications.filter((n) => !n.read).length,
                total: notifications.length,
            },
            meta: {
                timestamp: new Date().toISOString(),
                version: '1.0',
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch notifications',
            },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/corporate/notifications
 * Mark notifications as read
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.ids || !Array.isArray(body.ids)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request: ids array required',
                },
                { status: 400 }
            );
        }

        // In production, update database
        return NextResponse.json({
            success: true,
            data: {
                updated: body.ids.length,
                action: body.markAsRead ? 'marked_read' : 'marked_unread',
            },
            meta: {
                timestamp: new Date().toISOString(),
                version: '1.0',
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update notifications',
            },
            { status: 500 }
        );
    }
}
