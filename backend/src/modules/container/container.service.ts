import { Injectable } from '@nestjs/common';
import { ContainerInfoDto } from './dto/container-info.dto';
import { Client, Databases } from 'node-appwrite';
import { AppwriteService } from '../appwrite/appwrite.service';
import { DatabaseService } from '../database/database.service';
import { TeamService } from '../team/team.service';
import { UserService } from '../user/user.service';
import { DeviceService } from '../device/device.service';
import { UpdateContainerInfoDto } from './dto/update-container-info.dto';

@Injectable()
export class ContainerService {
    constructor(
        private readonly appwriteService: AppwriteService,
        private readonly teamService: TeamService,
        private readonly databaseService: DatabaseService,
        private readonly userService: UserService,
        private readonly deviceService: DeviceService
    ) { }

    async getTeamContainers(client: Client, sort: string, order: string, limit: number): Promise<ContainerInfoDto[]> {
        const team = await this.teamService.getMyTeam(client);

        const { documents } = await this.databaseService.listContainersByTeamId(team.$id, sort, order, limit);

        console.log(documents);

        const dtos: ContainerInfoDto[] = [];
        for (const doc of documents) {
            const device = await this.deviceService.getDeviceById(doc.device.$id)
            dtos.push(new ContainerInfoDto({
                $id: doc.$id,
                name: doc.name,
                image: doc.image,
                ip: doc.ip,
                device: device,
                lastAccessed: doc.lastAccessed,
            }))
        }
        
        return dtos;
    }

    // async getContainers(client: Client, deviceId: string): Promise<ContainerInfoDto> {
    //}

    //async getContainerById(client: Client, containerId: string): Promise<ContainerInfoDto> {
    //    const doc = await this.databaseService.getContainerById(client,containerId);
    //    console.log(doc);
    //
    //    return new ContainerInfoDto({
    //        $id: doc.$id,
    //        name: doc.name,
    //        image: doc.image,
    //        ip: doc.ip,
    //        deviceId: doc.device.$id,
    //        lastAccessed: doc.lastAccessed,
    //        teamId: doc.team.$id,
    //        userId: doc.user.$id,
    //    });
    //}

    async getContainerById(containerId: string): Promise<ContainerInfoDto> {
        const doc = await this.databaseService.getContainerById(containerId);
        const device = await this.deviceService.getDeviceById(doc.device.$id);
        console.log(doc);

        return new ContainerInfoDto({
            $id: doc.$id,
            name: doc.name,
            image: doc.image,
            ip: doc.ip,
            device: device,
            lastAccessed: doc.lastAccessed,
        });
    }

    async updateContainer(containerId: string, updateContainerInfoDto: UpdateContainerInfoDto): Promise<ContainerInfoDto> {
        const doc = await this.databaseService.updateContainer(containerId, updateContainerInfoDto);
        const device = await this.deviceService.getDeviceById(doc.device.$id);

        return new ContainerInfoDto({
            $id: doc.$id,
            name: doc.name,
            image: doc.image,
            ip: doc.ip,
            device: device,
            lastAccessed: doc.lastAccessed,
        })
    }
}
