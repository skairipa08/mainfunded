import { NextResponse } from 'next/server';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export function successResponse(data: any, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

export function errorResponse(error: ApiError | string, status = 400) {
  const errorObj: ApiError =
    typeof error === 'string'
      ? { code: 'ERROR', message: error }
      : error;

  return NextResponse.json(
    {
      success: false,
      error: errorObj,
    },
    { status }
  );
}

export function handleRouteError(error: unknown): NextResponse {
  if (error && typeof error === 'object' && 'issues' in error) {
    return errorResponse({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: (error as any).issues,
    }, 400);
  }

  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as any).statusCode;
    const message = (error as any).message || 'Error';
    return errorResponse({ code: 'AUTH_ERROR', message }, statusCode);
  }

  console.error('Route error:', error instanceof Error ? error.message : '[non-Error object]');
  return errorResponse(
    {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
    500
  );
}
