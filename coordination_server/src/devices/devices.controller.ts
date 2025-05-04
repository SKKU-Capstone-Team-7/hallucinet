import { Controller, Get, UseGuards } from '@nestjs/common';
import { DeviceInfoDto } from './device-info.dto';
import { DevicesService } from './devices.service';
import { DeviceGuard } from 'src/auth/device/device.guard';

@UseGuards(DeviceGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly deviceService: DevicesService) {}

  @Get('')
  async getTeamDevices(): Promise<DeviceInfoDto[]> {
    return await this.deviceService.getDevices();
  }
}
