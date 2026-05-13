import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}
  async create(createMenuDto: CreateMenuDto) {
    const { names } = createMenuDto;
    let menu: Menu;
    for (const name of names) {
      menu = await this.menuRepository.create({ name });
      await this.menuRepository.save(menu);
    }
    return {
      message: 'Menus created successfully',
    };
  }

  async findAll() {
    return await this.menuRepository.find();
  }

  async findOne(id: number) {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }
    return menu;
  }

  async update(id: number, updateMenuDto: UpdateMenuDto) {
    const menu = await this.findOne(id);
    const { name } = updateMenuDto;
    menu.name = name ?? menu.name;
    return await this.menuRepository.save(menu);
  }

  async remove(id: number) {
    const menu = await this.findOne(id);
    return await this.menuRepository.remove(menu);
  }
}
