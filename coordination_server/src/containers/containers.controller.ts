import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ContainersService } from './containers.service';
import { ContainerInfoDto } from './container-info.dto';
import { DeviceGuard } from 'src/auth/device/device.guard';
import { CreateContainerDto } from './create-container.dto';

@UseGuards(DeviceGuard)
@Controller('containers')
export class ContainersController {
  constructor(private readonly containerService: ContainersService) {}

  @Get('')
  async getTeamContainers(@Req() req: Request): Promise<ContainerInfoDto[]> {
    return await this.containerService.getContainers(req['deviceId']);
  }

  @Post('')
  async createToken(
    @Req() req: Request,
    @Body() form: CreateContainerDto,
  ): Promise<CreateContainerDto> {
    return this.containerService.createContainers(req['deviceId'], form);
  }
}
