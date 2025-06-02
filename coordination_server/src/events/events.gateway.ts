import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({ path: 'events' })
export class EventsGateway {
  @SubscribeMessage('event')
  handleMessage(client: any, payload: any): string {
    console.log(JSON.stringify(payload));
    return 'Hello world!';
  }
}
