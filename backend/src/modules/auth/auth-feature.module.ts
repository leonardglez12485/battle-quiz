import { Module } from '@nestjs/common';
import { AuthModule } from 'src/infrastructure/auth/auth.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * Módulo de feature de autenticación (endpoints). Se apoya en el AuthModule
 * de infraestructura (JWT + hasher). Los repositorios llegan del
 * PersistenceModule global.
 */
@Module({
  imports: [AuthModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthFeatureModule {}
