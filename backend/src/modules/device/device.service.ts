import { Injectable } from '@nestjs/common';
import { AppwriteService } from '../appwrite/appwrite.service';
import { Client, Teams } from 'node-appwrite';
import { DeviceInfoDto } from './dto/device-info.dto';
import { TeamService } from '../team/team.service';
import { TeamInfoDto } from '../team/dto/team-info.dto';
import { DatabaseService } from '../database/database.service';
import { UserService } from '../user/user.service';

@Injectable()
export class DeviceService {
    constructor(
        private readonly appwriteService: AppwriteService,
        private readonly teamService: TeamService,
        private readonly databaseService: DatabaseService,
        private readonly userService: UserService
    ) { }

    async listDevices(client: Client,): Promise<DeviceInfoDto[]> {
        const user = await this.userService.getCurrentUser(client);
        const team = await this.teamService.getMyTeam(client);

        const { documents } = await this.databaseService.listDevicesByTeamId(team.$id);

        console.log(documents);

        return documents.map(doc => new DeviceInfoDto({
            $id: doc.$id,
            name: doc.name,
            status: doc.status,
            ipBlock24: doc.ipBlock24,
            user: user,
            lastActivatedAt: doc.lastActivatedAt,
            teamId: team.$id
        }));
    }

    //async getDeviceById():Promise<DeviceInfoDto> {
    //
    //}

}
