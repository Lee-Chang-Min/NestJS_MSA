import { Injectable } from '@nestjs/common';

@Injectable()
export class GatewayServerService {
  getHello(): string {
    return 'Hello World!';
  }
}
