import { Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DeviceService } from './device.service';
import { AppwriteAuthGuard } from 'src/common/guards/appwrite-auth.guard';
import { AppwriteClient } from 'src/common/decorators/appwrite-client.decorator';
import { Client } from 'node-appwrite';
import { DeviceInfoDto } from './dto/device-info.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Devices')
@ApiBearerAuth('JWT')
@Controller()
export class DeviceController {
    constructor(private readonly deviceService: DeviceService) { }

    @ApiOperation({
        summary: 'get all devices list of current user\'s team endpoint'
    })
    @ApiOkResponse({
        description: 'all devices list of current user\s team',
        type: DeviceInfoDto,
        isArray: true
    })
    @Get('teams/me/devices')
    @UseGuards(AppwriteAuthGuard)
    async listDevices(@AppwriteClient() client: Client): Promise<DeviceInfoDto[]> {
        return this.deviceService.listDevices(client);
    }

    @Post('teams/me/devices')
    @UseGuards(AppwriteAuthGuard)
    async addDeviceToTeam(@AppwriteClient() client: Client) {
        return;
    }

    @Get('devices/:devicdId')
    @UseGuards(AppwriteAuthGuard)
    async getDeviceById(@Param('deviceId') deviceId: string) {
        //return this.deviceService.getDeviceById(deviceId);
        return;
    }

    @Patch('devices/:devicdId')
    @UseGuards(AppwriteAuthGuard)
    async updateDevice(@Param('deviceId') deviceId: string) {
        return;
    }

    @Delete('devices/:deviceId')
    @UseGuards(AppwriteAuthGuard)
    async removeDevice(@Param('devicdId') deviceId: string) {
        return;
    }
}
