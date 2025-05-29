import { Injectable, BadRequestException } from '@nestjs/common';
import { ContainerInfoDto } from './dto/container-info.dto';
import { Client, Databases, ID } from 'node-appwrite';
import { AppwriteService } from '../appwrite/appwrite.service';
import { DatabaseService } from '../database/database.service';
import { TeamService } from '../team/team.service';
import { UserService } from '../user/user.service';
import { DeviceService } from '../device/device.service';
import { UpdateContainerInfoDto } from './dto/update-container-info.dto';
import { CreateContainerDto } from './dto/create-container.dto';

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

        const devices = await this.deviceService.listDevices(client);

        const deviceMap = new Map(
            devices.map(d => [d.$id, d])
        );

        return documents.map(doc => {
                return new ContainerInfoDto({
                    $id: doc.$id,
                    name: doc.name,
                    image: doc.image,
                    ip: doc.ip,
                    device: deviceMap.get(doc.device.$id),
                    lastAccessed: doc.lastAccessed,
                });
            })
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

    async updateAccessTime(containerId: string) {
        const time = new Date(Date.now());
        await this.databaseService.updateAccessTime(containerId, time);
    }

    async createContainer(createCotainerDto: CreateContainerDto): Promise<ContainerInfoDto> {
        const device = await this.deviceService.getDeviceById(createCotainerDto.deviceId);

        if (device.user.teamIds == undefined)
            throw new BadRequestException("It should not be done because this device doesn't have team.");

        const teamId= device.user.teamIds[0];
        const userId= device.user.$id;
        const lastAccessed = new Date(Date.now());

        const doc = await this.databaseService.createContainer(ID.unique(), createCotainerDto, teamId, userId, lastAccessed);

        return new ContainerInfoDto({
            $id: doc.$id,
            name: doc.name,
            image: doc.image,
            ip: doc.ip,
            device: device,
            lastAccessed: doc.lastAccessed,
        })
    }

    async delContainerById(containerId: string) {
        await this.databaseService.delContainerById(containerId);
    }
}
