import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PersistenceModule } from './infrastructure/prisma/persistence.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { ApplicationModule } from './application/application.module';
import { HealthModule } from './modules/health/health.module';
import { AuthFeatureModule } from './modules/auth/auth-feature.module';
import { GameModule } from './modules/game/game.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { UsersModule } from './modules/users/users.module';

/**
 * Raíz de composición. Ensambla las capas:
 *   - ConfigModule: variables de entorno (Neon, JWT) — nada hardcodeado.
 *   - LoggerModule (pino): logging estructurado, rápido, apto para Render.
 *   - PersistenceModule: Prisma + repositorios + Unit of Work (global).
 *   - AuthModule: JWT + hashing.
 *   - ApplicationModule: motor de selección + evaluación.
 *   - HealthModule: endpoint de salud.
 * Los módulos de feature (Auth endpoints, Game, Users, ...) se suman en la
 * próxima etapa.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      },
    }),
    PersistenceModule,
    AuthModule,
    ApplicationModule,
    HealthModule,
    AuthFeatureModule,
    GameModule,
    CategoriesModule,
    UsersModule,
  ],
})
export class AppModule {}
