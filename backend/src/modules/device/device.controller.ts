import { Controller, Get, UseGuards } from '@nestjs/common';
import { DeviceService } from './device.service';
import { AppwriteAuthGuard } from 'src/common/guards/appwrite-auth.guard';
import { AppwriteClient } from 'src/common/decorators/appwrite-client.decorator';
import { Client } from 'node-appwrite';
import { DeviceInfoDto } from './dto/device-info.dto';

@Controller('team/device')
export class DeviceController {
    constructor(private readonly deviceService: DeviceService) { }

    @Get()
    @UseGuards(AppwriteAuthGuard)
    async getTeamDevices(@AppwriteClient() client: Client): Promise<DeviceInfoDto[]> {
        return this.deviceService.getTeamDevices(client);
    }


}
