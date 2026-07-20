import { User } from 'src/domain/entities/user.entity';

const register = (): User => User.register({ name: 'Ana', email: 'ana@test.com', passwordHash: 'hash' });

describe('User (aggregate)', () => {
  it('sube de nivel al alcanzar el umbral de XP', () => {
    const user = register();
    const levelsGained = user.gainExperience(150); // nivel 1 requiere 100 XP
    expect(levelsGained).toBe(1);
    expect(user.level).toBe(2);
    expect(user.xp).toBe(50);
  });

  it('incrementa la racha en días consecutivos', () => {
    const user = register();
    user.registerDailyPlay('2026-07-01');
    user.registerDailyPlay('2026-07-02');
    user.registerDailyPlay('2026-07-03');
    expect(user.currentDailyStreak).toBe(3);
  });

  it('reinicia la racha si hay un salto de días', () => {
    const user = register();
    user.registerDailyPlay('2026-07-01');
    user.registerDailyPlay('2026-07-06');
    expect(user.currentDailyStreak).toBe(1);
  });

  it('crea estadísticas 1:1 enlazadas al id del usuario', () => {
    const user = register();
    expect(user.statistics.userId).toBe(user.id);
  });
});
