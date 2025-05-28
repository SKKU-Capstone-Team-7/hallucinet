import { Controller, Delete, Get, Param, Patch, Post, UseGuards, Body } from '@nestjs/common';
import { DeviceService } from './device.service';
import { AppwriteAuthGuard } from 'src/common/guards/appwrite-auth.guard';
import { AppwriteClient } from 'src/common/decorators/appwrite-client.decorator';
import { Client, ID } from 'node-appwrite';
import { DeviceInfoDto } from './dto/device-info.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { DeviceAuthResponseDto } from './dto/device-auth-response.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceInfoDto } from './dto/update-device-info.dto';

@ApiTags('Devices')
@ApiBearerAuth('bearer')
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

    @ApiOperation({ summary: 'create new device which is not confirmed endpoint' })
    @ApiBody({
        description: 'device info',
        type: CreateDeviceDto,
      })
    @ApiOkResponse({
        description: 'created device id and url for confirm',
        type: DeviceAuthResponseDto,
      })
    @Post('/devices/auth')
    async addDevice(@Body() deviceName: CreateDeviceDto): Promise<DeviceAuthResponseDto> {
        return this.deviceService.addDevice(deviceName);
    }

    @ApiOperation({ summary: 'confirm device by logined user endpoint' })
    @ApiOkResponse({
        description: 'created device info',
        type: DeviceInfoDto,
      })
    @Post('/devices/:deviceId/confirm')
    @UseGuards(AppwriteAuthGuard)
    async confirmDevice(@AppwriteClient() client: Client, @Param('deviceId') deviceId: string): Promise<DeviceInfoDto> {
        return this.deviceService.confirmDevice(client, deviceId);
    }

    
    //@ApiOperation({
    //    summary: 'get device info by device ID(it only works by team member)'
    //})
    //@ApiOkResponse({
    //    description: 'device info for the corresponding ID',
    //    type: DeviceInfoDto,
    //})
    //@Get('devices/:deviceId')
    //@UseGuards(AppwriteAuthGuard)
    //async getDeviceById(@AppwriteClient() client: Client, @Param('deviceId') deviceId: string) {
    //    return this.deviceService.getDeviceById(client, deviceId);
    //}

    @ApiOperation({
        summary: 'get device info by device ID(it only works by team member)'
    })
    @ApiOkResponse({
        description: 'device info for the corresponding ID',
        type: DeviceInfoDto,
    })
    @Get('devices/:deviceId')
    async getDeviceById(@Param('deviceId') deviceId: string) {
        return this.deviceService.getDeviceById(deviceId);
    }

    @ApiOperation({ summary: 'update device info by logined user endpoint' })
    @ApiBody({
            description: 'only device info to update',
            type: UpdateDeviceInfoDto,
        })
    @ApiOkResponse({
        description: 'updated device info',
        type: DeviceInfoDto,
      })
    @Patch('devices/:deviceId')
    async updateDevice(@Param('deviceId') deviceId: string, @Body() updateDeviceInfoDto: UpdateDeviceInfoDto): Promise<DeviceInfoDto> {
        //console.log(deviceId);
        return this.deviceService.updateDevice(deviceId, updateDeviceInfoDto);
    }

    @Delete('devices/:deviceId')
    @UseGuards(AppwriteAuthGuard)
    async removeDevice(@Param('devicdId') deviceId: string) {
        return;
    }
}
