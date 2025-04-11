import { Module } from '@nestjs/common';
import { AppwriteService } from './modules/appwrite/appwrite.service';
import { UserController } from './modules/user/user.controller';
import { UserService } from './modules/user/user.service';
import { TeamController } from './modules/team/team.controller';
import { TeamService } from './modules/team/team.service';

@Module({
  imports: [],
  controllers: [UserController, TeamController],
  providers: [AppwriteService, UserService, TeamService],
})
export class AppModule { }
