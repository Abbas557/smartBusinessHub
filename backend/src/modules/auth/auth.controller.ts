import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RegisterCustomerDto,
  RegisterOwnerDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Public, CurrentUser } from '../../common/decorators';
import { JwtPayload } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // ─── POST /api/auth/register ────────────────────────────────────────────────
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return {
      message: 'Account created successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    };
  }

  @Public()
  @Post('register-owner')
  @HttpCode(HttpStatus.CREATED)
  async registerOwner(
    @Body() dto: RegisterOwnerDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerOwner(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return {
      message: 'Business owner account created successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    };
  }

  @Public()
  @Post('register-customer')
  @HttpCode(HttpStatus.CREATED)
  async registerCustomer(
    @Body() dto: RegisterCustomerDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerCustomer(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return {
      message: 'Customer account created successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    };
  }

  // ─── POST /api/auth/login ───────────────────────────────────────────────────
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return {
      message: 'Logged in successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    };
  }

  // ─── POST /api/auth/refresh ─────────────────────────────────────────────────
  // Uses the httpOnly cookie — no body needed
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request & { user: JwtPayload & { refreshToken: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refreshTokens(
      req.user.sub,
      req.user.refreshToken,
    );
    this.setRefreshCookie(res, result.refreshToken);
    return {
      message: 'Token refreshed',
      data: { accessToken: result.accessToken },
    };
  }

  // ─── POST /api/auth/logout ──────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.sub);
    // Clear the cookie
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return { message: 'Logged out successfully' };
  }

  // ─── GET /api/auth/me ───────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return { data: user };
  }

  // ─── GOOGLE OAUTH ──────────────────────────────────────────────────────────
  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleLogin() {
    return;
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(
    @Req() req: Request & {
      user: {
        googleId: string;
        email: string;
        name: string;
        avatarUrl?: string;
      };
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.handleGoogleLogin(req.user);
    this.setRefreshCookie(res, result.refreshToken);
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://127.0.0.1:3000';
    return res.redirect(`${frontendUrl}/dashboard`);
  }

  // ─── PRIVATE HELPERS ───────────────────────────────────────────────────────

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie(
      'refresh_token',
      refreshToken,
      this.authService.getRefreshTokenCookieOptions(),
    );
  }
}
