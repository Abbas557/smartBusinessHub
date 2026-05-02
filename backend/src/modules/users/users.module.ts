import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserDao } from './dao/user.dao';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UserDao,     // DAO layer — DB access
    UsersService, // Service layer — business logic
  ],
  exports: [
    UserDao,     // Exported so AuthModule can use it
    UsersService,
  ],
})
export class UsersModule {}
