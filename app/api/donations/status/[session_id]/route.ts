import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { session_id: string } }
) {
  try {
    const db = await getDb();
    const sessionId = params.session_id;
    
    const transaction = await db.collection('payment_transactions').findOne(
      { session_id: sessionId },
      { projection: { _id: 0 } }
    );
    
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        status: transaction.payment_status,
        payment_status: transaction.payment_status,
        amount: transaction.amount,
        campaign_id: transaction.campaign_id
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
