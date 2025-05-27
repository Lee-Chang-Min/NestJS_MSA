import { IQuery } from '@nestjs/cqrs';

export class GetRewardClaimQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
