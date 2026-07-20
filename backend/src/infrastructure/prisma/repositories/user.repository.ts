import { Prisma } from '@prisma/client';
import { IUserRepository } from 'src/domain/repositories/repositories';
import { User } from 'src/domain/entities/user.entity';
import { DomainMappers } from '../mappers/domain.mappers';

type TxClient = Prisma.TransactionClient;

export class UserRepository implements IUserRepository {
  constructor(private readonly db: TxClient) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { id }, include: { statistics: true } });
    return row ? DomainMappers.toUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { statistics: true },
    });
    return row ? DomainMappers.toUser(row) : null;
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.db.user.count({ where: { email: email.trim().toLowerCase() } });
    return count > 0;
  }

  async topByXp(count: number): Promise<User[]> {
    const rows = await this.db.user.findMany({
      orderBy: [{ level: 'desc' }, { xp: 'desc' }],
      take: count,
      include: { statistics: true },
    });
    return rows.map(DomainMappers.toUser);
  }

  async add(user: User): Promise<void> {
    const s = user.statistics;
    await this.db.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        avatarUrl: user.avatarUrl,
        country: user.country,
        registeredAt: user.registeredAt,
        level: user.level,
        xp: user.xp,
        coins: user.coins,
        currentDailyStreak: user.currentDailyStreak,
        lastPlayedDate: user.lastPlayedDate ? new Date(user.lastPlayedDate) : null,
        statistics: {
          create: {
            id: s.id,
            questionsAnswered: s.questionsAnswered,
            correctAnswers: s.correctAnswers,
            incorrectAnswers: s.incorrectAnswers,
            averageResponseTimeSec: s.averageResponseTimeSec,
            longestStreak: s.longestStreak,
            favoriteCategoryId: s.favoriteCategoryId,
            bestPerformingCategoryId: s.bestPerformingCategoryId,
            worstPerformingCategoryId: s.worstPerformingCategoryId,
          },
        },
      },
    });
  }

  async update(user: User): Promise<void> {
    const s = user.statistics;
    await this.db.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        avatarUrl: user.avatarUrl,
        country: user.country,
        level: user.level,
        xp: user.xp,
        coins: user.coins,
        currentDailyStreak: user.currentDailyStreak,
        lastPlayedDate: user.lastPlayedDate ? new Date(user.lastPlayedDate) : null,
        statistics: {
          update: {
            questionsAnswered: s.questionsAnswered,
            correctAnswers: s.correctAnswers,
            incorrectAnswers: s.incorrectAnswers,
            averageResponseTimeSec: s.averageResponseTimeSec,
            longestStreak: s.longestStreak,
            favoriteCategoryId: s.favoriteCategoryId,
            bestPerformingCategoryId: s.bestPerformingCategoryId,
            worstPerformingCategoryId: s.worstPerformingCategoryId,
          },
        },
      },
    });
  }
}
