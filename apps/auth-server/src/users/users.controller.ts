import { Controller, Body, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { UsersService } from './users.service';
import { UserDocument } from './schemas/users.schema';
import { MessagePattern, Payload } from '@nestjs/microservices';

const USER_MESSAGE_PATTERNS = {
  // CREATE: 'users.create', => auth register에서 진행
  UPDATE: 'users.update',
  DELETE: 'users.delete',
};

@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  async create(@Body() dto: CreateUserDto): Promise<{ result: string; id: string; message: string }> {
    const user: UserDocument = await this.usersService.create(dto);
    this.logger.log(`User created: ${user._id.toString()}`);
    return {
      result: 'success',
      id: user._id.toString(),
      message: '사용자가 성공적으로 생성되었습니다.',
    };
  }

  /**
   * 사용자 업데이트
   */
  @MessagePattern(USER_MESSAGE_PATTERNS.UPDATE)
  async update(@Payload() updateUserDto: UpdateUserDto): Promise<{ result: string; id: string; message: string }> {
    this.logger.debug(`사용자 업데이트 요청 수신: ${USER_MESSAGE_PATTERNS.UPDATE}`);
    const updatedUser = await this.usersService.update(updateUserDto);
    this.logger.log(`사용자 업데이트 완료: ${updatedUser._id.toString()}`);
    return {
      result: 'success',
      id: updatedUser._id.toString(),
      message: '사용자가 성공적으로 업데이트 되었습니다.',
    };
  }

  /**
   * 사용자 삭제
   */
  @MessagePattern(USER_MESSAGE_PATTERNS.DELETE)
  async remove(@Payload() id: UserDocument['_id']): Promise<{ result: string; message: string; statusCode: number }> {
    this.logger.debug(`사용자 삭제 요청 수신: ${USER_MESSAGE_PATTERNS.DELETE}`);
    await this.usersService.remove(id);
    this.logger.log(`사용자 삭제 완료: ${id.toString()}`);
    return {
      result: 'success',
      message: '사용자가 성공적으로 삭제되었습니다.',
      statusCode: 204,
    };
  }
}
