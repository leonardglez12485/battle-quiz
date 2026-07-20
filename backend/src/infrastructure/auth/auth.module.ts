import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { BcryptPasswordHasher, PASSWORD_HASHER } from './password.hasher';

/**
 * Concentra todo lo relacionado con autenticación: firma/verificación de JWT
 * (configurados desde variables de entorno, sin hardcode) y hashing de
 * contraseñas. Exporta JwtModule y el hasher para que los casos de uso de
 * Auth (próxima etapa) los consuman.
 */
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'insecure-dev-secret',
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') ?? '60m' },
      }),
    }),
  ],
  providers: [JwtStrategy, { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher }],
  exports: [JwtModule, PassportModule, PASSWORD_HASHER],
})
export class AuthModule {}
