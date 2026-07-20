import { Injectable } from '@nestjs/common';
import { IUnitOfWork, UnitOfWorkRepositories } from 'src/domain/repositories/repositories';
import { PrismaService } from './prisma.service';
import { buildRepositories } from './repositories/repository.factory';

/**
 * Implementación del Unit of Work sobre `prisma.$transaction`. El bloque de
 * trabajo recibe repositorios ligados al cliente de transacción, de modo que
 * todos los cambios (varios agregados) se confirman atómicamente o se
 * revierten juntos si algo falla.
 */
@Injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  execute<T>(work: (repos: UnitOfWorkRepositories) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) => work(buildRepositories(tx)));
  }
}
