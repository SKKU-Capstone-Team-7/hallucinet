import { Controller, Get } from '@nestjs/common';
import { ContainersService } from './containers.service';
import { ContainerInfoDto } from './container-info.dto';

@Controller('containers')
export class ContainersController {
  constructor(private readonly containerService: ContainersService) {}

  @Get('')
  async getTeamContainers(): Promise<ContainerInfoDto[]> {
    return await this.containerService.getContainers();
  }
}
