import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ContainerService } from './container.service';
import { AppwriteAuthGuard } from 'src/common/guards/appwrite-auth.guard';
import { Client } from 'node-appwrite';
import { AppwriteClient } from 'src/common/decorators/appwrite-client.decorator';
import { ContainerInfoDto } from './dto/container-info.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Containers')
@ApiBearerAuth('bearer')
@Controller('')
export class ContainerController {
    constructor(private readonly ContainerService: ContainerService) { }

    @ApiOperation({ summary: 'get containers list of current user team endpoint' })
    @ApiQuery({
        name: 'order',
        enum: ['asc', 'desc']
    })
    @ApiQuery({
        name: 'sort',
        enum: ['lastAccessed']
    })
    @ApiQuery({
        name: 'limit',
        type: Number
    })
    @ApiOkResponse({
        description: 'list of containers info of current user\'s team',
        type: ContainerInfoDto,
        isArray: true,
    })
    @Get('teams/me/containers')
    @UseGuards(AppwriteAuthGuard)
    async getTeamContainers(@AppwriteClient() client: Client,
        @Query('sort') sort: 'lastAccessed' | 'createdAt' = 'lastAccessed',
        @Query('order') order: 'asc' | 'desc' = 'desc',
        @Query('limit') limit: number = 20,): Promise<ContainerInfoDto[]> {
        return this.ContainerService.getTeamContainers(client, sort, order, limit);
    }

    @Get('devices/:deviceId/containers')
    @UseGuards(AppwriteAuthGuard)
    async getContainers(@AppwriteClient() client: Client, @Param('deviceId') deviceId: string) {
        //    return this.ContainerService.getContainers(deviceId);
    }

    @ApiOperation({ summary: 'get container info using container ID(it only works by team member)' })
    @ApiOkResponse({
        description: 'container info for the corresponding ID',
        type: ContainerInfoDto,
    })
    @Get('containers/:containerId')
    @UseGuards(AppwriteAuthGuard)
    async getContainerById(@AppwriteClient() client: Client, @Param('containerId') containerId: string): Promise<ContainerInfoDto> {
        return this.ContainerService.getContainerById(client, containerId);
    } 
}
