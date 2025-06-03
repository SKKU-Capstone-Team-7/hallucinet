export class WsPingPayload {
  readonly token: string;

  constructor(partial: Partial<WsPingPayload>) {
    Object.assign(this, partial);
  }
}
