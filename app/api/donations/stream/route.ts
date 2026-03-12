import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/donations/stream?campaign_id=xxx
 * Server-Sent Events stream that pushes new donations in real-time.
 * Falls back gracefully if DB is unavailable.
 * Poll interval: 5s (server-side), client re-connects on close.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get('campaign_id');

  if (!campaignId) {
    return new Response('campaign_id is required', { status: 400 });
  }

  const encoder = new TextEncoder();

  let lastSeenDate: Date = new Date();
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let controllerClosed = false;

  const stream = new ReadableStream({
    start(controller) {
      // Send a keep-alive comment immediately so the client confirms connection
      const sendEvent = (data: object) => {
        if (controllerClosed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // Controller already closed
        }
      };

      const sendKeepAlive = () => {
        if (controllerClosed) return;
        try {
          controller.enqueue(encoder.encode(`: keep-alive\n\n`));
        } catch {
          // ignore
        }
      };

      // Poll the DB every 5 seconds for new donations
      const poll = async () => {
        if (controllerClosed) return;
        try {
          const db = await getDb();
          const newDonations = await db
            .collection('donations')
            .find(
              {
                campaign_id: campaignId,
                payment_status: 'paid',
                created_at: { $gt: lastSeenDate },
              },
              {
                projection: {
                  _id: 0,
                  donor_name: 1,
                  amount: 1,
                  currency: 1,
                  anonymous: 1,
                  created_at: 1,
                },
              }
            )
            .sort({ created_at: 1 })
            .toArray();

          if (newDonations.length > 0) {
            lastSeenDate = newDonations[newDonations.length - 1].created_at;

            for (const donation of newDonations) {
              const displayName = donation.anonymous
                ? 'Bir destekçi'
                : maskDonorName(donation.donor_name || '');
              sendEvent({
                type: 'new_donation',
                payload: {
                  displayName,
                  amount: donation.amount,
                  currency: donation.currency || 'TRY',
                  anonymous: !!donation.anonymous,
                  createdAt: donation.created_at,
                },
              });
            }
          } else {
            sendKeepAlive();
          }
        } catch (err) {
          // DB error → send keep-alive so client doesn't disconnect
          sendKeepAlive();
        }
      };

      // Initial poll
      poll();

      // Then every 5 seconds
      intervalId = setInterval(poll, 5000);

      // Listen for client disconnect
      request.signal.addEventListener('abort', () => {
        controllerClosed = true;
        if (intervalId) clearInterval(intervalId);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },

    cancel() {
      controllerClosed = true;
      if (intervalId) clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

function maskDonorName(name: string): string {
  if (!name || name.trim() === '') return 'Bir destekçi';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}
