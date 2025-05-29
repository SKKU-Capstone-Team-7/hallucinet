import { ConfigurableModuleBuilder, Module } from '@nestjs/common';
import { AppwriteService } from './modules/appwrite/appwrite.service';
import { UserController } from './modules/user/user.controller';
import { UserService } from './modules/user/user.service';
import { TeamController } from './modules/team/team.controller';
import { TeamService } from './modules/team/team.service';
import { DeviceController } from './modules/device/device.controller';
import { DeviceService } from './modules/device/device.service';
import { DatabaseService } from './modules/database/database.service';
import { ContainerController } from './modules/container/container.controller';
import { ContainerService } from './modules/container/container.service';
import { InvitationController } from './modules/invitation/invitation.controller';
import { InvitationService } from './modules/invitation/invitation.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: '.env',
    isGlobal: true
  })],
  controllers: [UserController, DeviceController, TeamController, ContainerController, InvitationController],
  providers: [AppwriteService, DatabaseService, UserService, DeviceService, TeamService, ContainerService, InvitationService],
})
export class AppModule { }
