import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Envuelve el PrismaClient como un provider de NestJS con ciclo de vida
 * gestionado. Es el ÚNICO punto donde el resto del sistema toca Prisma:
 * los repositorios reciben este servicio, nadie más lo instancia.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Prisma conectado a la base de datos.');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
