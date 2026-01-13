import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: "FundEd API is running",
    version: "2.0.0",
    docs: "/api/docs"
  });
}
