import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/notifications — fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id ?? session.user.email;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const unreadOnly = searchParams.get('unread') === 'true';

    const db = await getDb();

    const query: any = { userId };
    if (unreadOnly) query.read = false;

    const notifications = await db
      .collection('notifications')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    const unreadCount = await db
      .collection('notifications')
      .countDocuments({ userId, read: false });

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id ?? n._id?.toString(),
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read ?? false,
        timestamp: n.timestamp,
        link: n.link,
        metadata: n.metadata,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error('[Notifications API] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications — create a notification
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = (session.user as any).id ?? session.user.email;

    const notification = {
      id:
        body.id ??
        Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      userId,
      type: body.type ?? 'system',
      title: body.title ?? 'Bildirim',
      message: body.message ?? '',
      read: false,
      timestamp: body.timestamp ?? new Date().toISOString(),
      link: body.link ?? null,
      metadata: body.metadata ?? {},
      createdAt: new Date(),
    };

    const db = await getDb();
    await db.collection('notifications').insertOne(notification);

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('[Notifications API] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
