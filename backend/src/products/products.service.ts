import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from 'src/menus/entities/menu.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { menu, ...rest } = createProductDto;
    if (menu) {
      const foundMenu = await this.menuRepository.findOne({
        where: { id: menu as any },
      });
      if (!foundMenu) {
        throw new NotFoundException('Menu not found');
      }
      createProductDto.menu = foundMenu;
    }
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll() {
    return await this.productRepository.find({ relations: { menu: true } });
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { menu: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    const { menu, ...rest } = updateProductDto;

    if (menu) {
      const foundMenu = await this.menuRepository.findOne({
        where: { id: menu as any },
      });
      if (!foundMenu) {
        throw new NotFoundException('Menu not found');
      }
      product.menu = foundMenu;
    }

    Object.assign(product, rest);
    return this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    return this.productRepository.remove(product);
  }
}
