import {
  Controller,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  HttpException,
  Logger,
  ConflictException,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MongoError } from 'mongodb';
// import { UpdateUserDto } from './dto/update-user.dto';

import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserDocument } from './schemas/users.schema';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@ApiTags('Users')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({ path: 'v1/users', version: '1' })
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user (ADMIN, OPERATOR, AUDITOR) 생성 위주 User 경우 auth register에서 진행' })
  @ApiResponse({ status: 201, description: 'User created.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto): Promise<{ result: string; id: string; message: string }> {
    try {
      const user: UserDocument = await this.usersService.create(dto);
      this.logger.log(`User created: ${user._id.toString()}`);
      return {
        result: 'success',
        id: user._id.toString(),
        message: '사용자가 성공적으로 생성되었습니다.',
      };
    } catch (error) {
      this.logger.error(`User creation failed: ${error}`);
      if ((error as MongoError).code === 11000) {
        throw new ConflictException(`이미 존재하는 value 입니다.`);
      }
      throw new HttpException(
        {
          result: 'fail',
          message: '사용자 생성 중 오류가 발생했습니다.',
          error: (error as Error).message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'User ID',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', new ParseObjectIdPipe()) id: UserDocument['_id'],
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ result: string; id: string; message: string }> {
    try {
      const updatedUser = await this.usersService.update(id, updateUserDto);
      if (!updatedUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      this.logger.log(`User updated: ${updatedUser._id.toString()}`);
      return {
        result: 'success',
        id: updatedUser._id.toString(),
        message: '사용자가 성공적으로 업데이트 되었습니다.',
      };
    } catch (error) {
      this.logger.error(`User update failed: ${error}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          result: 'fail',
          message: '사용자 업데이트 중 오류가 발생했습니다.',
          error: (error as Error).message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 204, description: 'User deleted.' })
  async remove(@Param('id', new ParseObjectIdPipe()) id: UserDocument['_id']): Promise<void> {
    try {
      await this.usersService.remove(id);
      this.logger.log(`User deleted: ${id.toString()}`);
    } catch (error) {
      this.logger.error(`User delete failed: ${error}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          result: 'fail',
          message: '사용자 삭제 중 오류가 발생했습니다.',
          error: (error as Error).message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
