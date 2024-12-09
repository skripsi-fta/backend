import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LoggerService } from '../../logger/logger.service';

@WebSocketGateway({ cors: true })
export class LiveQueueGateaway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private log: LoggerService) {}
  @WebSocketServer()
  server: Server;

  handleDisconnect(client: any) {
    this.log.info('Client disconnected: ' + client.id);
  }

  handleConnection(client: any) {
    this.log.info('Client connected: ' + client.id);
  }

  @SubscribeMessage('queue')
  handleQueue(client: Socket, body: any) {
    this.server.emit('cashierQueue', {
      message: body,
    });
  }

  sendQueueData(type: string, data: any) {
    this.server.emit(type, data);
  }
}
