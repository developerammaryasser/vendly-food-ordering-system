import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { JWTPayload } from 'src/utils/types';
import { UsersServices } from '../users.services';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/utils/enums';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersServices,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    const roles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'You must be logged in to access this resource',
      );
    }
    try {
      // Verify Token
      const payload: JWTPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      // Check if user exists
      const user = await this.usersService.findOne(payload.id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      // Check the user role
      if (roles && !roles.includes(user.role)) {
        throw new UnauthorizedException(
          'You do not have permission to access this resource',
        );
      }
      req.user = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }
}
