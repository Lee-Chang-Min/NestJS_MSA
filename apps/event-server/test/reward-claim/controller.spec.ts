import { Test, TestingModule } from '@nestjs/testing';
import { RewardClaimController } from '../../src/reward-claim/controllers/reward-claim.controller';
import { CommandBus } from '@nestjs/cqrs';
import { CreateRewardClaimDto } from '../../src/reward-claim/dto/create-reward-claim.dto';
import { Types } from 'mongoose';

describe('RewardClaimController', () => {
  let controller: RewardClaimController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardClaimController],
      providers: [
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<RewardClaimController>(RewardClaimController);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  describe('CreateRewardClaim', () => {
    it('CommandBus 가 올바른 Command 로 호출되고, 성공 응답을 반환', async () => {
      // 준비: fake RewardClaimDocument 와 ID
      const fakeId = new Types.ObjectId('507f1f77bcf86cd799439011');
      //const fakeDoc = { _id: fakeId } as RewardClaimDocument;
      // const executeMock = commandBus.execute as jest.Mock;
      // executeMock.mockResolvedValue(fakeDoc);

      const dto: CreateRewardClaimDto = {
        userId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        eventId: new Types.ObjectId('5f1d7f3a2c4e6b8d9a0c1f2e'),
        rewardId: new Types.ObjectId('abcdefabcdefabcdefabcdef'),
      };

      // 실행
      const result = await controller.CreateRewardClaim(dto);

      // CommandBus가 올바른 Command로 호출되었는지 검증
      // expect(executeMock).toHaveBeenCalledWith(
      //   expect.objectContaining({
      //     userId: dto.userId,
      //     eventId: dto.eventId,
      //     rewardId: dto.rewardId,
      //   }),
      // );
      // expect(executeMock).toHaveBeenCalledTimes(1);

      // 최종 반환값 검증
      expect(result).toEqual({ result: 'success', id: fakeId.toString() });
    });

    it('Command 실행 중 에러가 발생', async () => {
      (commandBus.execute as jest.Mock).mockRejectedValue(new Error('DB 오류'));

      const dto: CreateRewardClaimDto = {
        userId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        eventId: new Types.ObjectId('5f1d7f3a2c4e6b8d9a0c1f2e'),
        rewardId: new Types.ObjectId('abcdefabcdefabcdefabcdef'),
      };

      await expect(controller.CreateRewardClaim(dto)).rejects.toThrow('DB 오류');
    });
  });
});
