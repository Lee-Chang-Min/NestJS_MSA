// src/auth/schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

export interface UserDocument extends Document, User {
  _id: Types.ObjectId; // _id 타입을 명시적으로 지정
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 사용자 역할을 정의.
export enum UserRole {
  USER = 'USER',
  OPERATOR = 'OPERATOR',
  AUDITOR = 'AUDITOR',
  ADMIN = 'ADMIN',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true })
  @Exclude()
  password: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({ type: String, select: false }) // 기본적으로 조회되지 않도록 select: false 설정
  refreshToken?: string;

  @Prop({ type: Date, select: false }) // 리프레시 토큰 발급 시간
  rtIssuedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

/* ──────────────── 🔐 PRE-SAVE HOOK ──────────────── */
const SALT_ROUNDS = 12; // 보안·성능 균형 지점

UserSchema.pre<UserDocument>('save', async function (next) {
  // passwordHash 필드가 새로 설정되거나 변경된 경우에만 재해시
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// 비밀번호 비교를 위한 인스턴스 메소드
UserSchema.methods.comparePassword = async function (this: UserDocument, candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

//toJSON 메소드를 오버라이드하여 응답에서 password 필드를 제외할 수 있습니다.
// UserSchema.set('toJSON', {
//   transform: (doc, ret) => {
//     delete ret.password; // 응답 객체에서 password 필드 제거
//     // delete ret.currentHashedRefreshToken; // 필요하다면 refreshToken도 제거
//     return ret;
//   },
// });

UserSchema.index({ email: 1 });
