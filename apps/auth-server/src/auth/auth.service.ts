import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthServerService {
  getHello(): string {
    return 'Hello from Auth Server!';
  }
}
