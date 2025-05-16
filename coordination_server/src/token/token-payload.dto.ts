export class TokenPayloadDto {
  readonly deviceId: string;

  constructor(partial: Partial<TokenPayloadDto>) {
    Object.assign(this, partial);
  }
}
