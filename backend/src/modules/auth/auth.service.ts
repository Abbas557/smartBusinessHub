import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserDao } from '../users/dao/user.dao';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserDocument } from '../users/user.schema';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  businessId: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Partial<UserDocument>;
  accessToken: string;
  refreshToken: string;
}

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly userDao: UserDao,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── REGISTER ──────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // 1. Check if email is already taken
    const exists = await this.userDao.exists({ email: dto.email.toLowerCase() });
    if (exists) {
      throw new ConflictException('An account with this email already exists');
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    // 3. Create user
    const user = await this.userDao.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
    });

    // 4. Generate tokens
    const tokens = await this.generateTokens(user);

    // 5. Store hashed refresh token in DB
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // ─── LOGIN ─────────────────────────────────────────────────────────────────

  async login(dto: LoginDto): Promise<AuthResponse> {
    // 1. Find user with password field (hidden by default)
    const user = await this.userDao.findByEmailWithPassword(dto.email);
    if (!user) {
      // Use same error message to prevent email enumeration attacks
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Check account is active
    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 4. Generate tokens
    const tokens = await this.generateTokens(user);

    // 5. Store hashed refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // ─── REFRESH ───────────────────────────────────────────────────────────────

  async refreshTokens(
    userId: string,
    incomingRefreshToken: string,
  ): Promise<AuthResponse> {
    // 1. Find user with refreshToken field
    const user = await this.userDao.findByIdWithPassword(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied — please log in again');
    }

    // 2. Compare incoming token against hashed token in DB
    const tokenMatches = await bcrypt.compare(
      incomingRefreshToken,
      user.refreshToken,
    );
    if (!tokenMatches) {
      // Token reuse detected — clear stored token (security measure)
      await this.userDao.updateRefreshToken(userId, null);
      throw new UnauthorizedException(
        'Refresh token invalid — please log in again',
      );
    }

    // 3. Issue new token pair (token rotation)
    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // ─── LOGOUT ────────────────────────────────────────────────────────────────

  async logout(userId: string): Promise<void> {
    // Clear refresh token from DB — cookie cleared by controller
    await this.userDao.updateRefreshToken(userId, null);
  }

  // ─── GOOGLE OAUTH ──────────────────────────────────────────────────────────

  async handleGoogleLogin(googleUser: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<AuthResponse> {
    // Check if user exists by googleId first, then by email
    let user = await this.userDao.findByGoogleId(googleUser.googleId);

    if (!user) {
      user = await this.userDao.findByEmail(googleUser.email);
    }

    if (!user) {
      // New user — create account (no password for OAuth users)
      user = await this.userDao.create({
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.googleId,
        avatarUrl: googleUser.avatarUrl,
      });
    } else if (!user.googleId) {
      // Existing email account — link Google ID
      user = await this.userDao.updateById(user.id, {
        googleId: googleUser.googleId,
        avatarUrl: googleUser.avatarUrl || user.avatarUrl,
      });
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // ─── HELPERS ───────────────────────────────────────────────────────────────

  async generateTokens(user: UserDocument): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      businessId: null, // Populated in BusinessModule when business is created
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashed = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);
    await this.userDao.updateRefreshToken(userId, hashed);
  }

  // Strip sensitive fields before returning user to client
  private sanitizeUser(user: UserDocument): Partial<UserDocument> {
    const obj = user.toObject();
    delete obj.password;
    delete obj.refreshToken;
    delete obj.__v;
    return obj;
  }

  getRefreshTokenCookieOptions() {
    const isProd = this.configService.get('NODE_ENV') === 'production';
    return {
      httpOnly: true,       // Not accessible via JS — XSS protection
      secure: isProd,       // HTTPS only in production
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      path: '/api/auth',    // Cookie only sent to /api/auth routes
    };
  }
}
