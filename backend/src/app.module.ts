import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppwriteService } from './appwrite/appwrite.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { TeamController } from './team/team.controller';
import { TeamService } from './team/team.service';

@Module({
  imports: [],
  controllers: [AppController, UserController, TeamController],
  providers: [AppService, AppwriteService, UserService, TeamService],
})
export class AppModule {}
