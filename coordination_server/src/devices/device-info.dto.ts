export class DeviceInfoDto {
  readonly name: string;
  readonly subnet: string;
  readonly address: string;

  constructor(partial: Partial<DeviceInfoDto>) {
    Object.assign(this, partial);
  }
}
