import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from 'src/domain/repositories/repositories';
import { USER_REPOSITORY } from 'src/domain/repositories/repository.tokens';
import { IPasswordHasher, PASSWORD_HASHER } from 'src/infrastructure/auth/password.hasher';
import { AuthResponse, LoginDto, RegisterDto } from './auth.dto';

/**
 * Casos de uso de autenticación. El controlador es delgado: la lógica vive
 * acá, y la persistencia/JWT/bcrypt entran por contratos (Dependency
 * Inversion). El dominio (User.register) protege las invariantes.
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    if (await this.users.emailExists(dto.email)) {
      throw new ConflictException('Ese email ya está registrado.');
    }

    const passwordHash = await this.hasher.hash(dto.password);
    const user = User.register({
      name: dto.name,
      email: dto.email,
      passwordHash,
      country: dto.country,
    });

    await this.users.add(user);
    return this.buildResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.users.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectos.');
    }

    const valid = await this.hasher.verify(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Email o contraseña incorrectos.');
    }

    return this.buildResponse(user);
  }

  private buildResponse(user: User): AuthResponse {
    const token = this.jwt.sign({ sub: user.id, email: user.email, name: user.name });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
        xp: user.xp,
        coins: user.coins,
        avatarUrl: user.avatarUrl,
        country: user.country,
      },
    };
  }
}
