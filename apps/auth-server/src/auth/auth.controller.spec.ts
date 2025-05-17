import { Test, TestingModule } from '@nestjs/testing';
import { AuthServerController } from './auth.controller';
import { AuthServerService } from './auth.service';

describe('AuthServerController', () => {
  let authServerController: AuthServerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthServerController],
      providers: [AuthServerService],
    }).compile();

    authServerController = app.get<AuthServerController>(AuthServerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(authServerController.getHello()).toBe('Hello World!');
    });
  });
});
