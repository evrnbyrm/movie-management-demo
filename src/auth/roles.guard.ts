import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { get as getProperty } from 'dot-prop'
import { ROLES_KEY } from './roles.decorator'
import { UserRole } from '../utils/common.enums'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const authorizedRoles = this.reflector.get<UserRole[]>(ROLES_KEY, context.getHandler()) || []

    if (!authorizedRoles) {
      return true
    }
    const userRole = getProperty(context.switchToHttp().getRequest(), 'user.role', '')

    if (!userRole || !authorizedRoles.includes(userRole)) {
      throw new ForbiddenException('You are not allowed to perform this action')
    }

    return true
  }
}
