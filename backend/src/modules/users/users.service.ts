import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserDao } from './dao/user.dao';
import { UpdateUserDto, ChangePasswordDto } from './dto/update-user.dto';
import { UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly userDao: UserDao) {}

  // ─── GET PROFILE ───────────────────────────────────────────────────────────

  async getProfile(userId: string): Promise<UserDocument> {
    const user = await this.userDao.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ─── UPDATE PROFILE ────────────────────────────────────────────────────────

  async updateProfile(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<UserDocument> {
    const user = await this.userDao.updateById(userId, dto);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ─── CHANGE PASSWORD ───────────────────────────────────────────────────────

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userDao.findByIdWithPassword(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!user.password) {
      throw new BadRequestException(
        'Cannot change password for OAuth accounts. Use Google sign-in.',
      );
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.userDao.updateById(userId, { password: hashed });

    return { message: 'Password updated successfully' };
  }

  // ─── DEACTIVATE ACCOUNT ────────────────────────────────────────────────────

  async deactivate(userId: string): Promise<{ message: string }> {
    const user = await this.userDao.updateById(userId, { isActive: false });
    if (!user) throw new NotFoundException('User not found');
    return { message: 'Account deactivated' };
  }
}
