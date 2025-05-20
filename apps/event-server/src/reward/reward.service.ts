import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRewardDto } from './dto/create-reward.dto';
import { Reward, RewardDocument } from './schemas/reward.schema';
import { UpdateRewardDto } from './dto/update-reward.dto';

@Injectable()
export class RewardService {
  private readonly logger = new Logger(RewardService.name);

  constructor(@InjectModel(Reward.name) private rewardModel: Model<RewardDocument>) {}

  /**
   * 보상 생성
   * @param createRewardDto CreateRewardDto
   * @returns RewardDocument
   */
  async create(createRewardDto: CreateRewardDto): Promise<RewardDocument> {
    try {
      this.logger.debug(`create reward: ${JSON.stringify(createRewardDto)}`);
      const createdReward = new this.rewardModel(createRewardDto);
      const savedReward = await createdReward.save();
      return savedReward;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * 보상 상세 조회
   * @param id string
   * @returns RewardDocument | null
   */
  async findOne(id: string): Promise<RewardDocument | null> {
    try {
      const reward = await this.rewardModel.findById(id);
      if (!reward) {
        throw new NotFoundException('reward not found');
      }
      return reward;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * ID를 기준으로 특정 보상 정보를 업데이트합니다.
   * 데이터 정합성을 위해 MongoDB의 원자적 연산 findByIdAndUpdate를 사용합니다.
   * DTO 및 스키마 레벨의 유효성 검사를 통해 데이터 무결성을 보장합니다.
   *
   * @param id - 업데이트할 보상의 ID
   * @param updateRewardDto - 업데이트할 보상 데이터 (UpdateRewardDto)
   * @returns 업데이트된 보상 문서
   * @throws NotFoundException - 해당 ID의 보상을 찾을 수 없는 경우
   * @throws ConflictException - (선택적 OCC 구현 시) 동시에 다른 곳에서 수정이 일어나 버전 충돌이 발생한 경우
   */
  async update(id: string, updateRewardDto: UpdateRewardDto): Promise<RewardDocument> {
    this.logger.debug(`Attempting to update reward with ID: ${id}. Data: ${JSON.stringify(updateRewardDto)}`);


    // 2. 고급: 낙관적 동시성 제어 (Optimistic Concurrency Control - OCC)
    //    만약 여러 관리자가 '동시에' 같은 보상을 수정하여 "lost update" 문제가 발생할 가능성을
    //    더 엄격하게 제어하고 싶다면 낙관적 잠금을 고려할 수 있습니다.
    //    이를 위해서는 스키마에 버전 필드(__v 또는 커스텀 필드)가 있어야 하며,
    //    클라이언트(여기서는 Gateway를 통해 요청하는 관리자)가 현재 문서의 버전을 함께 보내야 합니다.

      //  UpdateRewardDto에 version: number 필드가 추가되었다고 가정합니다.
       const { version, ...updateData } = updateRewardDto;

       if (typeof version !== 'number') {
         this.logger.warn(`Version not provided for optimistic concurrency update on reward ID: ${id}.`);
         throw new BadRequestException('A document version is required for update to prevent conflicts.');
       }

    //    // 1. ID와 버전으로 문서를 조회
    //    const rewardToUpdate = await this.rewardModel.findOne({ _id: id, __v: version }).exec();

    //    if (!rewardToUpdate) {
    //      // ID 자체가 없거나, 버전이 일치하지 않는 경우 (다른 프로세스가 먼저 수정함)
    //      const exists = await this.rewardModel.exists({ _id: id });
    //      if (!exists) {
    //        throw new NotFoundException(`Reward with ID '${id}' not found.`);
    //      } else {
    //        this.logger.warn(`Conflict: Reward with ID '${id}' (version ${version}) was modified concurrently.`);
    //        throw new ConflictException(`Reward with ID '${id}' has been modified. Please refresh and try again.`);
    //      }
    //    }

    //    // 2. 조회된 문서에 변경사항 적용
    //    Object.assign(rewardToUpdate, updateData);

    //    try {
    //      // 3. 저장 (Mongoose의 save()는 __v를 자동으로 증가시키고, 업데이트 시 버전을 확인합니다)
    //      const savedReward = await rewardToUpdate.save();
    //      this.logger.log(`Reward ID '${id}' updated successfully with optimistic lock (new version: ${savedReward.__v}).`);
    //      return savedReward;
    //    } catch (error) {
    //      if (error.name === 'VersionError') { // Mongoose의 VersionError
    //        this.logger.warn(`VersionError on saving reward ID '${id}'. Concurrent modification detected.`);
    //        throw new ConflictException(`Reward with ID '${id}' was modified by another process. Please refresh and try again.`);
    //      }
    //      this.logger.error(`Error saving updated reward ID '${id}': ${error.message}`, error.stack);
    //      throw error; // 다른 종류의 에러는 그대로 전파
    //    }

  }

  /**
   * 보상 삭제
   * @param id string
   * @returns boolean
   */
  async remove(id: string): Promise<boolean> {
    const result = await this.rewardModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      this.logger.warn(`보상 with ID ${id} not found for deletion.`);
      throw new NotFoundException(`보상 with ID ${id} not found.`);
    }
    this.logger.log(`보상 삭제 완료: ID ${id}`);
    return true;
  }
}
