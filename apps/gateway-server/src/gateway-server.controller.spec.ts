import { Test, TestingModule } from '@nestjs/testing';
import { GatewayServerController } from './gateway-server.controller';
import { GatewayServerService } from './gateway-server.service';

describe('GatewayServerController', () => {
  let gatewayServerController: GatewayServerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GatewayServerController],
      providers: [GatewayServerService],
    }).compile();

    gatewayServerController = app.get<GatewayServerController>(GatewayServerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(gatewayServerController.getHello()).toBe('Hello World!');
    });
  });
});
