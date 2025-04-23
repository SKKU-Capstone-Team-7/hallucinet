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

@Module({
  imports: [],
  controllers: [UserController, DeviceController, TeamController, ContainerController],
  providers: [AppwriteService, DatabaseService, UserService, DeviceService, TeamService, ContainerService],
})
export class AppModule { }
