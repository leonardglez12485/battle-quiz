import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

/**
 * Único controlador de esta etapa: confirma que la app levanta y que la
 * conexión a la base de datos (Neon) responde. Los controladores de features
 * (Auth, Game, Users, ...) llegan en la próxima etapa junto con sus Casos de
 * Uso; siempre delgados, sin lógica de negocio.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<{ status: string; database: string }> {
    let database = 'down';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = 'up';
    } catch {
      database = 'down';
    }
    return { status: 'ok', database };
  }
}
