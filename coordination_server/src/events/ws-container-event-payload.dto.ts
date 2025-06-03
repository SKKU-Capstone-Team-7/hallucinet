import { WsContainerEvent } from './ws-container-event';

export class WsContainerEventPayload {
  readonly token: string;
  readonly event: WsContainerEvent;

  constructor(partial: Partial<WsContainerEventPayload>) {
    Object.assign(this, partial);
  }
}
