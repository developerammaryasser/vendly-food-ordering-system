import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateMenuDto {
  @IsString()
  @IsOptional()
  @MinLength(3, {
    message: 'Name must be at least 3 characters long',
  })
  @MaxLength(50, {
    message: 'Name must be at most 50 characters long',
  })
  name: string;
}
