import { Menu } from 'src/menus/entities/menu.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  price: number;
  @Column()
  image: string;
  @ManyToOne(() => Menu, (menu) => menu.products)
  menu: Menu;
  @Column()
  stock: number;
  @Column({ default: () => CURRENT_TIMESTAMP })
  createdAt: Date;
  @Column({ default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
  updatedAt: Date;
}
