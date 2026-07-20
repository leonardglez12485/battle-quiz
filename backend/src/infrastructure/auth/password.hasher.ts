import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

/** Token DI para el hasher (permite sustituirlo en tests). */
export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

/**
 * Hash de contraseñas con bcrypt (nunca texto plano, nunca reversible).
 * Detalle de infraestructura: el dominio guarda solo el `passwordHash`.
 */
@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly rounds = 10;

  hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.rounds);
  }

  verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
