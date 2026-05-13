import {
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateMenuDto {
  @IsArray()
  @IsString({ each: true })
  @MinLength(3, {
    message: 'Each menu name must be at least 3 characters long',
    each: true,
  })
  @MaxLength(50, {
    message: 'Each menu name must be at most 50 characters long',
    each: true,
  })
  names: string[];
}
