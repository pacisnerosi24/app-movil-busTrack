import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Filtro global: uniforma TODOS los errores en un JSON consistente
// { statusCode, path, timestamp, message } para que la app movil
// siempre reciba el mismo formato de error.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorBody = isHttpException ? exception.getResponse() : null;
    const message =
      typeof errorBody === 'object' &&
      errorBody !== null &&
      'message' in errorBody
        ? (errorBody as { message: string | string[] }).message
        : isHttpException
          ? exception.message
          : 'Error interno del servidor';

    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
