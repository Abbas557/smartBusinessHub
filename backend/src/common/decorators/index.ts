import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

// ─── @CurrentUser() ───────────────────────────────────────────────────────────
// Extracts the authenticated user from the request object.
// Usage: getProfile(@CurrentUser() user: JwtPayload)
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    // If a specific field is requested (e.g. @CurrentUser('email')), return that field
    return data ? user?.[data] : user;
  },
);

// ─── @Roles() ─────────────────────────────────────────────────────────────────
// Sets metadata for RolesGuard to check against.
// Usage: @Roles(Role.BUSINESS_OWNER)
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// ─── @Public() ────────────────────────────────────────────────────────────────
// Marks a route as publicly accessible — bypasses JwtAuthGuard.
// Usage: @Public() on any controller method
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
