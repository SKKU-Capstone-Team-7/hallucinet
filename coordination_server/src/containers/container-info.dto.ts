import { DeviceInfoDto } from '../devices/device-info.dto';
export class ContainerInfoDto {
  readonly name: string;
  readonly address: string;
  readonly device: DeviceInfoDto;
  readonly image: string;

  constructor(partial: Partial<ContainerInfoDto>) {
    Object.assign(this, partial);
  }
}
