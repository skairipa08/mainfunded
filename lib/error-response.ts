import { NextResponse } from 'next/server';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: any
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

export function successResponse<T>(data: T, message?: string): NextResponse<{ success: true; data: T; message?: string }> {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message }),
  });
}
