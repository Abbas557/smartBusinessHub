import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserDao } from '../../users/dao/user.dao';

export interface JwtPayload {
  sub: string;        // userId
  email: string;
  role: string;
  businessId: string | null;
  iat?: number;
  exp?: number;
}

/**
 * JwtStrategy
 * Validates the Bearer token in Authorization header.
 * Attaches decoded payload to request.user on success.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userDao: UserDao,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Verify user still exists and is active
    const user = await this.userDao.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User no longer exists or is inactive');
    }
    // Whatever we return here is attached to request.user
    return payload;
  }
}
