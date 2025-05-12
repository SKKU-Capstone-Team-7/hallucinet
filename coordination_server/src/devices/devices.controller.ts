import { Controller, Get } from '@nestjs/common';
import { DeviceInfoDto } from './device-info.dto';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly deviceService: DevicesService) {}

  @Get('')
  async getTeamDevices(): Promise<DeviceInfoDto[]> {
    return await this.deviceService.getDevices();
  }
}
