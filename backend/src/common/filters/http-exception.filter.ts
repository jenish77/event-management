import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request.headers['x-request-id'] as string) || 'N/A';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred.';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        if (Array.isArray(res.message)) {
          code = 'VALIDATION_ERROR';
          message = res.message[0] || 'Validation failed.';
          details = res.message;
        } else {
          message = res.message || exception.message;
          if (res.error) {
            code = res.error.toUpperCase().replace(/\s+/g, '_');
          }
        }
      }
    } else if (exception && typeof exception === 'object' && 'code' in exception) {
      // Prisma errors mapping
      const prismaErr = exception as { code: string; meta?: any };
      if (prismaErr.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        code = 'UNIQUE_CONSTRAINT_VIOLATION';
        message = `A record with this field already exists: ${prismaErr.meta?.target || 'unique field'}`;
      } else if (prismaErr.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        code = 'RECORD_NOT_FOUND';
        message = 'Requested record was not found.';
      }
    }

    // Assign standard error codes for common status codes if code is generic
    if (code === 'INTERNAL_SERVER_ERROR' && status !== HttpStatus.INTERNAL_SERVER_ERROR) {
      switch (status) {
        case HttpStatus.UNAUTHORIZED:
          code = 'UNAUTHORIZED';
          break;
        case HttpStatus.FORBIDDEN:
          code = 'FORBIDDEN';
          break;
        case HttpStatus.NOT_FOUND:
          code = 'NOT_FOUND';
          break;
        case HttpStatus.CONFLICT:
          code = 'CONFLICT';
          break;
        case HttpStatus.BAD_REQUEST:
          code = 'BAD_REQUEST';
          break;
      }
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${requestId}] ${request.method} ${request.url} - Internal Server Error:`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(
        `[${requestId}] ${request.method} ${request.url} - ${status} ${code}: ${message}`,
      );
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
      requestId,
    });
  }
}
