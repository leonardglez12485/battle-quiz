import { Module } from '@nestjs/common';
import { ApplicationModule } from 'src/application/application.module';
import { AuthModule } from 'src/infrastructure/auth/auth.module';
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
  imports: [ApplicationModule, AuthModule],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
