import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Menu } from 'src/menus/entities/menu.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsNumber()
  @IsNotEmpty()
  price: number;
  @IsString()
  @IsNotEmpty()
  image: string;
  @Type(() => Menu)
  menu: Menu;
  @IsNumber()
  @IsNotEmpty()
  stock: number;
}
