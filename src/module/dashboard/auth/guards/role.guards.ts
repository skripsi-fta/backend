import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorator/role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handlerRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    const moduleRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getClass(),
    );

    const roles = handlerRoles || moduleRoles;

    if (roles.length === 0) {
      return false;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    return roles.includes(user.role);
  }
}
