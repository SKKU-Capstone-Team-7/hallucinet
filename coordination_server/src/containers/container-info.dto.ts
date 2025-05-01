import { DeviceInfoDto } from '../devices/device-info.dto';
export class ContainerInfoDto {
  readonly name: string;
  readonly subnet: string;
  readonly address: string;
  readonly device: DeviceInfoDto;

  constructor(partial: Partial<ContainerInfoDto>) {
    Object.assign(this, partial);
  }
}
