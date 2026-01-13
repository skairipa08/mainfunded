export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof APIError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
    };
  }

  if (error instanceof Error) {
    // Map common error messages to status codes
    if (error.message === 'Unauthorized') {
      return {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      };
    }

    if (error.message === 'Forbidden') {
      return {
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      };
    }

    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Internal server error',
      },
    };
  }

  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  };
}

export function getStatusCode(error: unknown): number {
  if (error instanceof APIError) {
    return error.statusCode;
  }

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') return 401;
    if (error.message === 'Forbidden') return 403;
  }

  return 500;
}
