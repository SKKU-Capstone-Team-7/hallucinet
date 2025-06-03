import { WsContainerEvent } from './ws-container-event';

export class WsContainerEventPayload {
  token: string;
  event: WsContainerEvent;

  constructor(partial: Partial<WsContainerEventPayload>) {
    Object.assign(this, partial);
  }
}
