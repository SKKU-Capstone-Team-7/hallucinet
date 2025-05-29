import { Controller, Get, Param, Query, UseGuards, Patch, Body, Post, Delete, HttpCode } from '@nestjs/common';
import { ContainerService } from './container.service';
import { AppwriteAuthGuard } from 'src/common/guards/appwrite-auth.guard';
import { Client } from 'node-appwrite';
import { AppwriteClient } from 'src/common/decorators/appwrite-client.decorator';
import { ContainerInfoDto } from './dto/container-info.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiBody } from '@nestjs/swagger';
import { UpdateContainerInfoDto } from './dto/update-container-info.dto';
import { CreateContainerDto } from './dto/create-container.dto';

@ApiTags('Containers')
@ApiBearerAuth('bearer')
@Controller('')
export class ContainerController {
    constructor(private readonly containerService: ContainerService) { }

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
        return this.containerService.getTeamContainers(client, sort, order, limit);
    }

    @Get('devices/:deviceId/containers')
    @UseGuards(AppwriteAuthGuard)
    async getContainers(@AppwriteClient() client: Client, @Param('deviceId') deviceId: string) {
        //    return this.ContainerService.getContainers(deviceId);
    }

    //@ApiOperation({ summary: 'get container info using container ID(it only works by team member)' })
    //@ApiOkResponse({
    //    description: 'container info for the corresponding ID',
    //    type: ContainerInfoDto,
    //})
    //@Get('containers/:containerId')
    //@UseGuards(AppwriteAuthGuard)
    //async getContainerById(@AppwriteClient() client: Client, @Param('containerId') containerId: string): Promise<ContainerInfoDto> {
    //    return this.ContainerService.getContainerById(client, containerId);
    //} 

    
    @ApiOperation({ summary: 'create container endpoint' })
    @ApiBody({
        description: 'container info to create',
        type: CreateContainerDto,
    })
    @ApiOkResponse({
        description: 'created device info',
        type: ContainerInfoDto,
    })
    @Post('containers')
    async createContainer(@Body() createCotainerDto: CreateContainerDto): Promise<ContainerInfoDto> {
        return this.containerService.createContainer(createCotainerDto);
    }

    @ApiOperation({ summary: 'delete container using container ID endpoint' })
    @Delete('cotainers/:containerId')
    async delContainerById(@Param('containerId') containerId: string) {
        return this.containerService.delContainerById(containerId);
    }

    @ApiOperation({ summary: 'get container info using container ID(it only works by team member)' })
    @ApiOkResponse({
        description: 'container info for the corresponding ID',
        type: ContainerInfoDto,
    })
    @Get('containers/:containerId')
    async getContainerById(@Param('containerId') containerId: string): Promise<ContainerInfoDto> {
        return this.containerService.getContainerById(containerId);
    } 

    @ApiOperation({ summary: 'update container info by logined user endpoint' })
    @ApiBody({
        description: 'only container info to update',
        type: UpdateContainerInfoDto,
    })
    @ApiOkResponse({
        description: 'updated container info',
        type: ContainerInfoDto,
    })
    @Patch('containers/:containerId')
    async updateContainer(@Param('containerId') containerId: string, @Body() updateContainerInfoDto: UpdateContainerInfoDto): Promise<ContainerInfoDto> {
        return this.containerService.updateContainer(containerId, updateContainerInfoDto);
    }

    @ApiOperation({ summary: 'update container accessed time endpoint' })
    @HttpCode(204)
    @Post('cotainers/:containerId/touch')
    async updateAccessTime(@Param('containerId') containerId: string) {
        return this.containerService.updateAccessTime(containerId);
    }
}
