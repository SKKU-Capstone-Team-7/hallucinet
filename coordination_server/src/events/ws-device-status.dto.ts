import { WsContainerEvent } from './ws-container-event';

export class WsDeviceStatusPayload {
  readonly token: string;
  readonly containers: WsContainerEvent[];
  readonly pubkey: string;

  constructor(partial: Partial<WsDeviceStatusPayload>) {
    Object.assign(this, partial);
  }
}
