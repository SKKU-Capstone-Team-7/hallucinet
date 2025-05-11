import { Injectable } from '@nestjs/common';
import { ContainerInfoDto } from './dto/container-info.dto';
import { Client, Databases } from 'node-appwrite';
import { AppwriteService } from '../appwrite/appwrite.service';
import { DatabaseService } from '../database/database.service';
import { TeamService } from '../team/team.service';

@Injectable()
export class ContainerService {
    constructor(
        private readonly appwriteService: AppwriteService,
        private readonly teamService: TeamService,
        private readonly databaseService: DatabaseService,
        //private readonly userService: UserService
    ) { }

    async getTeamContainers(client: Client, sort: string, order: string, limit: number): Promise<ContainerInfoDto[]> {
        const team = await this.teamService.getMyTeam(client);

        const { documents } = await this.databaseService.listContainersByTeamId(team.$id, sort, order, limit);

        console.log(documents);

        return documents.map(doc => new ContainerInfoDto({
            $id: doc.$id,
            name: doc.name,
            image: doc.image,
            ip: doc.ip,
            deviceId: doc.device.$id,
            lastAccessed: doc.lastAccessed,
            teamId: doc.team.$id,
            userId: doc.user.$id
        }));
    }

    // async getContainers(client: Client, deviceId: string): Promise<ContainerInfoDto> {
    //}

    async getContainerById(client: Client, containerId: string): Promise<ContainerInfoDto> {
        const doc = await this.databaseService.getContainerById(client,containerId);
        console.log(doc);

        return new ContainerInfoDto({
            $id: doc.$id,
            name: doc.name,
            image: doc.image,
            ip: doc.ip,
            deviceId: doc.device.$id,
            lastAccessed: doc.lastAccessed,
            teamId: doc.team.$id,
            userId: doc.user.$id,
        });
    }
}
