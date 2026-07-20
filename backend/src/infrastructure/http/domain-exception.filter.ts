import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from 'src/domain/exceptions/domain.exception';

/**
 * Traduce una DomainException (invariante de negocio violada) a un 400, en un
 * único lugar. Los controladores no llevan try/catch para esto: sería lógica
 * repetida. Cualquier otra excepción la maneja el filtro global por defecto de
 * NestJS como 500 (sin exponer el stack al cliente).
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    this.logger.warn(`Regla de negocio violada: ${exception.message}`);
    response.status(HttpStatus.BAD_REQUEST).json({ error: exception.message });
  }
}
