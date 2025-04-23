import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ContainerService } from './container.service';
import { AppwriteAuthGuard } from 'src/common/guards/appwrite-auth.guard';
import { Client } from 'node-appwrite';
import { AppwriteClient } from 'src/common/decorators/appwrite-client.decorator';
import { ContainerInfoDto } from './dto/container-info.dto';

@Controller('')
export class ContainerController {
    constructor(private readonly ContainerService: ContainerService) { }

    @Get('teams/me/containers')
    @UseGuards(AppwriteAuthGuard)
    async getTeamContainers(@AppwriteClient() client: Client,
        @Query('sort') sort: 'lastAccessed' | 'createdAt' = 'lastAccessed',
        @Query('order') order: 'asc' | 'desc' = 'desc',
        @Query('limit') limit: number = 20,
        @Query('offset') offset: number = 0,): Promise<ContainerInfoDto[]> {
        return this.ContainerService.getTeamContainers(client, sort, order, limit, offset);
    }

    @Get('devices/:deviceId/containers')
    @UseGuards(AppwriteAuthGuard)
    async getContainers(@AppwriteClient() client: Client, @Param('deviceId') deviceId: string) {
        //    return this.ContainerService.getContainers(deviceId);
    }
}
