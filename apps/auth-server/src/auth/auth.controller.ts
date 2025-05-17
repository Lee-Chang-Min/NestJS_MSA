import { Controller, Get } from '@nestjs/common';
import { AuthServerService } from './auth.service';

@Controller()
export class AuthServerController {
  constructor(private readonly authServerService: AuthServerService) {}

  @Get()
  getHello(): string {
    return this.authServerService.getHello();
  }
}
