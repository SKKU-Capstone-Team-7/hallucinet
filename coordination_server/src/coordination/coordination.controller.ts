import { Controller, Get } from '@nestjs/common';
import { CoordinationService } from './coordination.service';

@Controller('coordination')
export class CoordinationController {
  constructor(private readonly coordService: CoordinationService) {}
  @Get('devices')
  getDevices() {
    return this.coordService.getDevices();
  }
}
