import { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const requireRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    // const isAuthorize = requireRoles.includes(user.role);
    const isAuthorize = requireRoles.some((role: UserRole) => {
      return user.role?.includes(role);
    });

    if (!isAuthorize) {
      throw new Error('Un-Authorize User');
    }

    return true;
  }
}
