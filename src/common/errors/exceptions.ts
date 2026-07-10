import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequestException extends HttpException {
  constructor(message: string = 'Bad request', error?: string) {
    super(
      {
        success: false,
        message,
        error,
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized', error?: string) {
    super(
      {
        success: false,
        message,
        error,
        statusCode: HttpStatus.UNAUTHORIZED,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden', error?: string) {
    super(
      {
        success: false,
        message,
        error,
        statusCode: HttpStatus.FORBIDDEN,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = 'Resource not found', error?: string) {
    super(
      {
        success: false,
        message,
        error,
        statusCode: HttpStatus.NOT_FOUND,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = 'Conflict', error?: string) {
    super(
      {
        success: false,
        message,
        error,
        statusCode: HttpStatus.CONFLICT,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string = 'Internal server error', error?: string) {
    super(
      {
        success: false,
        message,
        error,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(message: string = 'Service temporarily unavailable', error?: string) {
    super(
      {
        success: false,
        message,
        error,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class DatabaseException extends HttpException {
  constructor(message: string = 'Database error', error?: string) {
    super(
      {
        success: false,
        message,
        error,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class ExternalServiceException extends HttpException {
  constructor(serviceName: string, error?: string) {
    super(
      {
        success: false,
        message: `${serviceName} service error`,
        error,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}