import { Role } from './enums';

export type JWTPayload = {
  id: number;
  role: Role;
};

export type JWTTokenType = {
  token: string;
};
