import { Prisma } from '@prisma/client';
import {
  IAchievementRepository,
  IUserAchievementRepository,
} from 'src/domain/repositories/repositories';
import { Achievement, UserAchievement } from 'src/domain/entities/achievement.entity';
import { DomainMappers } from '../mappers/domain.mappers';

type TxClient = Prisma.TransactionClient;

export class AchievementRepository implements IAchievementRepository {
  constructor(private readonly db: TxClient) {}

  async findById(id: string): Promise<Achievement | null> {
    const row = await this.db.achievement.findUnique({ where: { id } });
    return row ? DomainMappers.toAchievement(row) : null;
  }

  async findAll(): Promise<Achievement[]> {
    const rows = await this.db.achievement.findMany();
    return rows.map(DomainMappers.toAchievement);
  }

  async add(a: Achievement): Promise<void> {
    await this.db.achievement.create({
      data: {
        id: a.id,
        code: a.code,
        name: a.name,
        description: a.description,
        iconUrl: a.iconUrl,
        criteriaType: a.criteriaType,
        targetValue: a.targetValue,
      },
    });
  }
}

export class UserAchievementRepository implements IUserAchievementRepository {
  constructor(private readonly db: TxClient) {}

  async findByUserId(userId: string): Promise<UserAchievement[]> {
    const rows = await this.db.userAchievement.findMany({ where: { userId } });
    return rows.map(DomainMappers.toUserAchievement);
  }

  async hasUnlocked(userId: string, achievementId: string): Promise<boolean> {
    const count = await this.db.userAchievement.count({ where: { userId, achievementId } });
    return count > 0;
  }

  async add(ua: UserAchievement): Promise<void> {
    await this.db.userAchievement.create({
      data: {
        id: ua.id,
        userId: ua.userId,
        achievementId: ua.achievementId,
        unlockedAt: ua.unlockedAt,
      },
    });
  }
}
