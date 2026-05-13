import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/utils/enums';

export const Roles = (...roles: Role[]) => {
  if (roles.length === 0) {
    roles = Object.values(Role);
  }
  return SetMetadata('roles', roles);
};
