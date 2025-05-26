export class CreateTokenDto {
  readonly deviceId: string;

  constructor(partial: Partial<CreateTokenDto>) {
    Object.assign(this, partial);
  }
}
