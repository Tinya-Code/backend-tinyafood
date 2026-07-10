export class ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  statusCode: number;

  protected constructor(
    success: boolean,
    message: string,
    statusCode: number,
    data?: T,
    error?: string,
  ) {
    this.success = success;
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message: string = 'Success', statusCode: number = 200): ApiResponse<T> {
    return new ApiResponse<T>(true, message, statusCode, data);
  }

  static error(message: string, statusCode: number = 500, error?: string): ApiResponse {
    return new ApiResponse(false, message, statusCode, undefined, error);
  }

  static created<T>(data: T, message: string = 'Resource created successfully'): ApiResponse<T> {
    return new ApiResponse<T>(true, message, 201, data);
  }

  static updated<T>(data: T, message: string = 'Resource updated successfully'): ApiResponse<T> {
    return new ApiResponse<T>(true, message, 200, data);
  }

  static deleted(message: string = 'Resource deleted successfully'): ApiResponse {
    return new ApiResponse(true, message, 200);
  }

  static notFound(message: string = 'Resource not found'): ApiResponse {
    return new ApiResponse(false, message, 404);
  }

  static badRequest(message: string = 'Bad request', error?: string): ApiResponse {
    return new ApiResponse(false, message, 400, undefined, error);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiResponse {
    return new ApiResponse(false, message, 401);
  }

  static forbidden(message: string = 'Forbidden'): ApiResponse {
    return new ApiResponse(false, message, 403);
  }

  static conflict(message: string = 'Conflict'): ApiResponse {
    return new ApiResponse(false, message, 409);
  }
}

export class PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };

  private constructor(
    data: T[],
    pagination: PaginatedResponse<T>['pagination'],
    message: string = 'Success',
  ) {
    super(true, message, 200, data);
    this.pagination = pagination;
  }

  static create<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Success',
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
    return new PaginatedResponse<T>(data, pagination, message);
  }
}
