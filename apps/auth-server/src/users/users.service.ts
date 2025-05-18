import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const user = new this.userModel(dto);
    return await user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email });
    return user;
  }

  async update(id: UserDocument['_id'], dto: UpdateUserDto): Promise<UserDocument> {
    this.logger.log(`Updating user with ID: ${JSON.stringify(dto)}`);
    const user = await this.userModel.findById(id);
    // 객체에 변경사항 적용
    if (!user) {
      throw new NotFoundException(`User with ID ${String(id)} not found`);
    }
    Object.assign(user, dto);
    // save 메소드를 호출하여 pre 훅 트리거
    return await user.save();
  }

  async remove(id: UserDocument['_id']): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${String(id)} not found`);
    }
  }
}
