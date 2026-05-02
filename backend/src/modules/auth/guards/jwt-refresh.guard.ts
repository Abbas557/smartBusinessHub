import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtRefreshGuard
 * Used exclusively on POST /auth/refresh.
 * Triggers the jwt-refresh Passport strategy which reads
 * the httpOnly cookie and validates the refresh token.
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
