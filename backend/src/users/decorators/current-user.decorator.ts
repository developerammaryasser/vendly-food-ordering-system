import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JWTPayload } from 'src/utils/types';

export const CurrentUser = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user: JWTPayload = req.user;
    return user;
  },
);
